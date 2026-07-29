#!/usr/bin/env node
// OffsetEase — CI regression guards (Phase 0 starter set; extended in Phases C/E/H).
// Runs against the built _site. Exits non-zero on any violation so CI fails.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE = "_site";
if (!existsSync(SITE)) {
  console.error(`✗ ${SITE}/ not found — run "npm run build" first.`);
  process.exit(2);
}

const htmlFiles = readdirSync(SITE).filter((f) => f.endsWith(".html"));
const read = (f) => readFileSync(join(SITE, f), "utf8");
const violations = [];
const add = (rule, detail) => violations.push({ rule, detail });

// ── Guard 1: unique, present <title> on every page ─────────────────────────
const titles = new Map();
for (const f of htmlFiles) {
  const m = read(f).match(/<title>([^<]*)<\/title>/);
  const t = m && m[1].trim();
  if (!t) { add("title-missing", f); continue; }
  if (!titles.has(t)) titles.set(t, []);
  titles.get(t).push(f);
}
for (const [t, files] of titles) {
  if (files.length > 1) add("title-duplicate", `${files.join(", ")} → "${t}"`);
}

// ── Guard 2: present meta description on every page ─────────────────────────
for (const f of htmlFiles) {
  const m = read(f).match(/<meta\s+name="description"\s+content="([^"]*)"/);
  if (!m || !m[1].trim()) add("description-missing", f);
}

// ── Guard 3: no internal .html links (canonical URLs are extensionless) ─────
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("#")) continue;
    if (/\.html($|[?#])/.test(href)) add("html-internal-link", `${f} → ${href}`);
  }
}

// ── Guard 4: sitemap.xml has no .html and is present ───────────────────────
if (!existsSync(join(SITE, "sitemap.xml"))) {
  add("sitemap-missing", "sitemap.xml not in build output");
} else {
  const xml = readFileSync(join(SITE, "sitemap.xml"), "utf8");
  const bad = [...xml.matchAll(/<loc>([^<]*\.html)<\/loc>/g)].map((m) => m[1]);
  if (bad.length) add("sitemap-html-url", bad.join(", "));
}

// ── Guard 5: a visible FAQ block must carry FAQPage schema (Phase C) ───────
for (const f of htmlFiles) {
  const html = read(f);
  if (html.includes('class="acc__item"') && !/"@type"\s*:\s*"FAQPage"/.test(html)) {
    add("faq-without-faqpage", f);
  }
}

// ── Guard 6: BlogPosting must have author + datePublished (Phase C) ─────────
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    const blk = m[1];
    if (!blk.includes('"BlogPosting"')) continue;
    if (!blk.includes('"author"')) add("article-without-author", f);
    if (!blk.includes('"datePublished"')) add("article-without-datePublished", f);
  }
}

// ── Guard 7: no broken internal links (Phase E) ────────────────────────────
const has = (rel) => existsSync(join(SITE, rel)); // real path check (handles subdirs)
const resolveHref = (href) => {
  let h = href.split("#")[0].split("?")[0];
  if (h === "" || h === "./" || h === "/") return "index.html";
  if (h.startsWith("/")) h = h.slice(1);
  if (h === "") return "index.html";
  if (has(h)) return h;                 // asset or exact file (incl. subdirs)
  if (has(h + ".html")) return h + ".html"; // extensionless page
  return null;                          // unresolved
};
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:)?\/\//.test(href) || /^(mailto:|tel:|javascript:)/.test(href) || href.startsWith("#")) continue;
    if (resolveHref(href) === null) add("broken-internal-link", `${f} → ${href}`);
  }
}

