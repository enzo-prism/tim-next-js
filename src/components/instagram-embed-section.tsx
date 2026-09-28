"use client";

import { useEffect, useRef, type ReactNode } from "react";

type InstagramEmbedSectionProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Section wrapper that loads Instagram's embed script only when the section is
 * near the viewport, then upgrades any `blockquote.instagram-media` inside it.
 */
export default function InstagramEmbedSection({ children, className }: InstagramEmbedSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadInstagram = () => {
      const existing = document.getElementById("instagram-embed-script");
      if (existing) {
        // @ts-expect-error instagram global is injected by the script
        window.instgrm?.Embeds?.process?.();
        return;
      }

      const script = document.createElement("script");
      script.id = "instagram-embed-script";
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      script.onload = () => {
        // @ts-expect-error instagram global is injected by the script
        window.instgrm?.Embeds?.process?.();
      };
      document.body.appendChild(script);
    };

    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window)) {
      loadInstagram();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadInstagram();
        observer.disconnect();
      },
      { rootMargin: "400px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={className}>
      {children}
    </section>
  );
}
