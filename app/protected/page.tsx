import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { UrlForm } from "@/components/ytsummary/url-form";
import { UrlTable } from "@/components/ytsummary/url-table";
import { addUrlAction } from "@/app/protected/actions";
import { Stack, Text, Title } from "@mantine/core";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  const { data: urlRows } = await supabase
    .from("url_table")
    .select(
      "id,url,count,video_duration,created_at,url_summary_table(summary_id,is_favorite,summary_table(id,summary,created_at))",
    )
    .order("created_at", { ascending: false });

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>YTSummary</Title>
        <Text c="dimmed">
          Drop a YouTube link and let Gemini create a summary in seconds.
        </Text>
      </Stack>
      <UrlForm action={addUrlAction} />
      <UrlTable rows={urlRows ?? []} />
    </Stack>
  );
}
