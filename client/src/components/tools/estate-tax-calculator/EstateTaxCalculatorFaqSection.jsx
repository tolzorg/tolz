import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";
import { EXEMPTION_HISTORY } from "../../../utils/estateTaxLawParams";

const FAQ_ITEMS = [
  {
    q: "What counts as part of my taxable estate?",
    a: "Everything of value you own at death: real estate, stocks/bonds/investments, savings and checking balances, vehicles and other property, retirement accounts, life insurance benefits, and any other assets. From that total, debts, funeral and administration expenses, charitable contributions, and any state inheritance or estate taxes paid are subtracted to arrive at your net taxable estate.",
  },
  {
    q: "Why does \"Total amount you've gifted tax free in your lifetime\" affect the result?",
    a: "The federal estate tax exemption is a single, unified lifetime amount shared between gifts you make while alive and your estate at death — any tax-free gifts you've already made reduce the exemption still available to your estate. Entering a large lifetime-gifted figure can push your combined taxable transfers over the exemption even if your net estate alone is small.",
  },
  {
    q: "Why is my federal estate tax due $0?",
    a: "The federal estate tax exemption is very large — $15 million per person for 2026 — so only estates (combined with lifetime gifts) above that threshold owe any federal estate tax at all. The vast majority of estates fall well under this exemption and owe nothing.",
  },
  {
    q: "What tax rate applies above the exemption?",
    a: "This calculator applies a flat 40% federal rate to the amount of your taxable estate that exceeds the exemption, matching the top federal estate/gift tax rate that has applied since 2013.",
  },
  {
    q: "Does this include state estate or inheritance taxes?",
    a: "No — this calculator estimates federal estate tax only. Several states (and the District of Columbia) levy their own separate estate or inheritance tax, often with a much lower exemption than the federal one, so your total tax liability could be higher if you live in one of those states.",
  },
  {
    q: "Is my financial information kept private when I use this tool?",
    a: "Yes. Every calculation runs directly in your browser. Nothing you enter is transmitted anywhere or stored, and no signup or personal information is required to use it.",
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

export default function EstateTaxCalculatorFaqSection() {
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
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Free on <Link to="/" className="inline-home-link">Tolz</Link>, this estate tax calculator estimates the
          federal estate tax due on an estate based on its net taxable value, any lifetime taxable gifts, and the
          current year's federal lifetime exemption.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estate Tax vs. Inheritance Tax</h2>
        <p style={pStyle}>
          An estate tax is imposed on the total value of a person's estate at the time of their death, sometimes
          called a "death tax." It's paid out of the estate itself before assets are distributed. An inheritance
          tax, by contrast, is paid by the person receiving the inheritance. The federal government only imposes
          an estate tax — it does not have a federal inheritance tax — though a number of states impose their own
          estate or inheritance tax (or both) on top of the federal one.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Due to the marital deduction, transfers to a surviving spouse are not taxable — only assets passed to
          other heirs count toward the taxable estate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Unified Credit and Lifetime Gifts</h2>
        <p style={pStyle}>
          The federal gift and estate tax share one unified lifetime exemption. Every year, you can gift up to the
          annual gift tax exclusion ($19,000 per recipient for 2026) to as many people as you like, completely
          tax free and without using any of your lifetime exemption. Gifts above that annual amount to any one
          person start using up your lifetime exemption — reducing the amount still available to shelter your
          estate at death.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Example: someone who gives away $2,000,000 in taxable gifts during their lifetime and dies in 2026 (a
          $15,000,000 exemption year) effectively has a remaining federal estate tax exemption of $13,000,000, not
          the full $15,000,000.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reducing Estate Tax</h2>
        <ul style={{ ...pStyle, marginBottom: 0, paddingLeft: 18 }}>
          <li>Spend down the estate during your lifetime (within reason — plan for your own future needs first).</li>
          <li>Donate to a qualified charity — there's no limit on the amount that can be gifted tax free to charity.</li>
          <li>Marry — assets left to a surviving spouse are not subject to federal estate tax.</li>
          <li>Move to a state without its own estate or inheritance tax.</li>
          <li>Use trusts and other estate-planning tools to manage how and when assets transfer to heirs.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>U.S. Estate and Gift Tax Exemptions and Tax Rates by Year</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 320 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-secondary)" }}>Year</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-secondary)" }}>Lifetime Exemption</th>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-secondary)" }}>Tax Rate</th>
              </tr>
            </thead>
            <tbody>
              {EXEMPTION_HISTORY.map((row) => (
                <tr key={row.year} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "5px 8px", color: "var(--text-primary)", fontWeight: row.year === 2026 ? 700 : 500 }}>{row.year}</td>
                  <td style={{ padding: "5px 8px", color: "var(--text-primary)" }}>{row.exemption}</td>
                  <td style={{ padding: "5px 8px", color: "var(--text-primary)" }}>{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free to Use, No Signup, No Data Stored</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This estate tax calculator is completely free, with no account, email address, or payment required.
          Every calculation runs directly in your browser — nothing you enter is stored, logged, or transmitted
          anywhere.
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
