"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    try {
      await fetch("/api/admin/session", { method: "DELETE" });
    } catch {
      // Clearing the cookie is best effort; the redirect below still gets the
      // patient list off the screen, which is the point of the button.
    }
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  );
}
