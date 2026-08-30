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

  it("does not point form controls at missing description nodes", () => {
    const source = read("./ui/form.tsx");

    expect(source).toContain("aria-describedby={error ? formMessageId : undefined}");
    expect(source).not.toContain("`${formDescriptionId}`");
  });

  it("keeps the services CTA fully clickable and its headings sequential", () => {
    const services = read("../legacy-pages/services.tsx");
    const serviceCard = read("./service-card.tsx");

    expect(services).toContain("<Button\n                asChild");
    expect(services).toContain("Our Comprehensive Services");
    expect(serviceCard).toContain('<h3 className="font-bold');
    expect(serviceCard).toContain('<h4 className="font-semibold');
  });

  it("keeps visible link text inside the practice address accessible name", () => {
    const source = read("./location/PracticeAddressLink.tsx");

    expect(source).toContain("`${practiceInfo.addressText}. Open ${practiceInfo.name}");
  });

  it("uses distinct navigation and supporting-content landmarks", () => {
    const tableOfContents = read("./blog/blog-table-of-contents.tsx");
    const article = read("../app/blog/[slug]/page.tsx");

    expect(tableOfContents).toContain('aria-label="On this page"');
    expect(tableOfContents).not.toContain("<aside");
    expect(article).toContain('aria-labelledby="helpful-next-steps-heading"');
  });

  it("shows article ownership and material update dates", () => {
    const article = read("../app/blog/[slug]/page.tsx");

    expect(article).toContain("By Family First Smile Care Editorial Team");
    expect(article).toContain("post.updatedAt !== post.publishedAt");
    expect(article).toContain("format(parseISO(post.updatedAt)");
  });

  it("places the skip link before analytics choices in keyboard order", () => {
    const layout = read("../app/layout.tsx");

    expect(layout.indexOf('href="#main-content"')).toBeLessThan(
      layout.indexOf("<GoogleAnalytics />"),
    );
  });
});
