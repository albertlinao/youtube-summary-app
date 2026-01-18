import { Badge, Button, Group } from "@mantine/core";

export function EnvVarWarning() {
  return (
    <Group gap="sm">
      <Badge variant="outline">Supabase environment variables required</Badge>
      <Group gap="xs">
        <Button size="xs" variant="outline" disabled>
          Sign in
        </Button>
        <Button size="xs" disabled>
          Sign up
        </Button>
      </Group>
    </Group>
  );
}
