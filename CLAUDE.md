# OffsetEase — repo conventions

Flat static HTML site (no build system). Each page is a self-contained `.html`
file at the repo root with its own inline `<style>` and JSON-LD.

## SEO invariants (do not regress)
- All page content must be present in server-rendered HTML. No client-side-only content.
- Canonical URLs are extensionless and self-referencing: `https://offsetease.com/{slug}`.
- Never create or link a `.html`-suffixed URL. Internal links are relative + extensionless
  (`href="iscc"`). `_redirects` 301s all `.html` URLs (active once hosted on Netlify/Cloudflare Pages).
- Every page needs a unique `<title>` (≤60 chars) and `<meta name="description">` (150–160 chars),
  mirrored into og: and twitter: tags.
- Every page emits Organization/ProfessionalService JSON-LD; service pages emit Service; articles
  emit BlogPosting; pages with FAQ blocks emit FAQPage whose text matches the DOM exactly.
- sitemap.xml contains only canonical, extensionless, 200-status URLs.

## Privacy invariants
- No tracking or advertising cookies. No GA4, no GTM, no Meta pixel, no consent SDK.
- Analytics, if any, must be cookieless (Plausible/Fathom/Umami).

## Content invariants
- Never invent author names, credentials, addresses, phone numbers, prices, or client names.
  Leave a TODO and flag it. See `authors.json` and `SEO-TODO.md`.
- Never state a technical claim about RED III, ISCC, CBAM or EUDR without a source — these are
  compliance claims with legal exposure.
