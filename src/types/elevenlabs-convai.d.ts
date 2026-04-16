import type { DetailedHTMLProps, HTMLAttributes } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
        "agent-id": string;
        dismissible?: "true" | "false";
        "action-text"?: string;
        "start-call-text"?: string;
        "expand-text"?: string;
        "text-contents"?: string;
        "avatar-orb-color-1"?: string;
        "avatar-orb-color-2"?: string;
      };
    }
  }
}

export {};
