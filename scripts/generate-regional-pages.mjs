// Phase I — emerging-market regional pages (India / SEA / ME per the strategic gate).
// Each page satisfies the THREE-UNIQUE-THINGS rule with SAFE, non-dated facts
// (local commodity, export flow, local industry) and marks every REGULATORY claim
// with <!-- VERIFY -->. Pages ship noindex,follow until a human verifies dates and
// expands copy (then flip to index + add to sitemap.xml). English-only.
import { readFileSync, writeFileSync } from "node:fs";

const h = readFileSync("iscc.html", "utf8");
const subnav = h.match(/<div class="subnav">.*?<\/div>\s*<\/div>\s*<\/div>/s)[0];
const cta = h.match(/<section class="bg-teal cta-band">.*?<\/section>/s)[0];
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ORG = "https://offsetease.com/#organization";

// Each page: THREE unique things are `commodity`, `flow`, `local` (all safe/factual).
const pages = [
  { slug: "iscc-certification-malaysia", country: "Malaysia", cc: "MY", service: "iscc", serviceName: "ISCC Certification", industry: "chemicals",
    h1: "ISCC Certification in Malaysia", eyebrow: "ISCC · Malaysia",
    commodity: "palm oil, palm derivatives and oleochemicals", flow: "exports into the EU energy and chemicals markets",
    local: "one of the world's most ISCC-dense supply bases",
    reg: "ISCC EU (for the EU energy market under RED III) and ISCC PLUS (for bio-based and recycled materials)" },
  { slug: "iscc-certification-indonesia", country: "Indonesia", cc: "ID", service: "iscc", serviceName: "ISCC Certification", industry: "chemicals",
    h1: "ISCC Certification in Indonesia", eyebrow: "ISCC · Indonesia",
    commodity: "palm oil and palm-based feedstocks", flow: "exports into the EU energy and chemicals markets",
    local: "home to some of the largest certified ISCC populations",
    reg: "ISCC EU (RED III, EU energy market) and ISCC PLUS (non-energy bio-based and recycled materials)" },
  { slug: "cbam-compliance-india", country: "India", cc: "IN", service: "cbam", serviceName: "CBAM Compliance", industry: "metals",
    h1: "CBAM Compliance for Indian Exporters", eyebrow: "CBAM · India",
    commodity: "steel, aluminium, cement and fertiliser", flow: "exports into the European Union",
    local: "one of the EU's largest sources of CBAM-covered goods",
    reg: "the EU Carbon Border Adjustment Mechanism (CBAM)" },
  { slug: "eudr-compliance-vietnam", country: "Vietnam", cc: "VN", service: "eudr", serviceName: "EUDR Compliance", industry: "consumer",
    h1: "EUDR Compliance for Vietnamese Exporters", eyebrow: "EUDR · Vietnam",
    commodity: "coffee, timber, rubber and wood products", flow: "exports into the European Union",
    local: "a major origin for several EUDR-regulated commodities",
    reg: "the EU Deforestation Regulation (EUDR)" },
];

const steps = (p) => [
  ["Scope & exposure mapping", `Confirm which products and shipments from ${p.country} fall in scope, and map your certification or reporting obligations.`],
  ["Data & supply-chain preparation", `Get your ${p.country} supplier data, documentation and chain-of-custody records into audit-ready shape.`],
  ["Submission & audit support", "Prepare and support you through reporting, verification or the certification body's audit."],
  ["Maintenance", "Keep you compliant as requirements and your supply base change."],
];

