// Magic-byte validators — defense-in-depth against spoofed Content-Type headers.
// Multer trusts the client's declared MIME type; this checks the actual file bytes.

function startsWith(buf, magic, offset = 0) {
  if (buf.length < offset + magic.length) return false;
  return magic.every((b, i) => buf[offset + i] === b);
}

function detectMime(buffer) {
  if (buffer.length < 12) return null;
  // JPEG
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return "image/jpeg";
  // PNG
  if (startsWith(buffer, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return "image/png";
  // WebP: RIFF at 0 + WEBP at 8
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
      startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  // GIF
  if (startsWith(buffer, [0x47, 0x49, 0x46])) return "image/gif";
  // BMP
  if (buffer[0] === 0x42 && buffer[1] === 0x4D) return "image/bmp";
  // TIFF (little-endian or big-endian)
  if (startsWith(buffer, [0x49, 0x49, 0x2A, 0x00]) ||
      startsWith(buffer, [0x4D, 0x4D, 0x00, 0x2A])) return "image/tiff";
  // ISO Base Media File Format — 'ftyp' box is always at offset 4 for HEIC/HEIF/AVIF.
  // Read the major brand (bytes 8-11) to distinguish HEIC/HEIF/AVIF from other
  // ISOBMFF containers such as MP4, MOV, M4A, 3GP, which share the same ftyp signature.
  if (startsWith(buffer, [0x66, 0x74, 0x79, 0x70], 4)) {
    const brand = String.fromCharCode(buffer[8], buffer[9], buffer[10], buffer[11]);
    // AV1 Image File Format — separate codec, cannot be decoded by heic-convert
    if (/^(avif|avis|MA1A|MA1B)$/.test(brand)) return "image/avif";
    // HEIF multi-image / sequence containers (iPhone burst, Live Photo video stream)
    if (/^(heif|mif1|msf1)$/.test(brand)) return "image/heif";
    // Standard HEIC brands (Apple iPhone, iPad, Samsung, other HEVC devices)
    if (/^(heic|heis|heix|hevc|hevx|heim|hevm|hevs|avci)$/.test(brand)) return "image/heic";
    return null; // other ISOBMFF (MP4, MOV, M4A, 3GP…) — not an image, reject
  }
  // PDF
  if (startsWith(buffer, [0x25, 0x50, 0x44, 0x46])) return "application/pdf";
  return null;
}

export function isPdf(buffer) {
  return detectMime(buffer) === "application/pdf";
}

const JPEG_ALIASES = new Set(["image/jpeg", "image/jpg"]);

export function isAcceptedImage(buffer, allowedMimes) {
  const detected = detectMime(buffer);
  if (!detected) return false;
  if (JPEG_ALIASES.has(detected))
    return allowedMimes.has("image/jpeg") || allowedMimes.has("image/jpg");
  // heic and heif are the same format family (HEVC-encoded ISOBMFF images).
  // A file detected as either is accepted if the route permits either type.
  // avif is a distinct codec handled separately via the general fallthrough below.
  if (detected === "image/heic" || detected === "image/heif")
    return allowedMimes.has("image/heic") || allowedMimes.has("image/heif");
  return allowedMimes.has(detected);
}

// ── Express middleware ─────────────────────────────────────────────────────────

export function validatePdfFiles(req, res, next) {
  const files = req.files || (req.file ? [req.file] : []);
  for (const file of files) {
    if (!isPdf(file.buffer)) {
      return res.status(400).json({
        success: false,
        error: `"${file.originalname}" does not appear to be a valid PDF.`,
      });
    }
  }
  next();
}

export function validateImageFiles(allowedMimes) {
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    for (const file of files) {
      if (!isAcceptedImage(file.buffer, allowedMimes)) {
        return res.status(400).json({
          success: false,
          error: `"${file.originalname}" does not appear to be a valid image file.`,
        });
      }
    }
    next();
  };
}
