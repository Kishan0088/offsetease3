// Phase F — generate per-page OpenGraph images (1200×630) into og/{slug}.png.
// Dev-only (sharp is a devDependency): run `node scripts/generate-og.mjs`, commit
// the PNGs. Netlify just passthrough-copies them; no image tooling in the build.
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";

const TEAL = "#0c4d56", PAPER = "#faf8f4", COPPER = "#c4733a", MUTED = "#9fc0c4";

const SERVICES = ["ghg-accounting","product-carbon-footprint","life-cycle-assessment","epd","ecovadis","cdp","cbam","esg-reporting","climate-risk","iscc","eudr","sbti","net-zero","carbon-credits","renewable-energy"];
const SCHEMES = ["iscc-eu-certification","iscc-plus-certification","iscc-corsia-certification"];
const ARTICLES = ["iscc-eu-plus-corsia-which-certification","cbam-definitive-period-2026","sbti-net-zero-standard-v2","cdp-disclosure-2026","brsr-core-assurance-india","lca-pcf-epd-difference","eudr-deforestation-regulation-explained","ecovadis-scoring-bronze-to-gold","scope-3-emissions-measurement","ifrs-s1-s2-issb-explained","carbon-credit-integrity-icvcm-vcmi","net-zero-pathway-funding","i-rec-renewable-energy-certificates"];

const h1of = (slug) => {
  const f = slug + ".html";
  if (!existsSync(f)) return null;
  const m = readFileSync(f, "utf8").match(/<h1[^>]*>(.*?)<\/h1>/s);
  return m ? m[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : null;
};

const pages = [
  { slug: "index", title: "ESG, Carbon & Climate Advisory for Enterprises", label: "OffsetEase" },
  ...SERVICES.map((s) => ({ slug: s, title: h1of(s), label: "Service" })),
  { slug: "iscc-eu-certification", title: "ISCC EU Certification", label: "ISCC certification" },
  { slug: "iscc-plus-certification", title: "ISCC PLUS Certification", label: "ISCC certification" },
  { slug: "iscc-corsia-certification", title: "ISCC CORSIA Certification", label: "ISCC certification" },
  ...ARTICLES.map((s) => ({ slug: s, title: h1of(s), label: "Insight" })),
].filter((p) => p.title);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// word-wrap into <= maxLines lines of <= maxChars, ellipsis overflow
const wrap = (text, maxChars = 22, maxLines = 4) => {
  const words = text.split(" "); const lines = []; let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length <= maxChars) cur = (cur + " " + w).trim();
    else { lines.push(cur); cur = w; }
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines) {
    const used = lines.join(" ").split(" ").length;
    if (used < words.length) lines[maxLines - 1] = lines[maxLines - 1].replace(/[.,;:]?$/, "…");
  }
  return lines;
};

mkdirSync("og", { recursive: true });
const logoWhite = await sharp("offsetease-logo.png").negate({ alpha: false }).resize({ width: 230 }).png().toBuffer();

for (const p of pages) {
  const lines = wrap(p.title);
  // transparent overlay — the teal base + composited logo show through
  const tspans = lines.map((l, i) => `<text x="80" y="${330 + i * 76}" font-family="sans-serif" font-size="60" font-weight="700" fill="${PAPER}">${esc(l)}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect x="0" y="0" width="1200" height="10" fill="${COPPER}"/>
    <text x="82" y="258" font-family="sans-serif" font-size="26" font-weight="700" letter-spacing="3" fill="${COPPER}">${esc(p.label.toUpperCase())}</text>
    ${tspans}
    <text x="80" y="588" font-family="sans-serif" font-size="26" fill="${MUTED}">offsetease.com</text>
  </svg>`;
  await sharp({ create: { width: 1200, height: 630, channels: 4, background: TEAL } })
    .composite([{ input: logoWhite, top: 70, left: 80 }, { input: Buffer.from(svg), top: 0, left: 0 }])
    .png().toFile(`og/${p.slug}.png`);
}
console.log(`generated ${pages.length} OG images into og/`);
