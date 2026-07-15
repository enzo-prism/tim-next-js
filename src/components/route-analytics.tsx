"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, trackPageView } from "@/lib/analytics";
import { captureLeadAttribution } from "@/lib/lead-attribution";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initGA();
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    captureLeadAttribution();
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
