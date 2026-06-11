"use client";

import { useEffect } from "react";
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

function isPrivateRoute(pathname: string | null) {
  return pathname === "/admin" || pathname?.startsWith("/admin/") || false;
}

export default function ElevenLabsWidget() {
  const pathname = usePathname();
  const isPrivate = isPrivateRoute(pathname);

  useEffect(() => {
    if (isPrivate) {
      return;
    }

    // Defer the widget script so it never competes with initial page load:
    // load on first user interaction, or when the browser goes idle.
    let loaded = false;
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const interactionEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    const cleanupTriggers = () => {
      for (const eventName of interactionEvents) {
        window.removeEventListener(eventName, loadScript);
      }
      if (idleHandle !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) {
        clearTimeout(timeoutHandle);
      }
    };

    function loadScript() {
      if (loaded) return;
      loaded = true;
      cleanupTriggers();

      const existingScript =
        document.getElementById("elevenlabs-convai-widget-script") ||
        document.querySelector(`script[src="${ELEVENLABS_WIDGET_SCRIPT_SRC}"]`);

      if (existingScript) {
        return;
      }

      const script = document.createElement("script");
      script.id = "elevenlabs-convai-widget-script";
      script.src = ELEVENLABS_WIDGET_SCRIPT_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    for (const eventName of interactionEvents) {
      window.addEventListener(eventName, loadScript, { once: true, passive: true });
    }
    if ("requestIdleCallback" in window) {
      idleHandle = window.requestIdleCallback(loadScript, { timeout: 5000 });
    } else {
      timeoutHandle = setTimeout(loadScript, 5000);
    }

    return cleanupTriggers;
  }, [isPrivate]);

  if (isPrivate) {
    return null;
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