// ── Guard 8: no orphan pages; max click-depth 3 from homepage (Phase J) ────
// Build the internal link graph from every page, then BFS from index.html.
const pageSet = new Set(htmlFiles);
const edges = new Map(); // file -> Set(target files)
const inbound = new Map(htmlFiles.map((f) => [f, 0]));
for (const f of htmlFiles) {
  const targets = new Set();
  for (const m of read(f).matchAll(/href="([^"]+)"/g)) {
    const t = resolveHref(m[1]);
    if (t && t.endsWith(".html") && t !== f && pageSet.has(t)) targets.add(t);
  }
  edges.set(f, targets);
  for (const t of targets) inbound.set(t, (inbound.get(t) || 0) + 1);
}
// Orphans: reachable content pages with zero inbound internal links (index exempt)
for (const f of htmlFiles) {
  if (f === "index.html") continue;
  if ((inbound.get(f) || 0) === 0) add("orphan-page", f);
}
// Click depth via BFS from index.html
const depth = new Map([["index.html", 0]]);
let frontier = ["index.html"];
while (frontier.length) {
  const next = [];
  for (const f of frontier) for (const t of edges.get(f) || []) {
    if (!depth.has(t)) { depth.set(t, depth.get(f) + 1); next.push(t); }
  }
  frontier = next;
}
for (const f of htmlFiles) {
  const d = depth.get(f);
  if (d === undefined) add("unreachable-page", f);
  else if (d > 3) add("click-depth>3", `${f} (depth ${d})`);
}

// ── Guard 9: no unverified regulatory claims on INDEXABLE pages (Phase P) ──
// noindex scaffolds may carry <!-- VERIFY: ... --> markers; the moment a page is
// indexable it must not — this stops unverified compliance claims from shipping.
for (const f of htmlFiles) {
  const html = read(f);
  const noindex = /name="robots"\s+content="[^"]*noindex/i.test(html);
  if (!noindex && /<!--\s*VERIFY/i.test(html)) add("verify-on-indexable-page", f);
}

// ── Guard 10: doorway-page similarity on industry/regional pages (Phase P) ──
// Compares MAIN-CONTENT text (shell excluded) between templated pages; a pair
// above the threshold signals swapped-noun doorway pages.
const DOORWAY_SLUGS = htmlFiles.filter((f) =>
  /^(pharma|textiles|manufacturing|metals|consumer|chemicals|automotive)\.html$/.test(f) ||
  /-(malaysia|indonesia|india|vietnam|gcc|saudi-arabia|uae|brazil|west-africa|south-africa)\.html$/.test(f));
const mainText = (f) => {
  const m = read(f).match(/<main[\s\S]*?<\/main>/i);
  return (m ? m[0] : "").replace(/<[^>]+>/g, " ").toLowerCase().replace(/[^a-z0-9 ]/g, " ").split(/\s+/).filter(Boolean);
};
const shingles = (words, n = 3) => {
  const s = new Set();
  for (let i = 0; i + n <= words.length; i++) s.add(words.slice(i, i + n).join(" "));
  return s;
};
const texts = new Map(DOORWAY_SLUGS.map((f) => [f, shingles(mainText(f))]));
for (let a = 0; a < DOORWAY_SLUGS.length; a++) {
  for (let b = a + 1; b < DOORWAY_SLUGS.length; b++) {
    const A = texts.get(DOORWAY_SLUGS[a]), B = texts.get(DOORWAY_SLUGS[b]);
    if (!A.size || !B.size) continue;
    let inter = 0; for (const x of A) if (B.has(x)) inter++;
    const jaccard = inter / (A.size + B.size - inter);
    if (jaccard > 0.85) add("doorway-similarity", `${DOORWAY_SLUGS[a]} ~ ${DOORWAY_SLUGS[b]} (${(jaccard * 100).toFixed(0)}%)`);
  }
}

// ── Guard 11: .checklist must live inside .content-section (Phase P) ───────
// The checklist styles are scoped `.content-section ul.checklist ...`; a checklist
// outside a .content-section renders unstyled (giant icons). Catch it at build.
for (const f of htmlFiles) {
  const html = read(f);
  let idx = 0;
  while ((idx = html.indexOf('class="checklist"', idx)) !== -1) {
    const secStart = html.lastIndexOf("<section", idx);
    if (!html.slice(secStart, idx).includes("content-section")) {
      add("checklist-outside-content-section", f);
    }
    idx += 17;
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log(`✓ guards passed — ${htmlFiles.length} pages checked, 0 violations.`);
  process.exit(0);
}
console.error(`✗ ${violations.length} guard violation(s):`);
for (const v of violations) console.error(`  [${v.rule}] ${v.detail}`);
process.exit(1);
