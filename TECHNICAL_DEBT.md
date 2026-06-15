# Technical Debt

## Base64 File Encoding — ~33% Payload Overhead

**Location:** All PDF and image processing controllers
(`server/tools/pdfCompress/controller/pdfCompressController.js`,
`server/tools/pdfMerge/`, `server/tools/pdfSplit/`, `server/tools/pdfToWord/`,
`server/tools/imageConverter/`, `server/tools/imageCompressor/`)

**Current behavior:**
All processed files are returned as `data:…;base64,…` strings embedded in JSON responses.

**Problem:**
Base64 encoding inflates binary data by approximately 33%. A 25 MB PDF becomes a ~35 MB JSON response body. This adds network transfer time, memory pressure (the entire payload must be buffered before the client can act), and CPU time for encoding/decoding.

At current scale (Render free tier, low traffic) this is acceptable. At higher traffic or with large files, it becomes a meaningful bottleneck.

**Recommended future fix:**
Stream files directly with `Content-Disposition: attachment` response headers instead of embedding them in JSON.

```js
// Example: streaming a Buffer directly instead of base64
res.setHeader("Content-Type", "application/pdf");
res.setHeader("Content-Disposition", `attachment; filename="${outputName}"`);
res.send(pdfBytes); // Buffer
```

For batch operations (multiple files), the best alternative is a ZIP stream:
1. Server collects processed buffers
2. Pipes them through a ZIP compressor (e.g., `archiver` or `yazl`)
3. Streams the ZIP to the client with `Content-Type: application/zip`

This eliminates the 33% overhead, reduces peak memory usage (streaming vs. buffering),
and gives users a single download file for batch operations.

**Effort estimate:** Medium — requires changes to all processing controllers + frontend
download handling (replacing `<a href="data:…">` with a fetch + blob URL pattern).

**Priority:** Low — implement when average file sizes or request volume increase enough
that the overhead becomes measurable in p95 latency.
