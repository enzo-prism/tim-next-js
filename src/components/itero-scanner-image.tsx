import { useState } from "react";
import illustrationDigitalScan from "@assets/brand/illustration-digital-scan.webp";

interface IteroScannerImageProps {
  className?: string;
}

export default function IteroScannerImage({
  className = "",
}: IteroScannerImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-500 ${className}`}
      >
        Digital scan illustration coming soon.
      </div>
    );
  }

  return (
    <img
      src={illustrationDigitalScan.src}
      alt="Digital dental scan illustration (3D wireframe)"
      className={`h-full w-full rounded-2xl object-contain bg-white/70 p-4 shadow-lg ${className}`}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
