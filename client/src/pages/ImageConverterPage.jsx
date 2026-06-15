import { Link } from "react-router-dom";
import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import { getToolById } from "../utils/tools";

const SUB_TOOLS = [
  {
    id: "to-jpg",
    label: "Image to JPG",
    tagline: "PNG, WebP, BMP, TIFF → JPG",
    icon: "🔄",
    iconBg: "#fef3c7",
  },
  {
    id: "to-jpeg",
    label: "Image to JPEG",
    tagline: "Any format → JPEG",
    icon: "🖼",
    iconBg: "#ede9fe",
  },
  {
    id: "heic-to-jpg",
    label: "HEIC to JPG",
    tagline: "iPhone photos → JPG",
    icon: "📱",
    iconBg: "#f0fdf4",
  },
  {
    id: "images-to-pdf",
    label: "Images to PDF",
    tagline: "Combine images into one PDF",
    icon: "📄",
    iconBg: "#eff6ff",
  },
  {
    id: "jpg-to-pdf-100kb",
    label: "JPG to PDF < 100 KB",
    tagline: "Compressed PDF under 100 KB",
    icon: "📦",
    iconBg: "#fff0f0",
  },
  {
    id: "jpg-to-pdf-500kb",
    label: "JPG to PDF < 500 KB",
    tagline: "Compressed PDF under 500 KB",
    icon: "📦",
    iconBg: "#fff7ed",
  },
  {
    id: "jpg-to-text",
    label: "JPG to Text (OCR)",
    tagline: "Extract text from images",
    icon: "📝",
    iconBg: "#fefce8",
  },
  {
    id: "jpeg-to-png",
    label: "JPEG to PNG",
    tagline: "Convert JPEG to lossless PNG",
    icon: "🔁",
    iconBg: "#ecfeff",
  },
];

export default function ImageConverterPage() {
  const tool = getToolById("image-converter");

  return (
    <ToolPageWrapper tool={tool}>
      <div className="animate-fadeUp" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", fontFamily: "var(--font-display)", fontWeight: 500 }}>
          Choose a conversion tool below:
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 14,
        }}>
          {SUB_TOOLS.map((st, i) => (
            <Link
              key={st.id}
              to={`/tools/image-converter/${st.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card animate-fadeUp"
                style={{
                  padding: "20px 18px",
                  animationDelay: `${i * 55}ms`,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  transition: "all 0.18s ease",
                }}
              >
                <div style={{
                  width: 44, height: 44,
                  background: st.iconBg,
                  borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                  border: "1px solid rgba(0,0,0,0.05)",
                }}>
                  {st.icon}
                </div>
                <div style={{ paddingTop: 2 }}>
                  <h3 style={{
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14,
                    color: "var(--text-primary)", marginBottom: 3, lineHeight: 1.3,
                  }}>
                    {st.label}
                  </h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                    {st.tagline}
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    marginTop: 10, fontSize: 12, fontWeight: 600,
                    fontFamily: "var(--font-display)", color: "var(--accent)",
                  }}>
                    Use tool
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M1.5 5.5h8M6.5 2.5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </ToolPageWrapper>
  );
}
