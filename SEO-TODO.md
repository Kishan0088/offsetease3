# OffsetEase — SEO remediation status & handoff

Branch: `seo-remediation`. All work committed one-phase-per-commit. This is a
flat static site (no build system), served today by **GitHub Pages**.

## ✅ Done in this branch

| Phase | What | Notes |
|---|---|---|
| 1 | `_redirects` + `netlify.toml` — 301 `.html` → extensionless | **Inactive on GitHub Pages** (it can't 301). Activates on migration — see below. |
| 2 | robots.txt: added Claude-Web, Applebot-Extended, CCBot | sitemap.xml + llms.txt were already correct. |
| 4 | Keyword-first `<title>` + meta description on 19 pages | og/twitter mirrored. No duplicate titles. Visible copy untouched. |
| 5a | In-body article→service links in all 13 articles | Contextual sentence in the opening paragraph. |
| 5b/5c | "Related reading" service→article blocks (15 pages) + service→industry links (6 pages) | Native-styled, before the CTA band. |
| 5d | `/sitemap` HTML page + sitewide footer link | Registered in sitemap.xml. |

## 🚚 To activate PHASE 1 — migrate hosting (you do this; ~15 min)

GitHub Pages cannot serve 301 redirects, so the duplicate `/slug` + `/slug.html`
URLs stay live until the site moves. The repo already contains a working
`_redirects` (Netlify **and** Cloudflare Pages read it).

**Netlify (recommended):**
1. Netlify → *Add new site* → *Import from GitHub* → pick `Kishan0088/offsetease3`.
2. Build command: *(leave empty)*. Publish directory: `.` (root). Deploy.
3. Verify on the temporary `*.netlify.app` URL: `/cbam.html` → 301 → `/cbam`.
4. Domain settings → add `offsetease.com` + `www.offsetease.com`; set apex as
   primary so `www` 301s to it. Netlify issues the TLS cert.
5. Update DNS at your registrar to Netlify's records; **remove the GitHub Pages
   A/CNAME records**. Delete the `CNAME` file only after DNS is fully cut over
   (it's harmless on Netlify but no longer needed).
6. Re-run `scripts/seo-verify.sh` against production.

**Cloudflare Pages:** same idea — connect the repo, framework preset *None*,
build output `/`. The same `_redirects` applies.

> ⚠️ Also fix the current **GitHub Pages build status: errored** if you keep
> Pages live during transition, or recent pushes won't deploy.

## ⛔ Blocked on your input — I will not fabricate these

1. **Named article authors** (PHASE 3e). Every article is bylined
   "By OffsetEase Advisory" and BlogPosting `author` is the Organization.
   Google rewards named `Person` authors with credentials.
   → Fill in `authors.json` (real names, titles, LinkedIn). Then tell me
   "apply authors.json" and I'll wire the byline + BlogPosting schema on all 13
   articles and add `Person` schema to `/leadership`. The `/leadership` page is
   currently anonymous by design, so this needs real people first.

## ✅ Resolved with your input (2026-07-24)

- **Postal address + phone** (PHASE 3a) — added sitewide to the Organization
  schema: PostalAddress (Ahmedabad, Gujarat, IN), telephone +91 88661 42748,
  email info@offsetease.com and LinkedIn were already present. Not yet shown
  as visible text on /contact — say the word if you want it displayed there too.

## 🧩 Not started (need decisions / human content)

- **PHASE 6 — three new ISCC scheme pages** (`/iscc-eu-certification`,
  `/iscc-plus-certification`, `/iscc-corsia-certification`). Scaffolding is safe;
  body copy is a compliance-liability job (RED III / mass-balance claims). Say
  the word and I'll scaffold them fully wired with `TODO` copy markers.
- **PHASE 7 — performance/assets**: explicit `width`/`height` on every `<img>`,
  `loading="lazy"` below the fold, font preload, per-page OG images. Mechanical;
  I can do most of it — flag if you want it.

## 🔍 After deploy — Google Search Console (only you can do this)

- Resubmit `sitemap.xml`.
- URL Inspection → Request Indexing on the 11 extensionless URLs + the 8
  zero-impression pages.
- Pages report → watch "Duplicate, Google chose different canonical" drop.
- `scripts/seo-verify.sh` (from the brief) validates redirects/canonicals/JSON-LD
  against production.
