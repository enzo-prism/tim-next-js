"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "@/lib/queryClient";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </TooltipProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
