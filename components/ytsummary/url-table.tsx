"use client";

import { useMemo, useState } from "react";
import { toggleFavoriteAction } from "@/app/protected/actions";
import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";

type SummaryRelation = {
  summary_id: string;
  is_favorite: boolean;
  summary_table: {
    id: string;
    summary: string;
    created_at: string;
  } | null;
};

type UrlRow = {
  id: string;
  url: string;
  count: number;
  video_duration: number;
  created_at: string;
  url_summary_table: SummaryRelation[] | null;
};

const formatDuration = (seconds: number) => {
  if (!seconds) {
    return "0s";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const parts = [];
  if (hours) {
    parts.push(`${hours}h`);
  }
  if (minutes) {
    parts.push(`${minutes}m`);
  }
  if (remainingSeconds || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(" ");
};

const getLatestSummary = (relations: SummaryRelation[] | null) => {
  if (!relations?.length) {
    return null;
  }

  return relations
    .filter((relation) => relation.summary_table)
    .sort((a, b) => {
      const first = new Date(a.summary_table?.created_at ?? 0).getTime();
      const second = new Date(b.summary_table?.created_at ?? 0).getTime();
      return second - first;
    })[0];
};

export function UrlTable({ rows }: { rows: UrlRow[] }) {
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const sortedRows = useMemo(() => {
    const nextRows = [...rows];
    nextRows.sort((a, b) => {
      if (sortDirection === "asc") {
        return a.video_duration - b.video_duration;
      }
      return b.video_duration - a.video_duration;
    });
    return nextRows;
  }, [rows, sortDirection]);

  if (!rows.length) {
    return (
      <Paper withBorder p="lg">
        <Text size="sm" c="dimmed" ta="center">
          Add your first YouTube URL to generate a summary.
        </Text>
      </Paper>
    );
  }

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Text size="sm" fw={600} tt="uppercase" c="dimmed">
          Saved summaries
        </Text>
        <Button
          variant="light"
          size="xs"
          onClick={() =>
            setSortDirection((direction) =>
              direction === "asc" ? "desc" : "asc",
            )
          }
        >
          Sort by time saved ({sortDirection})
        </Button>
      </Group>
      <Stack gap="md">
        {sortedRows.map((row) => {
          const latestSummary = getLatestSummary(row.url_summary_table);
          const summaryText =
            latestSummary?.summary_table?.summary ?? "Summary unavailable.";

          return (
            <Card key={row.id} withBorder radius="md" padding="lg">
              <Stack gap="sm">
                <Stack gap={4}>
                  <Text fw={600}>{row.url}</Text>
                  <Text size="sm" c="dimmed">
                    {summaryText}
                  </Text>
                </Stack>
                <Group gap="xs" wrap="wrap">
                  <Badge variant="light">Times submitted: {row.count}</Badge>
                  <Badge variant="outline">
                    TIME SAVED: {formatDuration(row.video_duration)}
                  </Badge>
                </Group>
                {latestSummary ? (
                  <Box>
                    <form action={toggleFavoriteAction}>
                      <input type="hidden" name="urlId" value={row.id} />
                      <input
                        type="hidden"
                        name="summaryId"
                        value={latestSummary.summary_id}
                      />
                      <input
                        type="hidden"
                        name="isFavorite"
                        value={String(latestSummary.is_favorite)}
                      />
                      <Button
                        type="submit"
                        variant={latestSummary.is_favorite ? "filled" : "light"}
                        color={latestSummary.is_favorite ? "yellow" : "gray"}
                        size="xs"
                      >
                        {latestSummary.is_favorite ? "★ Favorite" : "☆ Favorite"}
                      </Button>
                    </form>
                  </Box>
                ) : null}
              </Stack>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
}
