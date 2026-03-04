import { useEffect } from "react";
import { useLocation } from "wouter";
import { trackPageView } from "../lib/analytics";

export const useAnalytics = () => {
  const [location] = useLocation();

  useEffect(() => {
    if (location.startsWith("/admin")) return;
    trackPageView(location);
  }, [location]);
};
