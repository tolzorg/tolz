import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this Split Excel tool free to use?",
    a: "Yes. It's completely free, with no signup, subscription, or hidden charges.",
  },
  {
    q: "How does splitting work?",
    a: "Every output file gets a copy of the header row (the first row) plus up to the number of data rows you set in \"Rows per file\". If your sheet has 250 data rows and you split at 100, you'll get 3 files: 100 rows, 100 rows, and 50 rows, each with the header on top.",
  },
  {
    q: "Does it split every sheet in my workbook?",
    a: "No — only the first worksheet. If your file has multiple tabs, split the ones you need separately by saving each as its own file first.",
  },
  {
    q: "Does it accept the old .xls format, or just .xlsx?",
    a: "Both. You can upload either the older .xls format or the modern .xlsx format — the output files are always .xlsx.",
  },
  {
    q: "Does it keep my formulas and formatting?",
    a: "It keeps cell values and column widths, and bolds the header row. Formulas, conditional formatting, and other advanced styling aren't preserved — each output file has the plain values from your original.",
  },
  {
    q: "Is my file uploaded anywhere?",
    a: "No. Everything happens locally in your browser — your spreadsheet is never sent to a server.",
  },
  {
    q: "What's the largest file this can handle?",
    a: "Up to 25 MB and 200,000 data rows. Very large spreadsheets can be slow to split since everything runs in your browser rather than on a server.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };

function FaqRow({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, padding: "13px 2px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
          {item.q}
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }} aria-hidden="true">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function SplitExcelFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={pStyle}>
          Split a large Excel spreadsheet into several smaller files by row count, free, right in your browser — no
          signup, no upload. Set how many rows each file should have and download the results, either as a single
          XLSX file or a zip of several. Built as part of <Link to="/" className="inline-home-link">Tolz</Link>'s
          collection of free online utilities.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
