#!/usr/bin/env bash
# Downloads Tesseract language data into server/tessdata/ if not present.
# Runs automatically during `npm run build` on non-Windows platforms (Render, etc.).
set -euo pipefail

BINDIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Tesseract language data ─────────────────────────────────────────────────────
TESSDIR="$(dirname "$BINDIR")/tessdata"
mkdir -p "$TESSDIR"
if [ ! -f "$TESSDIR/eng.traineddata" ]; then
  echo "[install] Downloading Tesseract eng.traineddata..."
  curl -fsSL \
    "https://github.com/tesseract-ocr/tessdata_fast/raw/main/eng.traineddata" \
    -o "$TESSDIR/eng.traineddata"
  echo "[install] eng.traineddata installed at $TESSDIR/eng.traineddata"
else
  echo "[install] eng.traineddata already present — skipping"
fi
