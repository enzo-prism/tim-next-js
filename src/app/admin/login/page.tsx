import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = {
  ...buildRouteMetadata("/admin"),
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
