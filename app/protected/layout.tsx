import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { Box, Container, Group, Text } from "@mantine/core";
import Link from "next/link";
import { Suspense } from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
        {children}
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
