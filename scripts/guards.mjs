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
const exists = new Set(readdirSync(SITE));
// also allow assets in subdirs (none today, but future-proof)
const resolveHref = (href) => {
  let h = href.split("#")[0].split("?")[0];
  if (h === "" || h === "./" || h === "/") return "index.html";
  if (h.startsWith("/")) h = h.slice(1);
  if (h === "") return "index.html";
  if (exists.has(h)) return h;                 // asset or exact file
  if (exists.has(h + ".html")) return h + ".html"; // extensionless page
  return null;                                  // unresolved
};
for (const f of htmlFiles) {
  const html = read(f);
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1];
    if (/^(https?:)?\/\//.test(href) || /^(mailto:|tel:|javascript:)/.test(href) || href.startsWith("#")) continue;
    if (resolveHref(href) === null) add("broken-internal-link", `${f} → ${href}`);
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
