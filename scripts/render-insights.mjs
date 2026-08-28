// Auto-populate insight card listings from the single source of truth
// (data/insights.json, newest first). Runs at build time (see package.json).
// - index.html  → latest 3 cards ("Latest insights")
// - insights.html → all cards
// - blog.html   → all cards (if it has an insight grid)
// Add a new insight in ONE place (data/insights.json, at the top) + create its
// article page; the next build updates every listing automatically.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const { insights } = JSON.parse(readFileSync("data/insights.json", "utf8"));

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const card = (it) =>
`<a class="insight" href="${it.slug}" data-reveal>
        <div class="insight__media">${it.icon}<span class="insight__tag">${it.tag}</span></div>
        <div class="insight__body">
          <div class="insight__meta">${it.meta}</div>
          <h3>${it.title}</h3>
          <p>${it.dek}</p>
          <span class="link-arrow">Read insight ${ARROW}</span>
        </div>
      </a>`;

// Replace the inner cards of the first `.grid-3` that holds insight cards,
// using brace-style <div> matching so nested card divs are handled correctly.
function replaceInsightGrid(html, cardsHtml, file) {
  const m = html.match(/<div class="grid-3">\s*<a class="insight"/);
  if (!m) { console.log(`   ${file}: no insight grid found, skipped`); return html; }
  const gridOpen = html.indexOf(m[0]);
  const openEnd = html.indexOf(">", gridOpen) + 1;
  let depth = 1, i = openEnd;
  while (depth > 0) {
    const nd = html.indexOf("<div", i);
    const cd = html.indexOf("</div>", i);
    if (cd === -1) return html;
    if (nd !== -1 && nd < cd) { depth++; i = nd + 4; }
    else { depth--; if (depth === 0) {
      return html.slice(0, openEnd) + "\n      " + cardsHtml + "\n    " + html.slice(cd);
    } i = cd + 6; }
  }
  return html;
}

const targets = [
  ["index.html", insights.slice(0, 3)],
  ["insights.html", insights],
  ["blog.html", insights],
];
for (const [file, list] of targets) {
  if (!existsSync(file)) continue;
  const html = readFileSync(file, "utf8");
  const cardsHtml = list.map(card).join("\n      ");
  const out = replaceInsightGrid(html, cardsHtml, file);
  if (out !== html) { writeFileSync(file, out); console.log(`   ${file}: rendered ${list.length} card(s)`); }
}
console.log(`insights rendered from data/insights.json (${insights.length} total).`);
