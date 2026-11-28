#!/usr/bin/env bash
# Verifies the duplicate-URL redirects in render.yaml (see deploy/REDIRECTS.md).
# Usage: bash deploy/verify-redirects.sh           # every line
#        bash deploy/verify-redirects.sh --quiet   # failures + totals only
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
QUIET="${1:-}"
SITE="https://www.tolz.org"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
say() { [ "$QUIET" = "--quiet" ] || echo "$1"; }

# old -> target pairs, straight from render.yaml (source/destination of each redirect)
awk '/type: redirect/{r=1;next} r&&/source:/{s=$2;next} r&&/destination:/{print s, $2; r=0}' "$ROOT/render.yaml" > "$TMP/map"
total=$(wc -l < "$TMP/map"); echo "redirects in render.yaml: $total"

ok=0; bad=0
echo "=== 1. Old URL (https://www) -> exactly one 301 -> target, target 200"
while read -r old target; do
  url="$SITE$old"; want="$SITE$target"
  out=$(curl -s -o /dev/null -w "%{http_code} %{redirect_url}" "$url")
  fin=$(curl -s -o /dev/null -L --max-redirs 10 -w "%{http_code} %{num_redirects} %{url_effective}" "$url")
  if [ "$out" = "301 $want" ] && [ "$fin" = "200 1 $want" ]; then ok=$((ok+1)); say "OK   $url -> 301 -> $want (200, 1 hop)"
  else bad=$((bad+1)); echo "FAIL $url -> first: $out | final: $fin"; fi
done < "$TMP/map"
echo "result: $ok OK, $bad FAIL (of $total)"

echo "=== 2. Variants (http / non-www / trailing slash): hops and final URL"
# Render does http->https and tolz.org->www itself, before our rules, so these can take 2-3 hops.
vok=0; vbad=0
while read -r old target; do
  want="$SITE$target"
  for url in "http://tolz.org$old" "https://tolz.org$old" "http://www.tolz.org$old" "$SITE$old/"; do
    fin=$(curl -s -o /dev/null -L --max-redirs 10 -w "%{http_code} %{num_redirects} %{url_effective}" "$url")
    set -- $fin
    if [ "$1" = "200" ] && [ "$3" = "$want" ] && [ "$2" -le 3 ]; then vok=$((vok+1)); say "OK   $url -> $want ($2 hops)"
    else vbad=$((vbad+1)); echo "FAIL $url -> $fin (want 200, <=3 hops, $want)"; fi
  done
done < "$TMP/map"
echo "result: $vok OK, $vbad FAIL (of $((total*4)))"

echo "=== 3. Targets: raw HTML canonical (curl, not the rendered DOM) and /tools/x/ slash"
cok=0; cbad=0
cut -d' ' -f2 "$TMP/map" | sort -u > "$TMP/targets"
while read -r t; do
  curl -s "$SITE$t" -o "$TMP/body"
  canon=$(grep -io '<link rel="canonical"[^>]*>' "$TMP/body" | head -1)
  if echo "$canon" | grep -q "href=\"$SITE$t\""; then cok=$((cok+1)); say "OK   $t raw canonical self"
  else cbad=$((cbad+1)); say "MISS $t raw canonical: ${canon:-(none)}"; fi
  say "     $t/ -> $(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "$SITE$t/")"
done < "$TMP/targets"
echo "result: $cok self-canonical in raw HTML, $cbad without (of $(wc -l < "$TMP/targets"))"

echo "=== 4. Untouched /calculators/construction pages (must stay 200, no redirect)"
uok=0; ubad=0
for s in baluster river-rock brick rip-rap rebar aluminum-weight retaining-wall decking rolling-offset diy-shed-cost sag board-and-batten drywall sand fire-glass glass-weight sealant framing sonotube french-drain; do
  u="$SITE/calculators/construction/$s"; code=$(curl -s -o /dev/null -w "%{http_code}" "$u")
  if [ "$code" = "200" ]; then uok=$((uok+1)); say "OK   200 $u"; else ubad=$((ubad+1)); echo "FAIL $u -> $code"; fi
done
echo "result: $uok OK, $ubad FAIL (of 20)"
