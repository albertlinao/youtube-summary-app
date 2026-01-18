"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { AddUrlState } from "@/app/protected/actions";
import { Button, Group, Paper, Stack, Text, TextInput } from "@mantine/core";

const initialState: AddUrlState = { message: null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending}>
      {pending ? "Summarizing..." : "Summarize"}
    </Button>
  );
}

export function UrlForm({
  action,
}: {
  action: (prevState: AddUrlState, formData: FormData) => Promise<AddUrlState>;
}) {
  const [state, formAction] = useFormState(action, initialState);

  return (
    <Paper withBorder radius="md" p="lg" component="form" action={formAction}>
      <Stack gap="sm">
        <Text fw={600}>Paste a YouTube URL</Text>
        <Group align="flex-end" grow>
          <TextInput
            id="url"
            name="url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <SubmitButton />
        </Group>
        {state.message ? (
          <Text size="xs" c="dimmed">
            {state.message}
          </Text>
        ) : null}
      </Stack>
    </Paper>
  );
}
