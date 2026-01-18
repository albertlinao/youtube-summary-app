import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <Box component="main" style={{ minHeight: "100vh" }}>
      <Box
        component="nav"
        style={{ borderBottom: "1px solid var(--mantine-color-gray-3)" }}
      >
        <Container size="lg" py="sm">
          <Group justify="space-between" align="center">
            <Text fw={600} size="sm">
              <Link href="/">YTSummary</Link>
            </Text>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </Group>
        </Container>
      </Box>

      <Container size="lg" py="xl">
        <Stack gap="xl">
          <Stack gap="sm">
            <Title order={1}>Save time with instant YouTube summaries.</Title>
            <Text c="dimmed">
              YTSummary analyzes YouTube videos with Gemini AI and stores your
              personal library of summaries so you can revisit them anytime.
            </Text>
            <Group>
              <Button component={Link} href="/protected">
                Open dashboard
              </Button>
              <Button
                component={Link}
                href="/auth/sign-up"
                variant="outline"
              >
                Create account
              </Button>
            </Group>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {[
              {
                title: "Add a YouTube link",
                description: "Paste any video URL and track how often it appears.",
              },
              {
                title: "Gemini-powered summaries",
                description: "Instantly generate a concise recap of each video.",
              },
              {
                title: "Track time saved",
                description: "Sort by video length to focus on the biggest wins.",
              },
            ].map((feature) => (
              <Card key={feature.title} withBorder padding="lg" radius="md">
                <Stack gap="xs">
                  <Text fw={600}>{feature.title}</Text>
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>

      <Box
        component="footer"
        style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        py="md"
      >
        <Container size="lg">
          <Text size="xs" c="dimmed">
            Built with Supabase + Gemini for video summaries.
          </Text>
        </Container>
      </Box>
    </Box>
  );
}
