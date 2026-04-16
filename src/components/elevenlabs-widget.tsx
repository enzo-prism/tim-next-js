"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

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

  if (isPrivateRoute(pathname)) {
    return null;
  }

  return (
    <>
      <Script
        id="elevenlabs-convai-widget-script"
        src={ELEVENLABS_WIDGET_SCRIPT_SRC}
        strategy="lazyOnload"
      />
      <elevenlabs-convai
        agent-id={ELEVENLABS_AGENT_ID}
        dismissible="true"
        action-text="Need help?"
        start-call-text="Talk with us"
        expand-text="Open assistant"
        text-contents={ELEVENLABS_TEXT_CONTENTS}
        avatar-orb-color-1="#2563eb"
        avatar-orb-color-2="#047857"
        className="elevenlabs-widget"
        data-widget="elevenlabs-convai"
      />
    </>
  );
}
