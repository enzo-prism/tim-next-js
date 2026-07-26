"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

const ELEVENLABS_WIDGET_SCRIPT_SRC =
  "https://cdn.jsdelivr.net/npm/@elevenlabs/convai-widget-embed@0.11.4";
const ELEVENLABS_AGENT_ID = "agent_4801kn7ednjse6drbr2cnt62kkp2";
const ELEVENLABS_TEXT_CONTENTS = JSON.stringify({
  main_label: "Need help?",
  start_call: "Talk with us",
  start_chat: "Send a message",
  expand: "Open assistant",
  collapse: "Close assistant",
});

function isSuppressedRoute(pathname: string | null) {
  return (
    pathname === "/admin" ||
    pathname?.startsWith("/admin/") ||
    pathname === "/contact" ||
    pathname === "/book-appointment"
  );
}

export default function ElevenLabsWidget() {
  const pathname = usePathname();
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const loadAssistant = () => {
    if (status === "loading" || status === "ready") return;

    setStatus("loading");
    if (customElements.get("elevenlabs-convai")) {
      setStatus("ready");
      return;
    }

    const existingScript = document.getElementById(
      "elevenlabs-convai-widget-script",
    ) as HTMLScriptElement | null;
    const script = existingScript ?? document.createElement("script");

    const handleReady = () => setStatus("ready");
    const handleError = () => {
      script.remove();
      setStatus("error");
    };
    script.addEventListener("load", handleReady, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.id = "elevenlabs-convai-widget-script";
      script.src = ELEVENLABS_WIDGET_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }
  };

  if (isSuppressedRoute(pathname)) {
    return null;
  }

  if (status !== "ready") {
    return (
      <div className="fixed bottom-4 right-4 z-[90] sm:bottom-6 sm:right-6">
        <button
          type="button"
          data-testid="assistant-launcher"
          onClick={loadAssistant}
          disabled={status === "loading"}
          className="min-h-11 rounded-lg border border-primary/25 bg-card px-4 text-sm font-semibold text-primary shadow-sm hover:border-primary/45 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
        >
          {status === "loading"
            ? "Opening assistant…"
            : status === "error"
              ? "Try assistant again"
              : "Need help?"}
        </button>
        <span className="sr-only" aria-live="polite">
          {status === "loading"
            ? "Loading the Family First Smile Care assistant"
            : status === "error"
              ? "The assistant did not load"
              : ""}
        </span>
      </div>
    );
  }

  return (
    <elevenlabs-convai
      agent-id={ELEVENLABS_AGENT_ID}
      dismissible="true"
      action-text="Need help?"
      start-call-text="Talk with us"
      expand-text="Open assistant"
      text-contents={ELEVENLABS_TEXT_CONTENTS}
      avatar-orb-color-1="#0369a1"
      avatar-orb-color-2="#7dd3fc"
      className="elevenlabs-widget"
      data-widget="elevenlabs-convai"
    />
  );
}
