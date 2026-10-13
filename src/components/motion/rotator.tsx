import type { CSSProperties } from "react";

/**
 * Rolls through up to five short phrases once, then rests on the last one
 * (finite, under five seconds). Screen readers and no-motion visitors get the
 * full list as plain text.
 */
export function Rotator({
  words,
  srText,
  delay = 0,
  className,
}: {
  words: readonly string[];
  srText: string;
  delay?: number;
  className?: string;
}) {
  return (
    <>
      <span aria-hidden="true" className={`ff-rotator ${className ?? ""}`} style={{ "--d": delay } as CSSProperties}>
        {words.slice(0, 5).map((word) => (
          <span key={word}>{word}</span>
        ))}
      </span>
      <span className="sr-only">{srText}</span>
    </>
  );
}
