// One-off generator: extract the shared service-page shell from iscc.html into a
// reusable Eleventy layout (_includes/base.njk). Heavy shared chunks (CSS, header,
// footer/scripts, Organization JSON-LD) are wrapped in {% raw %} so Nunjucks does
// not try to parse CSS/JS braces. Per-page values become front-matter slots.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const h = readFileSync("iscc.html", "utf8");
const headStart = h.indexOf("<head>");
const headEnd = h.indexOf("</head>");
const canon = h.match(/<link rel="canonical"[^>]*>/)[0];
const canonEnd = h.indexOf(canon) + canon.length;
const preconnectStart = h.indexOf('<link rel="preconnect"');
const bodyOpenStart = h.indexOf("<body>");
const mainStart = h.indexOf('<main id="app">');
const mainEnd = h.lastIndexOf("</main>") + "</main>".length;

// Organization JSON-LD (block0, shared sitewide)
const org = h.match(/<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"ProfessionalService".*?<\/script>/s)[0];

// head-top: <head> .. canonical (templated with slots)
let headTop = h.slice(headStart, canonEnd);
headTop = headTop
  .replace(/<title>.*?<\/title>/s, "<title>{{ title }}</title>")
  .replace(/(<meta name="description" content=")[^"]*(")/, "$1{{ description }}$2")
  .replace(/(<meta property="og:title" content=")[^"]*(")/, "$1{{ title }}$2")
  .replace(/(<meta property="og:description" content=")[^"]*(")/, "$1{{ description }}$2")
  .replace(/(<meta property="og:url" content="https:\/\/offsetease\.com\/)[^"]*(")/, "$1{{ slug }}$2")
  .replace(/(<meta name="twitter:title" content=")[^"]*(")/, "$1{{ title }}$2")
  .replace(/(<meta name="twitter:description" content=")[^"]*(")/, "$1{{ description }}$2")
  .replace(/(<meta name="robots" content=")[^"]*(")/, '$1{{ robots or "index, follow" }}$2')
  .replace(/(<link rel="canonical" href="https:\/\/offsetease\.com\/)[^"]*(")/, "$1{{ slug }}$2");

// head-tail: preconnect .. </head> (fonts + <style>), raw.
// Strip any page-specific JSON-LD living here (iscc's Breadcrumb/Service/FAQPage
// @graph sits after the preconnect links) so it does NOT leak into every page.
const headTail = h
  .slice(preconnectStart, headEnd)
  .replace(/<script type="application\/ld\+json">.*?<\/script>\s*/gs, "");
// body open: <body> + header, raw
const bodyOpen = h.slice(bodyOpenStart, mainStart);
// trailing: cookie banner + footer + scripts + close, raw
const trailing = h.slice(mainEnd);

const layout = `<!DOCTYPE html>
<html lang="en">
${headTop}
{% raw %}${org}{% endraw %}
{% if jsonld %}<script type="application/ld+json">{{ jsonld | safe }}</script>{% endif %}
{% raw %}${headTail}{% endraw %}
</head>
{% raw %}${bodyOpen}{% endraw %}
{{ content | safe }}
{% raw %}${trailing}{% endraw %}`;

mkdirSync("_includes", { recursive: true });
writeFileSync("_includes/base.njk", layout);
console.log("wrote _includes/base.njk", layout.length, "bytes");
