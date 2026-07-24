#!/usr/bin/env bash
# Run against PRODUCTION after deploy: bash scripts/seo-verify.sh
set -uo pipefail
BASE="https://offsetease.com"
FAIL=0

echo "=== 1. .html redirects (expect 301 -> extensionless) ==="
for s in cbam cdp climate-risk ecovadis epd esg-reporting ghg-accounting \
         life-cycle-assessment privacy product-carbon-footprint resources; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$s.html")
  loc=$(curl -s -o /dev/null -w "%{redirect_url}" "$BASE/$s.html")
  [ "$code" = "301" ] && [ "$loc" = "$BASE/$s" ] \
    && echo "  PASS  /$s.html -> $loc" \
    || { echo "  FAIL  /$s.html => $code $loc"; FAIL=1; }
done

echo "=== 2. Canonical targets return 200 ==="
for s in cbam cdp climate-risk ecovadis epd esg-reporting ghg-accounting \
         life-cycle-assessment privacy product-carbon-footprint resources iscc; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$s")
  [ "$code" = "200" ] && echo "  PASS  /$s" || { echo "  FAIL  /$s => $code"; FAIL=1; }
done

echo "=== 3. Redirect chain depth (expect <= 2 hops) ==="
hops=$(curl -sIL -o /dev/null -w "%{num_redirects}" "http://www.offsetease.com/cbam.html")
[ "$hops" -le 2 ] && echo "  PASS  $hops hops" || { echo "  FAIL  $hops hops"; FAIL=1; }

echo "=== 4. www -> apex on a deep URL ==="
curl -sI "https://www.offsetease.com/iscc" | grep -iE "^(HTTP|location)"

echo "=== 5. Sitemap contains no .html and is reachable ==="
curl -s "$BASE/sitemap.xml" | grep -c "\.html<" | \
  { read n; [ "$n" = "0" ] && echo "  PASS  no .html entries" || { echo "  FAIL  $n .html entries"; FAIL=1; }; }

echo "=== 6. robots.txt permits AI crawlers ==="
curl -s "$BASE/robots.txt" | grep -iE "GPTBot|ClaudeBot|PerplexityBot" >/dev/null \
  && echo "  PASS" || { echo "  FAIL"; FAIL=1; }

echo "=== 7. JSON-LD present on key templates ==="
for u in "" iscc iscc-eu-plus-corsia-which-certification contact; do
  n=$(curl -s "$BASE/$u" | grep -c 'application/ld+json')
  [ "$n" -gt 0 ] && echo "  PASS  /$u ($n blocks)" || { echo "  FAIL  /$u (0 blocks)"; FAIL=1; }
done

echo "=== 8. Article links to its service page (in-body) ==="
curl -s "$BASE/iscc-eu-plus-corsia-which-certification" | grep -q 'href="[^"]*iscc"' \
  && echo "  PASS  article -> /iscc" || { echo "  FAIL  article -> /iscc MISSING"; FAIL=1; }

echo "=== 9. Duplicate titles across sitemap URLs ==="
curl -s "$BASE/sitemap.xml" | grep -oE '<loc>[^<]+' | sed 's/<loc>//' | while read -r u; do
  curl -s "$u" | grep -oE '<title>[^<]*</title>'
done | sort | uniq -d | sed 's/^/  DUPLICATE TITLE: /'

echo "=== 10. Previously unindexed pages return 200 ==="
for s in pharma textiles manufacturing metals consumer terms esg-reporting ifrs-s1-s2-issb-explained sitemap; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/$s")
  [ "$code" = "200" ] && echo "  PASS  /$s" || { echo "  FAIL  /$s => $code"; FAIL=1; }
done

exit $FAIL
