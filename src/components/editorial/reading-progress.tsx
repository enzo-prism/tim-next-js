/*
 * A 3px cobalt bar across the top of the viewport that fills as you read the
 * article. Pure CSS: a scroll-driven animation tied to the article's view
 * timeline (`.ffe-article`, shared up to `.ffe-post` with timeline-scope).
 * Browsers without scroll-driven animations, and visitors who prefer reduced
 * motion, simply don't see the bar.
 */
const css = `
.ffe-progress{display:none}
@keyframes ffe-progress{from{scale:0 1}to{scale:1 1}}
@media (prefers-reduced-motion:no-preference){
  @supports (animation-timeline:view()) and (timeline-scope:--ffe-article){
    .ffe-post{timeline-scope:--ffe-article}
    .ffe-article{view-timeline:--ffe-article block}
    .ffe-progress{display:block;scale:0 1;transform-origin:0 50%;animation:ffe-progress linear both;animation-timeline:--ffe-article;animation-range:contain 0% contain 100%}
  }
}`;

export function ReadingProgress() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div aria-hidden="true" className="ffe-progress pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] bg-cobalt" />
    </>
  );
}
