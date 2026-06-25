import { useParams, Link } from "react-router-dom";
import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ImageConverterTool from "../components/tools/image-converter/ImageConverterTool";
import SEO from "../components/SEO";
import JsonLd from "../components/JsonLd";

const META = {
  "to-jpg": {
    label: "Image to JPG",
    description: "Convert PNG, WebP, BMP, TIFF, GIF and other formats to JPG instantly.",
    icon: "🔄", iconBg: "#fef3c7",
  },
  "to-jpeg": {
    label: "Image to JPEG",
    description: "Convert any supported image format to JPEG with high quality output.",
    icon: "🖼", iconBg: "#ede9fe",
  },
  "heic-to-jpg": {
    label: "HEIC to JPG",
    description: "Convert iPhone HEIC/HEIF photos to universally compatible JPG format.",
    icon: "📱", iconBg: "#f0fdf4",
  },
  "images-to-pdf": {
    label: "Images to PDF",
    description: "Combine multiple images into a single, shareable PDF document.",
    icon: "📄", iconBg: "#eff6ff",
  },
  "jpg-to-pdf-100kb": {
    label: "JPG to PDF — Under 100 KB",
    description: "Convert JPG images into a compressed PDF file that stays under 100 KB.",
    icon: "📦", iconBg: "#fff0f0",
  },
  "jpg-to-pdf-500kb": {
    label: "JPG to PDF — Under 500 KB",
    description: "Convert JPG images into a compressed PDF file that stays under 500 KB.",
    icon: "📦", iconBg: "#fff7ed",
  },
  "jpg-to-text": {
    label: "JPG to Text (OCR)",
    description: "Extract editable text from images using optical character recognition.",
    icon: "📝", iconBg: "#fefce8",
  },
  "jpeg-to-png": {
    label: "JPEG to PNG",
    description: "Convert JPEG images to lossless PNG format, preserving full quality.",
    icon: "🔁", iconBg: "#ecfeff",
  },
};

export default function ImageConverterSubPage() {
  const { toolId } = useParams();
  const meta = META[toolId];

  if (!meta) {
    return (
      <div style={{ padding: "60px 24px", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text-muted)", marginBottom: 16 }}>
          Tool not found.
        </p>
        <Link to="/tools/image-converter" className="btn btn-primary">
          Back to Image Converter
        </Link>
      </div>
    );
  }

  const toolSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: meta.label,
    description: meta.description,
    url: `https://www.tolz.org/tools/image-converter/${toolId}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.tolz.org" },
      { "@type": "ListItem", position: 2, name: "Image Converter", item: "https://www.tolz.org/tools/image-converter" },
      { "@type": "ListItem", position: 3, name: meta.label, item: `https://www.tolz.org/tools/image-converter/${toolId}` },
    ],
  };

  return (
    <article style={{ minHeight: "calc(100vh - 60px)" }}>
      <SEO
        title={`${meta.label} — Free Online Tool`}
        description={meta.description}
        path={`/tools/image-converter/${toolId}`}
      />
      <JsonLd data={toolSchema} />
      <JsonLd data={breadcrumbSchema} />

      {/* Header */}
      <div className="tool-page-header">
        <div className="container">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              marginBottom: 20, fontSize: 13,
              color: "var(--text-muted)", fontFamily: "var(--font-display)",
            }}
          >
            <Link to="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >Home</Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <Link to="/tools/image-converter" style={{ color: "var(--text-muted)", textDecoration: "none", fontWeight: 500 }}
              onMouseEnter={(e) => (e.target.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
            >Image Converter</Link>
            <span aria-hidden="true" style={{ opacity: 0.4 }}>›</span>
            <span aria-current="page" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{meta.label}</span>
          </nav>

          {/* Tool header */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div
              aria-hidden="true"
              style={{
                width: 56, height: 56,
                background: meta.iconBg,
                borderRadius: 14,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 26, flexShrink: 0,
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {meta.icon}
            </div>
            <div>
              <h1
                className="animate-fadeUp"
                style={{
                  fontFamily: "var(--font-display)", fontWeight: 800,
                  fontSize: "clamp(22px, 4vw, 30px)",
                  color: "var(--text-primary)", letterSpacing: "-0.025em", marginBottom: 6,
                }}
              >
                {meta.label}
              </h1>
              <p
                className="animate-fadeUp delay-100"
                style={{ color: "var(--text-secondary)", fontSize: 15, maxWidth: 520 }}
              >
                {meta.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool body */}
      <section aria-label={`${meta.label} workspace`} className="tool-page-body">
        <ImageConverterTool toolId={toolId} />
      </section>
    </article>
  );
}
