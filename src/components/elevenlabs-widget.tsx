"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ELEVENLABS_WIDGET_SCRIPT_SRC =
  "https://unpkg.com/@elevenlabs/convai-widget-embed@0.11.4";
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
