// Generate the three ISCC scheme pages as Eleventy templates (Phase A1).
// Fully wired shell via base.njk; body copy + figures are HUMAN TODO stubs.
// Pages ship noindex,follow (held out of the index until real copy lands) to
// avoid thin-content penalties; Service + BreadcrumbList JSON-LD only (FAQPage
// deferred until real FAQ answers exist so schema byte-matches the DOM).
import { readFileSync, writeFileSync } from "node:fs";

const h = readFileSync("iscc.html", "utf8");
const subnav = h.match(/<div class="subnav">.*?<\/div>\s*<\/div>\s*<\/div>/s)[0];
const cta = h.match(/<section class="bg-teal cta-band">.*?<\/section>/s)[0];

const ORG_ID = "https://offsetease.com/#organization";
const TODO = (what) =>
  `<!-- TODO: HUMAN — ${what}. Do not invent RED III / mass-balance / CORSIA technical claims or any figure. Compliance content = legal exposure. -->`;

const schemes = [
  {
    slug: "iscc-eu-certification",
    short: "ISCC EU",
    h1: "ISCC EU Certification",
    title: "ISCC EU Certification Consulting — Biofuels & RED | OffsetEase",
    desc: "ISCC EU certification consulting for biofuels, bioliquids and biomass entering the EU energy market — chain-of-custody setup, GHG modelling and first-audit preparation.",
    lead: "Certification for biofuels, bioliquids and biomass fuels seeking access to the EU energy market.",
    serviceType: "ISCC EU certification consulting",
    intro: "This page covers ISCC EU certification — what it certifies, who needs it, the audit process, and indicative cost and timeline. Detailed guidance is being finalised; for help now, book a consultation.",
    sections: [
      ["What ISCC EU is", "plain-language definition of ISCC EU"],
      ["The EU regulatory context", "the EU Renewable Energy Directive context — VERIFY the directive name, version and any date against the European Commission before publish"],
      ["Who needs ISCC EU", "which operators in the biofuel/bioliquid/biomass chain need it"],
      ["How the engagement runs", "the OffsetEase engagement steps"],
      ["Cost & timeline", "audit-fee range, internal-prep effort and surveillance cost — every figure is HUMAN INPUT"],
    ],
  },
  {
    slug: "iscc-plus-certification",
    short: "ISCC PLUS",
    h1: "ISCC PLUS Certification",
    title: "ISCC PLUS Certification Consulting — Bio & Recycled | OffsetEase",
    desc: "ISCC PLUS certification consulting for bio-based and recycled materials in chemicals, plastics, food and feed — mass-balance chain of custody and audit preparation.",
    lead: "Certification for bio-based and recycled materials in chemicals, plastics, food, feed and the circular economy.",
    serviceType: "ISCC PLUS certification consulting",
    intro: "This page covers ISCC PLUS certification — what it certifies, how mass balance works, the sectors that use it, the audit process, and indicative cost and timeline. Detailed guidance is being finalised; for help now, book a consultation.",
    sections: [
      ["What ISCC PLUS is", "plain-language definition of ISCC PLUS"],
      ["Mass balance, explained", "how mass-balance chain of custody works — restate only what the ISCC comparison article already states; do not add new technical claims"],
      ["Sectors that use ISCC PLUS", "chemicals, plastics, food, feed, circular economy"],
      ["How the engagement runs", "the OffsetEase engagement steps"],
      ["Cost & timeline", "audit-fee range, internal-prep effort and surveillance cost — every figure is HUMAN INPUT"],
    ],
  },
  {
    slug: "iscc-corsia-certification",
    short: "ISCC CORSIA",
    h1: "ISCC CORSIA Certification",
    title: "ISCC CORSIA Certification Consulting — SAF | OffsetEase",
    desc: "ISCC CORSIA certification consulting for Sustainable Aviation Fuel and its feedstocks — sustainability documentation and audit preparation for the aviation value chain.",
    lead: "Certification for Sustainable Aviation Fuel and its feedstocks under the ICAO CORSIA programme.",
    serviceType: "ISCC CORSIA certification consulting",
    intro: "This page covers ISCC CORSIA certification — what it certifies, the ICAO CORSIA context, the SAF value chain, the audit process, and indicative cost and timeline. Detailed guidance is being finalised; for help now, book a consultation.",
    sections: [
      ["What ISCC CORSIA is", "plain-language definition of ISCC CORSIA"],
      ["The ICAO CORSIA context", "the ICAO CORSIA programme context — VERIFY scheme scope and any date against ICAO before publish"],
      ["The SAF value chain", "where certification applies across the SAF value chain"],
      ["How the engagement runs", "the OffsetEase engagement steps"],
      ["Cost & timeline", "audit-fee range, internal-prep effort and surveillance cost — every figure is HUMAN INPUT"],
    ],
  },
];

