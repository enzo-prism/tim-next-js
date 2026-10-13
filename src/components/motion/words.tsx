import { Fragment, type CSSProperties, type ReactNode } from "react";

/**
 * Splits a phrase into masked words that rise into place on load (inside an
 * element with `ff-words-intro`). Spaces stay real text nodes, so headings keep
 * their normal accessible name and the text is fully visible without CSS
 * animation support.
 */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <Word index={start + index}>{word}</Word>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** A single masked word; use directly to wrap styled words (italic, underlined). */
export function Word({ index, children }: { index: number; children: ReactNode }) {
  return (
    <span className="ff-word">
      <span style={{ "--w": index } as CSSProperties}>{children}</span>
    </span>
  );
}
