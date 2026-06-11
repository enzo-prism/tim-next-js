import { useState } from "react";
import Image from "next/image";
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
        className={`flex items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 p-8 text-sm text-gray-500 ${className}`}
      >
        Digital scan illustration coming soon.
      </div>
    );
  }

  return (
    <Image
      src={illustrationDigitalScan}
      alt="Digital dental scan illustration (3D wireframe)"
      sizes="(max-width: 1024px) 100vw, 50vw"
      className={`h-full w-full rounded-xl object-contain bg-white/70 p-4 shadow-sm ${className}`}
      onError={() => setHasError(true)}
    />
  );
}
