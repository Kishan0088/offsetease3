// Generate the three ISCC scheme pages as Eleventy templates (Phase A1 + UI polish).
// Substantive, designed pages built ONLY from safe, already-published content:
//  - "At a glance" facts card (from the comparison-table data, already on the site)
//  - engagement-process checklist (OffsetEase's real published /iscc steps, generic)
//  - cost-drivers list (real drivers; figures are HUMAN TODO)
//  - FAQ accordion with honest engagement-level answers (no invented compliance claims)
// Deep scheme-specific regulatory copy stays a clearly-marked HUMAN/VERIFY TODO.
// Pages ship noindex,follow until HUMAN confirms/expands copy (then flip to index +
// add to sitemap.xml). Service + BreadcrumbList + FAQPage JSON-LD emitted.
import { readFileSync, writeFileSync } from "node:fs";

const h = readFileSync("iscc.html", "utf8");
const subnav = h.match(/<div class="subnav">.*?<\/div>\s*<\/div>\s*<\/div>/s)[0];
const cta = h.match(/<section class="bg-teal cta-band">.*?<\/section>/s)[0];
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l5 5L20 6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>';
const ORG_ID = "https://offsetease.com/#organization";
const TODO = (w) => `<!-- TODO: HUMAN — ${w}. Do not invent RED III / mass-balance / CORSIA technical claims or any figure; VERIFY every regulatory assertion against the issuing body. -->`;

const schemes = [
  {
    slug: "iscc-eu-certification", short: "ISCC EU", h1: "ISCC EU Certification",
    title: "ISCC EU Certification Consulting — Biofuels & RED | OffsetEase",
    desc: "ISCC EU certification consulting for biofuels, bioliquids and biomass entering the EU energy market — chain-of-custody setup, GHG modelling and first-audit preparation.",
    lead: "Certification for biofuels, bioliquids and biomass fuels seeking access to the EU energy market.",
    serviceType: "ISCC EU certification consulting",
    certifies: "Biofuels, bioliquids and biomass fuels",
    market: "EU energy market",
    basis: "EU Renewable Energy Directive (RED III) <!-- VERIFY: directive name/version against the European Commission before publish -->",
    intro: "ISCC EU is the ISCC scheme for biofuels, bioliquids and biomass fuels entering the EU energy market. Below: who needs it, how an OffsetEase engagement runs, and what drives cost.",
    coc: "supplier data, GHG records and documentation",
    deep: "the RED III regulatory context, sustainability and greenhouse-gas-saving criteria, and eligible feedstocks",
    deepShort: "RED III",
  },
  {
    slug: "iscc-plus-certification", short: "ISCC PLUS", h1: "ISCC PLUS Certification",
    title: "ISCC PLUS Certification Consulting — Bio & Recycled | OffsetEase",
    desc: "ISCC PLUS certification consulting for bio-based and recycled materials in chemicals, plastics, food and feed — mass-balance chain of custody and audit preparation.",
    lead: "Certification for bio-based and recycled materials in chemicals, plastics, food, feed and the circular economy.",
    serviceType: "ISCC PLUS certification consulting",
    certifies: "Bio-based and recycled materials — plastics, chemicals, food, feed",
    market: "Non-energy markets",
    basis: "Mass-balance chain of custody",
    intro: "ISCC PLUS is the ISCC scheme for bio-based and recycled materials in non-energy markets — chemicals, plastics, food and feed. Below: who needs it, how an OffsetEase engagement runs, and what drives cost.",
    coc: "mass-balance bookkeeping, supplier data and documentation",
    deep: "how mass-balance chain of custody works and how the certified attribute is allocated across output",
    deepShort: "mass-balance",
  },
  {
    slug: "iscc-corsia-certification", short: "ISCC CORSIA", h1: "ISCC CORSIA Certification",
    title: "ISCC CORSIA Certification Consulting — SAF | OffsetEase",
    desc: "ISCC CORSIA certification consulting for Sustainable Aviation Fuel and its feedstocks — sustainability documentation and audit preparation for the aviation value chain.",
    lead: "Certification for Sustainable Aviation Fuel and its feedstocks under the ICAO CORSIA programme.",
    serviceType: "ISCC CORSIA certification consulting",
    certifies: "Sustainable Aviation Fuel (SAF) and its feedstocks",
    market: "Aviation",
    basis: "ICAO CORSIA programme <!-- VERIFY: scheme scope against ICAO before publish -->",
    intro: "ISCC CORSIA is the ISCC scheme for Sustainable Aviation Fuel and its feedstocks in the aviation value chain. Below: who needs it, how an OffsetEase engagement runs, and what drives cost.",
    coc: "feedstock data, sustainability records and documentation",
    deep: "the ICAO CORSIA programme context and the SAF value chain",
    deepShort: "CORSIA",
  },
];

