import type { Metadata } from "next";
import TeamPage from "@/legacy-pages/team";
import { buildRouteMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildRouteMetadata("/team");

export default function Page() {
  return <TeamPage />;
}
