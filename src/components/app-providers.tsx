"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </TooltipProvider>
      </HelmetProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
