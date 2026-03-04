"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initGA, initHotjar, trackPageView } from "@/lib/analytics";

export default function RouteAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    initGA();
    initHotjar();
  }, []);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
