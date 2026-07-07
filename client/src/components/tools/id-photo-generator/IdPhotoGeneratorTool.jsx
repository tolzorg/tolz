import { useState, useMemo, useCallback } from "react";
import { useIdPhotoEditor } from "../../../hooks/useIdPhotoEditor";
import { useSheetLayout } from "../../../hooks/useSheetLayout";
import { mmToPx } from "../../../utils/mmPxConversion";
import IdPhotoDropZone from "./IdPhotoDropZone";
import PhotoEditorCanvas from "./PhotoEditorCanvas";
import TemplateSelector from "./TemplateSelector";
import PaperAndLayoutPanel from "./PaperAndLayoutPanel";
import { resolvePaperDimensions } from "../../../data/paperSizes";
import SheetPreview from "./SheetPreview";
import PreDownloadDialog from "./PreDownloadDialog";
import { generatePrintSheetPdf } from "../../../services/idPhotoService";

const FONT = "var(--font-display)";
const RADIUS = "var(--radius-md)";
const BORDER = "var(--border)";

function SectionHeader({ title }) {
  return (
    <h2 style={{ fontFamily: FONT, fontWeight: 800, fontSize: 15, color: "var(--text-primary)", marginBottom: 12 }}>
      {title}
    </h2>
  );
}

// Composite the final print sheet: paper-sized canvas, flattened (opaque)
// white background, each grid cell filled with the edited photo — rotated
// 90° per cell when the layout's auto-rotation optimization chose that
// orientation. This exact raster is what both PNG/JPEG and PDF export use,
// so the on-screen preview, PNG, JPEG, and PDF are all guaranteed to match.
function compositeSheetCanvas(layout, photoCanvas, paperWidthMM, paperHeightMM) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(mmToPx(paperWidthMM));
  canvas.height = Math.round(mmToPx(paperHeightMM));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cellWpx = mmToPx(layout.cellWidthMM);
  const cellHpx = mmToPx(layout.cellHeightMM);

  for (const cell of layout.cells) {
    const x = mmToPx(cell.x);
    const y = mmToPx(cell.y);
    ctx.save();
    ctx.translate(x + cellWpx / 2, y + cellHpx / 2);
    if (layout.orientationDeg === 90) {
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(photoCanvas, -cellHpx / 2, -cellWpx / 2, cellHpx, cellWpx);
    } else {
      ctx.drawImage(photoCanvas, -cellWpx / 2, -cellHpx / 2, cellWpx, cellHpx);
    }
    ctx.restore();
  }
  return canvas;
}

