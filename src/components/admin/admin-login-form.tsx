"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const isSafeRedirect = (value: string | null) =>
  Boolean(value) && value!.startsWith("/admin") && !value!.startsWith("//");

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        setError(payload?.message || "Sign in failed. Try again.");
        setSubmitting(false);
        return;
      }

      const next = searchParams.get("next");
      // router.refresh() so the freshly set cookie is used for the next fetch.
      router.replace(isSafeRedirect(next) ? next! : "/admin");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
            Family First Smile Care
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">
            Patient leads
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the practice password to view your leads.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "admin-password-error" : undefined}
              />
            </div>

            {error ? (
              <p
                id="admin-password-error"
                role="alert"
                className="text-sm font-medium text-destructive"
              >
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={submitting || password.length === 0}
            >
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          This page shows patient contact details. Do not share the password
          outside the practice.
        </p>
      </div>
    </main>
  );
}
