import { useState } from "react";
import { FieldRow, TextField } from "../loan-calculator/LoanFormControls";
import InvestmentPieChart from "../investment-calculator/InvestmentPieChart";
import { calculateEstateTax, formatCurrency, DEFAULTS } from "../../../utils/estateTaxCalculatorEngine";

function stripToNumberString(input) {
  let cleaned = String(input ?? "").replace(/[^0-9.-]/g, "");
  const negative = cleaned.startsWith("-");
  cleaned = cleaned.replace(/-/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot !== -1) cleaned = cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
  return (negative ? "-" : "") + cleaned;
}
function formatWithCommas(raw) {
  const cleaned = stripToNumberString(raw);
  if (!cleaned || cleaned === "-") return cleaned;
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;
  const [intPart, decPart] = body.split(".");
  const withCommas = (intPart || "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatted = decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  return (negative ? "-" : "") + formatted;
}

function DollarField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <span style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 13, pointerEvents: "none" }}>$</span>
      <TextField
        value={formatWithCommas(value)}
        onChange={(v) => onChange(stripToNumberString(v))}
        placeholder={placeholder ? formatWithCommas(placeholder) : undefined}
        style={{ paddingLeft: 19 }}
      />
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{
      background: "var(--accent)", color: "#fff", padding: "7px 12px", fontSize: 12.5,
      fontWeight: 700, fontFamily: "var(--font-display)", marginTop: 18, marginBottom: 4,
      borderRadius: "var(--radius-sm)",
    }}>
      {children}
    </div>
  );
}

const emptyInputs = { ...DEFAULTS, ...Object.fromEntries(Object.keys(DEFAULTS).map((k) => [k, ""])) };

export default function EstateTaxCalculatorTool() {
  const [inputs, setInputs] = useState(emptyInputs);
  const [result, setResult] = useState(null);

  function field(key) {
    return (v) => setInputs((p) => ({ ...p, [key]: v }));
  }

  function calculate() {
    const filled = Object.fromEntries(
      Object.keys(DEFAULTS).map((k) => [k, inputs[k] || DEFAULTS[k]])
    );
    setResult(calculateEstateTax(filled));
  }

  function clear() {
    setInputs(emptyInputs);
    setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* ── Inputs ───────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 420px", minWidth: 320, padding: 16 }}>
        <SectionHeader>Assets</SectionHeader>
        <FieldRow label="Residence &amp; Other Real Estate"><DollarField value={inputs.residence} onChange={field("residence")} placeholder="0" /></FieldRow>
        <FieldRow label="Stocks, Bonds, and Other Investments"><DollarField value={inputs.stock} onChange={field("stock")} placeholder="0" /></FieldRow>
        <FieldRow label="Savings, CDs, and Checking Account Balance"><DollarField value={inputs.saving} onChange={field("saving")} placeholder="0" /></FieldRow>
        <FieldRow label="Vehicles, Boats, and Other Properties"><DollarField value={inputs.vehicle} onChange={field("vehicle")} placeholder="0" /></FieldRow>
        <FieldRow label="Retirement Plans"><DollarField value={inputs.retirement} onChange={field("retirement")} placeholder="0" /></FieldRow>
        <FieldRow label="Life Insurance Benefit"><DollarField value={inputs.lifeinsurance} onChange={field("lifeinsurance")} placeholder="0" /></FieldRow>
        <FieldRow label="Other Assets"><DollarField value={inputs.otherasset} onChange={field("otherasset")} placeholder="0" /></FieldRow>

        <SectionHeader>Liability, Costs, and Deductibles</SectionHeader>
        <FieldRow label="Debts (mortgages, loan, credit cards, etc)"><DollarField value={inputs.debt} onChange={field("debt")} placeholder="0" /></FieldRow>
        <FieldRow label="Funeral, Administration, and Claims Expenses"><DollarField value={inputs.funeral} onChange={field("funeral")} placeholder="0" /></FieldRow>
        <FieldRow label="Charitable Contributions"><DollarField value={inputs.charitable} onChange={field("charitable")} placeholder="0" /></FieldRow>
        <FieldRow label="State Inheritance or Estate Taxes"><DollarField value={inputs.statetax} onChange={field("statetax")} placeholder="0" /></FieldRow>

        <SectionHeader>Lifetime Gifted Amount</SectionHeader>
        <FieldRow label="Total amount you've gifted tax free in your lifetime"><DollarField value={inputs.lifetimegifted} onChange={field("lifetimegifted")} placeholder="0" /></FieldRow>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>

      {/* ── Results ──────────────────────────────────────────── */}
      <div className="card" style={{ flex: "1 1 380px", minWidth: 320, padding: 0, overflow: "hidden", alignSelf: "flex-start" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-display)" }}>
          Result:
        </div>
        <div style={{ padding: "16px 18px" }}>
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in your assets, liabilities, and lifetime gifts, then click <strong>Calculate</strong> to estimate your federal estate tax.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 14.5, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                Net taxable estate is <strong style={{ color: "var(--success)" }}>{formatCurrency(result.netTaxableEstate, { decimals: 0 })}</strong>.
              </p>

              {result.withinExemption ? (
                <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
                  Because the taxable estate value is within the exemption, the federal estate tax due is $0 for {result.year}.
                </p>
              ) : (
                <>
                  <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: "0 0 10px" }}>
                    For {result.year}, the taxable estate after exemption is {formatCurrency(result.taxableAfterExemption, { decimals: 0 })}, the federal estate tax is{" "}
                    <strong style={{ color: "#dc2626" }}>{formatCurrency(result.federalEstateTax, { decimals: 0 })}</strong>, and the after tax value is {formatCurrency(result.afterTaxValue, { decimals: 0 })}.
                  </p>

                  <div style={{ margin: "14px 0" }}>
                    <InvestmentPieChart
                      segments={[
                        { label: "Estate tax", value: result.federalEstateTax, color: "#2b7ddb" },
                        { label: "After tax value", value: result.afterTaxValue, color: "#8bbc21" },
                      ]}
                    />
                  </div>

                  {result.prior && (
                    <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                      If it was {result.prior.year}, the taxable estate after exemption is {formatCurrency(result.prior.taxableAfterExemption, { decimals: 0 })}, the federal estate tax is{" "}
                      <strong>{formatCurrency(result.prior.federalEstateTax, { decimals: 0 })}</strong>, and the after tax value is {formatCurrency(result.prior.afterTaxValue, { decimals: 0 })}.
                    </p>
                  )}
                </>
              )}

              <p style={{ fontSize: 10.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "14px 0 0" }}>
                * The {result.year} federal lifetime exemption is {formatCurrency(result.exemption, { decimals: 0 })} per person. This estimate covers federal estate tax only — many states impose their own separate estate or inheritance tax.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
