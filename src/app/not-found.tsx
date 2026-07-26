import type { Metadata } from "next";
import NotFoundPage from "@/legacy-pages/not-found";

export const metadata: Metadata = {
  title: "Page Not Found | Family First Smile Care",
  description:
    "The page you requested could not be found. Return to Family First Smile Care or contact our Los Gatos dental office for help.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {},
};

export default function NotFound() {
  return <NotFoundPage />;
}
