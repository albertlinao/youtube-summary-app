"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_KEY =
  process.env.GOOGLE_API_KEY || "AIzaSyDmFiseC5dqKKId4uUtujFGrZ50MUgFmkE";

export type AddUrlState = {
  message: string | null;
};

function extractYouTubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "");
    }

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return videoId;
      }

      const pathParts = parsed.pathname.split("/").filter(Boolean);
      const shortsIndex = pathParts.indexOf("shorts");
      if (shortsIndex >= 0 && pathParts[shortsIndex + 1]) {
        return pathParts[shortsIndex + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

function parseIsoDurationToSeconds(duration: string) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return 0;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);

  return hours * 3600 + minutes * 60 + seconds;
}

async function fetchVideoDurationSeconds(videoId: string) {
  const apiKey =
    process.env.YOUTUBE_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    GEMINI_API_KEY;

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoId}&key=${apiKey}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    return 0;
  }

  const data = (await response.json()) as {
    items?: Array<{ contentDetails?: { duration?: string } }>;
  };

  const duration = data.items?.[0]?.contentDetails?.duration;
  if (!duration) {
    return 0;
  }

  return parseIsoDurationToSeconds(duration);
}

async function summarizeUrl(url: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Make me a summary for this video, ${url}`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Gemini summary request failed.");
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>;
      };
    }>;
  };

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ??
    "Summary unavailable."
  );
}

export async function addUrlAction(
  _prevState: AddUrlState,
  formData: FormData,
): Promise<AddUrlState> {
  const url = String(formData.get("url") || "").trim();
  if (!url) {
    return { message: "Please provide a YouTube URL." };
  }

  let parsedUrl: URL | null = null;
  try {
    parsedUrl = new URL(url);
  } catch {
    return { message: "Please provide a valid URL." };
  }

  if (
    !parsedUrl.hostname.includes("youtube.com") &&
    !parsedUrl.hostname.includes("youtu.be")
  ) {
    return { message: "Only YouTube URLs are supported right now." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { message: "Please sign in to submit URLs." };
  }

  const { data: existingUrl, error: existingError } = await supabase
    .from("url_table")
    .select("id,count")
    .eq("user_id", user.id)
    .eq("url", url)
    .maybeSingle();

  if (existingError) {
    return { message: "Unable to check the existing URL." };
  }

  if (existingUrl) {
    await supabase
      .from("url_table")
      .update({ count: existingUrl.count + 1 })
      .eq("id", existingUrl.id);

    revalidatePath("/protected");
    return { message: "We already have this URL. Count updated." };
  }

  let videoDuration = 0;
  const videoId = extractYouTubeVideoId(url);
  if (videoId) {
    videoDuration = await fetchVideoDurationSeconds(videoId);
  }

  const { data: urlRow, error: urlError } = await supabase
    .from("url_table")
    .insert({
      user_id: user.id,
      url,
      count: 1,
      video_duration: videoDuration,
    })
    .select("id")
    .single();

  if (urlError || !urlRow) {
    return { message: "Unable to save this URL." };
  }

  let summaryText = "Summary unavailable.";
  try {
    summaryText = await summarizeUrl(url);
  } catch {
    summaryText = "Summary unavailable.";
  }

  const { data: summaryRow, error: summaryError } = await supabase
    .from("summary_table")
    .insert({
      user_id: user.id,
      summary: summaryText,
    })
    .select("id")
    .single();

  if (summaryError || !summaryRow) {
    return { message: "Unable to save the summary." };
  }

  const { error: relationError } = await supabase
    .from("url_summary_table")
    .insert({
      url_id: urlRow.id,
      summary_id: summaryRow.id,
      is_favorite: false,
    });

  if (relationError) {
    return { message: "Unable to link the URL and summary." };
  }

  revalidatePath("/protected");
  return { message: "Summary created!" };
}

export async function toggleFavoriteAction(formData: FormData) {
  const urlId = String(formData.get("urlId") || "");
  const summaryId = String(formData.get("summaryId") || "");
  const isFavorite = formData.get("isFavorite") === "true";

  if (!urlId || !summaryId) {
    return;
  }

  const supabase = await createClient();
  await supabase
    .from("url_summary_table")
    .update({ is_favorite: !isFavorite })
    .eq("url_id", urlId)
    .eq("summary_id", summaryId);

  revalidatePath("/protected");
}