const siblings = (cur) => schemes.filter((s) => s.slug !== cur);

for (const s of schemes) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://offsetease.com/" },
      { "@type": "ListItem", position: 2, name: "Services", item: "https://offsetease.com/services" },
      { "@type": "ListItem", position: 3, name: "ISCC Certification", item: "https://offsetease.com/iscc" },
      { "@type": "ListItem", position: 4, name: s.short },
    ],
  };
  const service = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: s.serviceType,
    name: s.h1,
    description: s.desc,
    provider: { "@id": ORG_ID },
    areaServed: ["IN", "SG", "AE", "EU"],
    url: `https://offsetease.com/${s.slug}`,
  };
  const jsonld =
    `<script type="application/ld+json">${JSON.stringify(breadcrumb)}</script>\n` +
    `<script type="application/ld+json">${JSON.stringify(service)}</script>`;

  const sectionsHtml = s.sections
    .map(
      ([hd, todo]) =>
        `<h2>${hd}</h2>\n          ${TODO(todo)}\n          <p><em>Detailed guidance in preparation.</em></p>`
    )
    .join("\n          ");

  const relatedLis = [
    `<li><a href="iscc">ISCC certification overview</a></li>`,
    `<li><a href="iscc-eu-plus-corsia-which-certification">ISCC EU vs PLUS vs CORSIA: which certification you need</a></li>`,
    ...siblings(s.slug).map((x) => `<li><a href="${x.slug}">${x.h1}</a></li>`),
  ].join("");

  const content = `${jsonld}
<main id="app">
    ${subnav}
    <section class="page-header">
      <div class="container">
        <div class="crumbs">
          <a href="./">Home</a><span class="sep">/</span>
          <a href="services">Services</a><span class="sep">/</span>
          <a href="iscc">ISCC</a><span class="sep">/</span>
          <span class="current">${s.short}</span>
        </div>
        <span class="eyebrow">Comply</span>
        <h1 style="margin-top:1.25rem">${s.h1}</h1>
        <p class="page-header__lead">${s.lead}</p>
      </div>
    </section>
    <section>
      <div class="container">
        <div class="prose-page">
          <p>${s.intro}</p>
          ${sectionsHtml}
          <h2>${s.short}: questions buyers ask</h2>
          ${TODO("FAQ questions + answers. When written, emit FAQPage JSON-LD whose Answer.text byte-matches the visible answers, and flip this page to index")}
          <p><em>Frequently asked questions in preparation.</em></p>
        </div>
      </div>
    </section>
    <section class="related-reading">
      <div class="container">
        <h2>Related reading</h2>
        <ul class="rr-list">${relatedLis}</ul>
      </div>
    </section>
    ${cta}
  </main>`;

  const page = `---
layout: base.njk
permalink: "/${s.slug}.html"
slug: "${s.slug}"
robots: "noindex, follow"
title: "${s.title}"
description: "${s.desc}"
---
${content}
`;
  writeFileSync(`${s.slug}.njk`, page);
  console.log(`wrote ${s.slug}.njk  (title ${s.title.length} chars)`);
}