const sib = (cur) => schemes.filter((s) => s.slug !== cur);

const steps = (s) => [
  ["Scheme & scope mapping", `Confirm ${s.short} fits your product and market, and define the certification scope and system boundary.`],
  ["Data & chain-of-custody preparation", `Get your ${s.coc} into audit-ready shape.`],
  ["Audit support", "Prepare you for, and support you through, the certification body's audit."],
  ["Surveillance & maintenance", "Keep certification live through ongoing bookkeeping and annual surveillance."],
];

const faqs = (s) => [
  [`Which ISCC scheme do we actually need — EU, PLUS or CORSIA?`,
   `The right scheme depends on your product and target market; ${s.short} is one of four. A short scoping call maps it. See our comparison of ISCC EU, PLUS and CORSIA.`],
  [`How long does ${s.short} certification take?`,
   `It depends on your scope and how ready your data and records are. We work in stages from gap assessment to first-audit readiness, and give an indicative timeline on a scoping call.`],
  [`Do you support the certification audit itself?`,
   `Yes. We prepare your documentation, data and chain-of-custody records, and support you through the certification body's audit and subsequent surveillance.`],
  [`What does ${s.short} certification cost?`,
   `Cost depends on audit scope, supply-chain complexity and internal readiness — see what drives cost above. We give an indicative range on a scoping call.`],
];

const stripTags = (x) => x.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