function sanitizeFilename(name) {
  return (name || "id-photo").replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]+/g, "_").slice(0, 60) || "id-photo";
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl, filename) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export default function IdPhotoGeneratorTool() {
  const editor = useIdPhotoEditor();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [paperId, setPaperId] = useState("a4");
  const [customWidth, setCustomWidth] = useState("");
  const [customHeight, setCustomHeight] = useState("");
  const [customUnit, setCustomUnit] = useState("mm");
  const [duplicateMode, setDuplicateMode] = useState("auto");
  const [manualCount, setManualCount] = useState(4);

  const [showSafeZone, setShowSafeZone] = useState(true);
  const [showCutZone, setShowCutZone] = useState(true);
  const [showBleedZone, setShowBleedZone] = useState(false);
  const [bleedMM, setBleedMM] = useState(0);

  const [pendingExport, setPendingExport] = useState(null); // "png" | "jpeg" | "pdf" | null
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [singlePhotoError, setSinglePhotoError] = useState(null);

  const { widthMM: paperWidthMM, heightMM: paperHeightMM } = resolvePaperDimensions(paperId, customWidth, customHeight, customUnit);

  const layout = useSheetLayout({
    templateWidthMM: selectedTemplate?.widthMM,
    templateHeightMM: selectedTemplate?.heightMM,
    paperWidthMM, paperHeightMM,
    duplicateMode, manualCount,
  });

  const photoCanvas = useMemo(() => {
    if (!editor.sourceCanvas || !selectedTemplate) return null;
    return editor.renderAtTemplate(selectedTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.sourceCanvas, editor.transform, selectedTemplate]);

  const qualityInfo = useMemo(() => {
    if (!editor.sourceCanvas || !selectedTemplate) return null;
    return editor.getQualityInfo(selectedTemplate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor.sourceCanvas, editor.transform, selectedTemplate]);

  const aspectRatio = selectedTemplate ? selectedTemplate.widthMM / selectedTemplate.heightMM : null;

  const handleFile = useCallback((file) => { editor.loadFile(file); }, [editor]);

  const runExport = useCallback(async (format) => {
    if (!photoCanvas || !layout) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const sheet = compositeSheetCanvas(layout, photoCanvas, paperWidthMM, paperHeightMM);
      const baseName = sanitizeFilename(editor.file?.name);

      if (format === "png" || format === "jpeg") {
        const mime = format === "png" ? "image/png" : "image/jpeg";
        const blob = await new Promise((resolve) => sheet.toBlob(resolve, mime, format === "jpeg" ? 0.95 : undefined));
        if (!blob) throw new Error("Export failed — could not generate the image.");
        downloadBlob(blob, `${baseName}_print_sheet.${format === "jpeg" ? "jpg" : "png"}`);
      } else {
        const pngBlob = await new Promise((resolve) => sheet.toBlob(resolve, "image/png"));
        if (!pngBlob) throw new Error("Export failed — could not generate the sheet image.");
        const formData = new FormData();
        formData.append("sheet", pngBlob, "sheet.png");
        formData.append("paperWidthMM", String(paperWidthMM));
        formData.append("paperHeightMM", String(paperHeightMM));
        const dataUrl = await generatePrintSheetPdf(formData);
        downloadDataUrl(dataUrl, `${baseName}_print_sheet.pdf`);
      }
    } catch (err) {
      setExportError(err.message || "Export failed. Please try again.");
    } finally {
      setIsExporting(false);
      setPendingExport(null);
    }
  }, [photoCanvas, layout, paperWidthMM, paperHeightMM, editor.file]);

  // Downloads just the single cropped/edited photo at the template's exact
  // pixel size (no paper layout, no PDF) — handy when the photo is needed
  // on its own (e.g. for an online upload form) rather than for printing.
  const downloadSinglePhoto = useCallback(async (format) => {
    if (!photoCanvas) return;
    setSinglePhotoError(null);
    try {
      const mime = format === "jpeg" ? "image/jpeg" : "image/png";
      const blob = await new Promise((resolve) => photoCanvas.toBlob(resolve, mime, format === "jpeg" ? 0.95 : undefined));
      if (!blob) throw new Error("Download failed — could not generate the image.");
      const baseName = sanitizeFilename(editor.file?.name);
      downloadBlob(blob, `${baseName}_photo.${format === "jpeg" ? "jpg" : "png"}`);
    } catch (err) {
      setSinglePhotoError(err.message || "Download failed. Please try again.");
    }
  }, [photoCanvas, editor.file]);

  const canExport = Boolean(photoCanvas && layout && layout.count > 0);

  return (
    <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Step 1 — Upload */}
      <div className="card" style={{ padding: 20 }}>
        <SectionHeader title="1. Upload your photo" />
        <IdPhotoDropZone onFile={handleFile} disabled={editor.isLoading} hasImage={!!editor.sourceCanvas} />
        {editor.loadError && (
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--error)", fontWeight: 500, marginTop: 10 }}>
            ⚠ {editor.loadError}
          </p>
        )}
        {editor.isLoading && (
          <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--text-muted)", marginTop: 10 }}>
            {editor.isSegmenting ? "Removing background (first time may take a few seconds to load the AI model)…" : "Processing image…"}
          </p>
        )}
        {editor.sourceCanvas && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={editor.removeBackground}
                disabled={editor.isLoading}
                onChange={(e) => editor.toggleRemoveBackground(e.target.checked)}
                style={{ accentColor: "var(--accent)" }}
              />
              <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
                Remove background (AI) — replaces the background on any photo, not just transparent ones
              </span>
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: "var(--text-muted)" }}>
                Background color
              </span>
              <input
                type="color"
                value={editor.backgroundColor}
                disabled={editor.isLoading}
                onChange={(e) => editor.applyBackgroundColor(e.target.value)}
                style={{ width: 34, height: 34, borderRadius: RADIUS, border: `1.5px solid ${BORDER}`, cursor: "pointer", padding: 2 }}
              />
              {editor.backgroundColor.toLowerCase() !== "#ffffff" && (
                <button type="button" onClick={() => editor.applyBackgroundColor("#ffffff")} style={{
                  border: "none", background: "none", color: "var(--accent)", fontFamily: FONT,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>
                  Reset to white
                </button>
              )}
            </div>
            {!editor.removeBackground && (
              <p style={{ fontFamily: FONT, fontSize: 11.5, color: "var(--text-muted)", margin: 0 }}>
                Without "Remove background," this color only shows through transparent areas of PNG/WebP photos.
              </p>
            )}
          </div>
        )}
      </div>

      {editor.sourceCanvas && (
        <>
          {/* Step 2 — Choose template */}
          <div className="card" style={{ padding: 20 }}>
            <SectionHeader title="2. Choose a template" />
            <TemplateSelector selectedTemplate={selectedTemplate} onSelect={setSelectedTemplate} />
          </div>

          {selectedTemplate && (
            <>
              {/* Step 3 — Edit */}
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="3. Crop & adjust" />
                <PhotoEditorCanvas
                  sourceCanvas={editor.sourceCanvas}
                  transform={editor.transform}
                  aspectRatio={aspectRatio}
                  onPan={editor.setPan}
                  onZoom={editor.setZoom}
                  onRotateBy={editor.rotateBy}
                  onSetRotation={editor.setRotationDeg}
                  onToggleFlipH={editor.toggleFlipH}
                  onToggleFlipV={editor.toggleFlipV}
                  onResetOriginal={editor.resetToOriginal}
                  onResetTemplateFraming={editor.resetToTemplateFraming}
                />
                {qualityInfo?.warning && (
                  <div style={{
                    marginTop: 12, display: "flex", gap: 8, padding: "10px 14px", borderRadius: RADIUS,
                    background: "var(--warning-light)", border: "1px solid var(--warning)",
                  }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>ⓘ</span>
                    <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--text-primary)", margin: 0, lineHeight: 1.5 }}>
                      {qualityInfo.warning} Max recommended print size at this crop: ~{qualityInfo.maxPrintMM.width.toFixed(0)} × {qualityInfo.maxPrintMM.height.toFixed(0)} mm.
                    </p>
                  </div>
                )}

                {singlePhotoError && (
                  <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--error)", fontWeight: 500, marginTop: 12 }}>
                    ⚠ {singlePhotoError}
                  </p>
                )}

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                  <button type="button" disabled={!photoCanvas} onClick={() => downloadSinglePhoto("png")} className="btn btn-secondary" style={{ opacity: photoCanvas ? 1 : 0.5 }}>
                    Download single photo (PNG)
                  </button>
                  <button type="button" disabled={!photoCanvas} onClick={() => downloadSinglePhoto("jpeg")} className="btn btn-secondary" style={{ opacity: photoCanvas ? 1 : 0.5 }}>
                    Download single photo (JPEG)
                  </button>
                </div>
              </div>

              {/* Step 4 — Paper & layout */}
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="4. Paper & print layout" />
                <PaperAndLayoutPanel
                  paperId={paperId} onPaperChange={setPaperId}
                  customWidth={customWidth} customHeight={customHeight} customUnit={customUnit}
                  onCustomChange={(patch) => {
                    if (patch.width !== undefined) setCustomWidth(patch.width);
                    if (patch.height !== undefined) setCustomHeight(patch.height);
                    if (patch.unit !== undefined) setCustomUnit(patch.unit);
                  }}
                  duplicateMode={duplicateMode} onDuplicateModeChange={setDuplicateMode}
                  manualCount={manualCount} onManualCountChange={setManualCount}
                  layout={layout}
                />
              </div>

              {/* Step 5 — Preview */}
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="5. Print sheet preview" />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
                  {[
                    { key: "cut", label: "Cut line", state: showCutZone, set: setShowCutZone },
                    { key: "safe", label: "Safe zone", state: showSafeZone, set: setShowSafeZone },
                    { key: "bleed", label: "Bleed", state: showBleedZone, set: setShowBleedZone },
                  ].map((z) => (
                    <button
                      key={z.key}
                      type="button"
                      onClick={() => z.set(!z.state)}
                      style={{
                        padding: "6px 12px", borderRadius: 99,
                        border: `1.5px solid ${z.state ? "var(--accent)" : BORDER}`,
                        background: z.state ? "var(--accent-light)" : "var(--bg-white)",
                        color: z.state ? "var(--accent)" : "var(--text-muted)",
                        fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}
                    >
                      {z.label}
                    </button>
                  ))}
                  {showBleedZone && (
                    <input
                      type="number" min="0" max="3" step="0.5" value={bleedMM}
                      onChange={(e) => setBleedMM(parseFloat(e.target.value) || 0)}
                      style={{ width: 70, padding: "5px 8px", borderRadius: 99, border: `1.5px solid ${BORDER}`, fontFamily: FONT, fontSize: 12 }}
                    />
                  )}
                </div>
                <SheetPreview
                  layout={layout} photoCanvas={photoCanvas}
                  showSafeZone={showSafeZone} showCutZone={showCutZone} showBleedZone={showBleedZone}
                  safeMM={3} bleedMM={bleedMM}
                />
              </div>

              {/* Step 6 — Export */}
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="6. Download" />
                {exportError && (
                  <p style={{ fontFamily: FONT, fontSize: 12.5, color: "var(--error)", fontWeight: 500, marginBottom: 10 }}>
                    ⚠ {exportError}
                  </p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <button type="button" disabled={!canExport} onClick={() => setPendingExport("pdf")} className="btn btn-primary" style={{ opacity: canExport ? 1 : 0.5 }}>
                    Download PDF (print-ready)
                  </button>
                  <button type="button" disabled={!canExport} onClick={() => setPendingExport("png")} className="btn btn-secondary" style={{ opacity: canExport ? 1 : 0.5 }}>
                    Download PNG
                  </button>
                  <button type="button" disabled={!canExport} onClick={() => setPendingExport("jpeg")} className="btn btn-secondary" style={{ opacity: canExport ? 1 : 0.5 }}>
                    Download JPEG
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <PreDownloadDialog
        open={!!pendingExport}
        onCancel={() => setPendingExport(null)}
        onConfirm={() => runExport(pendingExport)}
        qualityWarning={qualityInfo?.warning}
      />

      {isExporting && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,255,255,0.7)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "var(--text-primary)" }}>Preparing your download…</p>
        </div>
      )}
    </div>
  );
}
