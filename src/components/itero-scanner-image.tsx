"use client";

import { useState } from "react";
import Image from "next/image";
import illustrationDigitalScan from "@assets/brand/illustration-digital-scan.webp";
import { cn } from "@/lib/utils";

interface IteroScannerImageProps {
  className?: string;
  /** Run the one-time scanning beam over the illustration on load. */
  scan?: boolean;
  priority?: boolean;
  sizes?: string;
}

// One pass of a scanning beam on load: a faint, grey "before" model sits
// underneath, and the full-colour scan is revealed behind the beam (clip-path),
// then the beam fades. Transform, opacity and clip-path only. Reduced motion
// (and browsers without the animation) simply show the finished scan.
const scanStyles = `
.ffx-scan-ghost { filter: grayscale(1); opacity: 0.45; }
.ffx-scan-beam { opacity: 0; }
@media (prefers-reduced-motion: no-preference) {
  .ffx-scan-reveal { animation: ffx-scan-reveal 1.15s cubic-bezier(0.65, 0, 0.35, 1) 0.55s both; }
  .ffx-scan-beam { animation: ffx-scan-beam 1.15s cubic-bezier(0.65, 0, 0.35, 1) 0.55s both; }
}
@keyframes ffx-scan-reveal {
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
}
@keyframes ffx-scan-beam {
  0% { translate: -100% 0; opacity: 0; }
  10% { opacity: 1; }
  82% { opacity: 1; }
  100% { translate: 0 0; opacity: 0; }
}
`;

export default function IteroScannerImage({
  className,
  scan = false,
  priority = false,
  sizes = "(max-width: 1023px) calc(100vw - 2rem), 560px",
}: IteroScannerImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-3xl border border-dashed border-border bg-white p-8 text-sm text-ink-soft",
          className,
        )}
      >
        Digital scan illustration coming soon.
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-clip bg-white", className)}>
      {scan ? <style>{scanStyles}</style> : null}
      {scan ? (
        <Image
          src={illustrationDigitalScan}
          alt=""
          aria-hidden="true"
          fill
          priority={priority}
          sizes={sizes}
          className="ffx-scan-ghost object-cover object-[78%_50%]"
        />
      ) : null}
      <Image
        src={illustrationDigitalScan}
        alt="Digital dental scan illustration (3D wireframe)"
        fill
        priority={priority && !scan}
        loading={priority ? "eager" : undefined}
        sizes={sizes}
        className={cn("object-cover object-[78%_50%]", scan && "ffx-scan-reveal")}
        onError={() => setHasError(true)}
      />
      {scan ? (
        <span aria-hidden="true" className="ffx-scan-beam pointer-events-none absolute inset-0 flex justify-end">
          <span className="h-full w-16 bg-periwinkle/25" />
          <span className="h-full w-[3px] bg-cobalt" />
          <span className="absolute -right-[7px] top-[12%] size-4 rounded-full bg-lime ring-4 ring-white" />
          <span className="absolute -right-[7px] bottom-[12%] size-4 rounded-full bg-lime ring-4 ring-white" />
        </span>
      ) : null}
    </div>
  );
}
