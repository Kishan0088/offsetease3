// Phase B — wire named authors once _data/authors.json is filled with REAL people.
// Run: node scripts/apply-authors.mjs
// While any TODO placeholder remains, this does nothing (safe no-op). When filled,
// it upgrades each mapped article's BlogPosting author (Organization → Person),
// swaps the visible "By OffsetEase Advisory" byline, and prints the /leadership
// Person JSON-LD to paste. It never invents data — it only applies what you wrote.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const data = JSON.parse(readFileSync("_data/authors.json", "utf8"));
const hasTodo = JSON.stringify(data).includes("TODO");
if (hasTodo) {
  console.log("authors.json still contains TODO placeholders — nothing applied.");
  console.log("Fill in real names/titles/credentials, then re-run this script.");
  process.exit(0);
}

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const persons = [];
let changed = 0;

for (const [slug, key] of Object.entries(data.article_bylines)) {
  const a = data.authors[key];
  if (!a) { console.error(`! no author '${key}' for ${slug}`); continue; }
  const file = `${slug}.html`;
  if (!existsSync(file)) { console.error(`! missing ${file}`); continue; }
  let h = readFileSync(file, "utf8");

  // BlogPosting author: Organization → Person
  const person = { "@type": "Person", name: a.name, jobTitle: a.jobTitle,
    url: `https://offsetease.com/${a.leadershipAnchor}` };
  h = h.replace(/"author":\{"@type":"Organization","name":"OffsetEase"\}/,
    `"author":${JSON.stringify(person)}`);

  // Visible byline
  h = h.replace(/By OffsetEase Advisory/g, `By ${esc(a.name)}, ${esc(a.jobTitle)}`);

  writeFileSync(file, h);
  changed++;
}

// Collect unique Person entries for /leadership
for (const a of Object.values(data.authors)) {
  persons.push({ "@context": "https://schema.org", "@type": "Person", name: a.name,
    jobTitle: a.jobTitle, description: a.bio, knowsAbout: a.credentials,
    worksFor: { "@id": "https://offsetease.com/#organization" },
    sameAs: a.linkedin ? [a.linkedin] : undefined });
}

console.log(`Applied named bylines to ${changed} articles.`);
console.log("\nPaste these Person blocks into /leadership (with matching anchor ids):");
for (const p of persons) console.log(`<script type="application/ld+json">${JSON.stringify(p)}</script>`);