for (const p of pages) {
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://offsetease.com/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://offsetease.com/services" },
    { "@type": "ListItem", position: 3, name: p.serviceName, item: `https://offsetease.com/${p.service}` },
    { "@type": "ListItem", position: 4, name: p.country } ] };
  const service = { "@context": "https://schema.org", "@type": "Service", serviceType: `${p.serviceName} consulting`,
    name: p.h1, description: `${p.serviceName} consulting for ${p.country} exporters.`, provider: { "@id": ORG },
    areaServed: { "@type": "Country", name: p.country }, url: `https://offsetease.com/${p.slug}` };
  const jsonld = [breadcrumb, service].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");
  const stepsHtml = steps(p).map(([t, d], i) => `<li>${CHECK}<div><b>0${i + 1} — ${t}</b><span>${d}</span></div></li>`).join("");

  const content = `${jsonld}
<main id="app">
    <section class="page-header"><div class="container">
      <div class="crumbs"><a href="./">Home</a><span class="sep">/</span><a href="services">Services</a><span class="sep">/</span><a href="${p.service}">${p.serviceName}</a><span class="sep">/</span><span class="current">${p.country}</span></div>
      <span class="eyebrow">${p.eyebrow}</span>
      <h1 style="margin-top:1.25rem">${p.h1}</h1>
      <p class="page-header__lead">${p.serviceName} for ${p.country} producers and exporters — ${p.commodity} moving into EU-facing markets.</p>
    </div></section>
    ${subnav}
    <section><div class="container split">
      <div class="content-section">
        <p style="font-size:var(--fs-lead);color:var(--ink-2);max-width:64ch">${p.country} is ${p.local}: its ${p.commodity} sector depends on ${p.flow}. That makes ${p.reg} <!-- VERIFY: scope, thresholds and application dates against the issuing body before publish --> a direct commercial issue for ${p.country} exporters.</p>
        <p style="max-width:64ch;margin-top:1.1rem">OffsetEase helps ${p.country} producers meet it — from scoping to audit-ready evidence. Detailed, country-specific regulatory guidance is in preparation; for advice specific to your operations, <a href="contact">book a consultation</a>.</p>
        <!-- TODO: HUMAN — differentiated ${p.country} content (regulation specifics + dates VERIFIED against issuing body; local schemes/registries; commodity/export-flow detail; a ${p.country} example). This is what makes the page indexable — do not template across countries. -->
      </div>
      <aside class="card" style="align-self:start">
        <h3 style="margin-bottom:1rem">At a glance</h3>
        <dl style="display:grid;gap:.9rem;margin:0">
          <div><dt style="font-weight:600;color:var(--ink-2)">Market</dt><dd style="margin:.15rem 0 0">${p.country}</dd></div>
          <div><dt style="font-weight:600;color:var(--ink-2)">In scope</dt><dd style="margin:.15rem 0 0">${p.commodity}</dd></div>
          <div><dt style="font-weight:600;color:var(--ink-2)">Service</dt><dd style="margin:.15rem 0 0"><a href="${p.service}">${p.serviceName}</a></dd></div>
        </dl>
        <a class="btn btn--primary" href="contact" style="margin-top:1.25rem;display:inline-flex">Discuss ${p.country}</a>
      </aside>
    </div></section>
    <section><div class="container">
      <div class="content-section">
      <h2>How OffsetEase works with ${p.country} exporters</h2>
      <ul class="checklist">${stepsHtml}</ul>
      </div>
    </div></section>
    <section class="related-reading"><div class="container">
      <h2>Related</h2>
      <ul class="rr-list">
        <li><a href="${p.service}">${p.serviceName} — full service</a></li>
        <li><a href="${p.industry}">Our work in this sector</a></li>
        <li><a href="contact">Book a consultation</a></li>
      </ul>
    </div></section>
    ${cta}
  </main>`;

  const page = `---
layout: base.njk
permalink: "/${p.slug}.html"
slug: "${p.slug}"
robots: "noindex, follow"
title: "${p.serviceName} in ${p.country} | OffsetEase"
description: "${p.serviceName} consulting for ${p.country} exporters of ${p.commodity} into EU-facing markets — scoping, data preparation and audit support."
---
${content}
`;
  writeFileSync(`${p.slug}.njk`, page);
  console.log(`wrote ${p.slug}.njk`);
}