for (const s of schemes) {
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://offsetease.com/" },
    { "@type": "ListItem", position: 2, name: "Services", item: "https://offsetease.com/services" },
    { "@type": "ListItem", position: 3, name: "ISCC Certification", item: "https://offsetease.com/iscc" },
    { "@type": "ListItem", position: 4, name: s.short } ] };
  const service = { "@context": "https://schema.org", "@type": "Service", serviceType: s.serviceType,
    name: s.h1, description: s.desc, provider: { "@id": ORG_ID }, areaServed: ["IN", "SG", "AE", "EU"],
    url: `https://offsetease.com/${s.slug}` };
  const faqPage = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs(s).map(([q, a]) => (
    { "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: stripTags(a) } })) };
  const jsonld = [breadcrumb, service, faqPage].map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n");

  const stepsHtml = steps(s).map(([t, d], i) =>
    `<li>${CHECK}<div><b>0${i + 1} — ${t}</b><span>${d}</span></div></li>`).join("");
  const faqHtml = faqs(s).map(([q, a]) =>
    `<div class="acc__item"><button class="acc__btn"><h3>${q}</h3><span class="acc__icon">${PLUS}</span></button>` +
    `<div class="acc__panel"><div class="acc__panel-inner"><div class="acc__body"><p>${a
      .replace("comparison of ISCC EU, PLUS and CORSIA", '<a href="iscc-eu-plus-corsia-which-certification">comparison of ISCC EU, PLUS and CORSIA</a>')
      .replace("what drives cost above", '<a href="#cost">what drives cost above</a>')}</p></div></div></div></div>`).join("");
  const schemeCards = schemes.map((x) => {
    const inner = `<h3>${x.short}${x.slug === s.slug ? ' <span style="color:var(--ink-2);font-weight:500">· this page</span>' : ""}</h3><p>${x.certifies}</p>`;
    return x.slug === s.slug
      ? `<div class="card" style="border-color:var(--teal-3);cursor:default">${inner}</div>`
      : `<a class="card" href="${x.slug}">${inner}</a>`;
  }).join("");
  const relatedLis = [
    `<li><a href="iscc">ISCC certification overview</a></li>`,
    `<li><a href="iscc-eu-plus-corsia-which-certification">ISCC EU vs PLUS vs CORSIA: which certification you need</a></li>`,
    ...sib(s.slug).map((x) => `<li><a href="${x.slug}">${x.h1}</a></li>`)].join("");

  const content = `${jsonld}
<main id="app" tabindex="-1">
    <section class="page-header"><div class="container">
      <div class="crumbs"><a href="./">Home</a><span class="sep">/</span><a href="services">Services</a><span class="sep">/</span><a href="iscc">ISCC</a><span class="sep">/</span><span class="current">${s.short}</span></div>
      <span class="eyebrow">Comply</span>
      <h1 style="margin-top:1.25rem">${s.h1}</h1>
      <p class="page-header__lead">${s.lead}</p>
    </div></section>
    ${subnav}
    <section><div class="container split">
      <div class="content-section">
        <p style="font-size:var(--fs-lead);color:var(--ink-2);max-width:64ch">${s.intro}</p>
        <p style="max-width:64ch;margin-top:1.1rem">OffsetEase takes you from scheme scoping through data and chain-of-custody preparation to first-audit readiness and ongoing surveillance — the four steps below. Detailed ${s.deepShort} technical guidance is in preparation; for advice specific to your feedstock and market, <a href="contact">book a consultation</a>.</p>
        ${TODO(`plain-language explanation of ${s.deep} — VERIFY against the issuing body before publish`)}
      </div>
      <aside class="card" style="align-self:start">
        <h3 style="margin-bottom:1rem">At a glance</h3>
        <dl style="display:grid;gap:.9rem;margin:0">
          <div><dt style="font-weight:600;color:var(--ink-2)">What it certifies</dt><dd style="margin:.15rem 0 0">${s.certifies}</dd></div>
          <div><dt style="font-weight:600;color:var(--ink-2)">Market it opens</dt><dd style="margin:.15rem 0 0">${s.market}</dd></div>
          <div><dt style="font-weight:600;color:var(--ink-2)">Basis</dt><dd style="margin:.15rem 0 0">${s.basis}</dd></div>
        </dl>
        <a class="btn btn--primary" href="contact" style="margin-top:1.25rem;display:inline-flex">Discuss ${s.short}</a>
      </aside>
    </div></section>
    <section><div class="container">
      <div class="content-section">
      <h2>How ${s.short} certification runs with OffsetEase</h2>
      <ul class="checklist">${stepsHtml}</ul>
      </div>
    </div></section>
    <section class="bg-paper-2"><div class="container">
      <h2>Which ISCC scheme do you need?</h2>
      <p style="max-width:64ch;color:var(--ink-2)">ISCC is a family of schemes — the right one depends on your product and market.</p>
      <div class="grid-3" style="margin-top:1.5rem">${schemeCards}</div>
      <p style="max-width:64ch;margin-top:1.5rem">Also need product-level carbon data? ISCC also offers Carbon Footprint (CF) certification — see the <a href="iscc-eu-plus-corsia-which-certification">full comparison of all four schemes</a>.</p>
    </div></section>
    <section id="cost"><div class="container"><div class="prose-page">
      <h2>What drives ${s.short} certification cost</h2>
      <p>Cost is not a single number — it depends on your scope. The main drivers:</p>
      <ul>
        <li>Audit scope — how many sites and product groups are in scope</li>
        <li>Supply-chain complexity — number of suppliers and material types</li>
        <li>Internal preparation effort — data readiness and chain-of-custody bookkeeping</li>
        <li>Certification-body audit fees and annual surveillance ${TODO("indicative fee ranges; zero invented figures")}</li>
      </ul>
      <p>For an indicative range for your situation, <a href="contact">book a consultation</a>.</p>
    </div></div></section>
    <section><div class="container">
      <h2>${s.short}: questions buyers ask</h2>
      <div class="acc">${faqHtml}</div>
    </div></section>
    <section class="related-reading"><div class="container">
      <h2>Related reading</h2>
      <ul class="rr-list">${relatedLis}</ul>
    </div></section>
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
  console.log(`wrote ${s.slug}.njk`);
}
