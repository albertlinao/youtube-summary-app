import Link from "next/link";
import { Button, Group, Text } from "@mantine/core";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <Group gap="sm">
      <Text size="sm">Hey, {user.email}!</Text>
      <LogoutButton />
    </Group>
  ) : (
    <Group gap="xs">
      <Button component={Link} href="/auth/login" variant="outline" size="xs">
        Sign in
      </Button>
      <Button component={Link} href="/auth/sign-up" size="xs">
        Sign up
      </Button>
    </Group>
  );
}
