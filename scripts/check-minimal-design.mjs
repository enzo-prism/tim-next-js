import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceRoots = ["src"];
const sourceExtensions = new Set([".ts", ".tsx", ".css"]);

const retiredTerms = [
  "GeneratedIcon",
  "GeneratedIconBadge",
  "BrandIcon",
  "HeadingMark",
  "soft-blue/",
  "lucide-react",
  "react-icons",
  "icon-tooth",
  "icon-child",
  "icon-sparkles",
  "icon-smile",
  "icon-jaw",
  "sticker-tooth-sparkle",
  "mesh-hero",
];

const retiredGlyphNames = [
  'name="star-rating"',
  'name="review-quote"',
  'name="camera-social"',
  'name="community-social"',
];

const allowedMinimalGlyphNames = new Set([
  "arrow-left",
  "arrow-right",
  "arrow-up-right",
  "check",
  "check-circle",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevron-up",
  "circle",
  "close",
  "dot",
  "expand",
  "external-link",
  "grip-vertical",
  "menu",
  "more-horizontal",
  "panel-left",
  "play",
  "search",
]);

const warmClassPattern =
  /(?:^|[\s"`'])(?:bg|text|border|ring|from|via|to|decoration|accent)-(?:red|green|orange|amber|yellow|rose|lime|emerald|pink)(?:-|\/|\b)/;
const emojiIconPattern = /[⭐✨✅❌🦷❤💙]/u;
const broadGradientPattern = /bg-gradient-to-(?:r|br|b|l|tr|tl|bl)/;
const allowedMediaOverlayPattern = /bg-gradient-to-t\s+from-(?:black|slate-950)\//;
const largeArbitraryRadiusPattern = /rounded-\[(?:1|2|3)(?:\.\d+)?rem\]/;
const heavyDecorationPattern = /(?:blur-3xl|shadow-\[[^\]]+\])/;

const failures = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") return [];
      return walk(fullPath);
    }
    return [fullPath];
  });
}

function checkSourceFile(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  const relativePath = path.relative(repoRoot, filePath);

  for (const term of retiredTerms) {
    if (source.includes(term)) {
      failures.push(`Retired icon/design term remains: ${relativePath} -> ${term}`);
    }
  }

  for (const term of retiredGlyphNames) {
    if (source.includes(term)) {
      failures.push(`Decorative glyph usage remains: ${relativePath} -> ${term}`);
    }
  }

  for (const match of source.matchAll(/<MinimalGlyph\s+name="([^"]+)"/g)) {
    if (!allowedMinimalGlyphNames.has(match[1])) {
      failures.push(`Unsupported MinimalGlyph name remains: ${relativePath} -> ${match[1]}`);
    }
  }

  if (emojiIconPattern.test(source)) {
    failures.push(`Emoji-style icon glyph remains: ${relativePath}`);
  }

  const warmClassMatch = source.match(warmClassPattern);
  if (warmClassMatch) {
    failures.push(`Warm Tailwind color class remains: ${relativePath} -> ${warmClassMatch[0].trim()}`);
  }

  const decorationMatch = source.match(heavyDecorationPattern);
  if (decorationMatch) {
    failures.push(`Heavy decoration remains: ${relativePath} -> ${decorationMatch[0]}`);
  }

  const radiusMatch = source.match(largeArbitraryRadiusPattern);
  if (radiusMatch) {
    failures.push(`Large arbitrary radius remains: ${relativePath} -> ${radiusMatch[0]}`);
  }

  for (const line of source.split("\n")) {
    if (broadGradientPattern.test(line) && !allowedMediaOverlayPattern.test(line)) {
      failures.push(`Broad gradient remains: ${relativePath} -> ${line.trim()}`);
      break;
    }
  }
}

for (const root of sourceRoots) {
  for (const file of walk(path.join(repoRoot, root))) {
    if (!sourceExtensions.has(path.extname(file))) continue;
    checkSourceFile(file);
  }
}

const pkg = fs.readFileSync(path.join(repoRoot, "package.json"), "utf8");
for (const term of ["lucide-react", "react-icons"]) {
  if (pkg.includes(term)) {
    failures.push(`Retired icon package remains in package.json: ${term}`);
  }
}

for (const retiredPath of [
  "src/assets/brand/icons/soft-blue",
  "public/attached_assets/brand/icons/soft-blue",
  "output/imagegen/icons",
]) {
  if (fs.existsSync(path.join(repoRoot, retiredPath))) {
    failures.push(`Retired generated icon directory remains: ${retiredPath}`);
  }
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}

console.log("Minimal clinical design guard passed.");
