import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

describe("accessibility component contracts", () => {
  it("exposes FAQ state and panel relationships", () => {
    const source = read("../legacy-pages/patient-info.tsx");

    expect(source).toContain('aria-expanded={expandedFAQ === faq.id}');
    expect(source).toContain('aria-controls={`faq-panel-${faq.id}`}');
    expect(source).toContain('role="region"');
    expect(source).toContain('aria-labelledby={`faq-trigger-${faq.id}`}');
  });

  it("moves focus into videos and restores it when they close", () => {
    const source = read("./video-facade.tsx");

    expect(source).toContain("iframeRef.current?.focus()");
    expect(source).toContain("playButtonRef.current?.focus()");
    expect(source).toContain('aria-label={`Close video: ${title}`}');
  });

  it("hides inactive carousel slides and announces the current slide", () => {
    const source = read("./ui/carousel.tsx");

    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-current={isCurrent ? "true" : undefined}');
    expect(source).toContain("aria-hidden={isCurrent ? undefined : true}");
    expect(source).toContain("inert={isCurrent ? undefined : true}");
  });

  it("keeps keyboard focus visible in forced-colors mode", () => {
    for (const component of [
      "button.tsx",
      "checkbox.tsx",
      "input.tsx",
      "select.tsx",
      "sheet.tsx",
      "dialog.tsx",
    ]) {
      expect(read(`./ui/${component}`)).toContain("forced-colors:");
    }
  });

  it("uses usable close targets and a contrast-safe error token", () => {
    expect(read("./ui/sheet.tsx")).toMatch(/Close className="[^"]*h-10 w-10/);
    expect(read("./ui/dialog.tsx")).toMatch(/Close className="[^"]*h-10 w-10/);
    expect(read("./ui/form.tsx")).toContain("text-sm font-medium text-primary");
  });
});
