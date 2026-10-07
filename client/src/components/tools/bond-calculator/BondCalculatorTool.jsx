import { useState } from "react";
import { FieldRow, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { FieldLabel } from "../mortgage-calculator/MortgageFormControls";
import {
  calculateBond, calculateBondPricing, convertCouponUnit, defaultDates,
  DEFAULTS, PRICING_DEFAULTS, FREQUENCY_OPTIONS, DAY_COUNT_OPTIONS, formatMoney4, format4,
} from "../../../utils/bondCalculatorEngine";

const UNIT_OPTIONS = [{ value: "p", label: "%" }, { value: "d", label: "$" }];

const MATURITY_HINT = "The date on which the bond issuer is obligated to repay the principal amount to the bondholder. It marks the end of the bond's term or duration.";
const SETTLEMENT_HINT = "The settlement date refers to the date on which a bond transaction is completed, and the buyer pays the agreed-upon price to the seller. It is the day when ownership of the bond formally transfers from the seller to the buyer, and the transaction is settled.";
const DAY_COUNT_HINT = "Day-count refers to the method used to calculate the fraction of a period over which interest accrues. 30/360 (or bond basis): a month is considered to have 30 days and a year 360 days. Actual/360: the actual number of days over a 360-day year. Actual/365: the actual number of days over a 365-day year. Actual/Actual: the actual number of days in both the numerator and denominator.";

const resultBanner = { background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)" };
const sectionTitle = { fontSize: 19, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 6px" };
const introText = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" };
const dateInputStyle = { flex: 1, minWidth: 0, padding: "8px 10px", fontSize: 13.5, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", background: "var(--bg-white)", color: "var(--text-primary)", fontFamily: "inherit" };
const calcButton = { flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" };

function ErrorPanel({ messages }) {
  return (
    <div role="alert" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {messages.map((m) => (
        <p key={m} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "#dc2626", fontWeight: 600, margin: 0 }}>
          <span aria-hidden="true">⚠</span>
          {m}
        </p>
      ))}
    </div>
  );
}

function ResultCard({ children }) {
  return (
    <div className="card" style={{ flex: "1 1 340px", minWidth: 300, padding: 0, overflow: "hidden" }}>
      <div style={resultBanner}>Results</div>
      <div style={{ padding: "14px 18px" }} aria-live="polite">{children}</div>
    </div>
  );
}

/** Annual coupon input plus its %/$ unit; switching the unit rewrites the
 * value in place the way the reference does (% → $ rounds to whole dollars). */
function CouponField({ value, onChange, unit, onUnitChange, face, placeholder }) {
  function switchUnit(next) {
    const converted = convertCouponUnit(value, face, next);
    if (converted !== null) onChange(converted);
    onUnitChange(next);
  }
  return (
    <div style={{ display: "flex", gap: 6, flex: 1, minWidth: 0 }}>
      {unit === "p"
        ? <PercentField value={value} onChange={onChange} placeholder={placeholder} />
        : <DollarField value={value} onChange={onChange} placeholder={placeholder} />}
      <SelectField value={unit} onChange={switchUnit} options={UNIT_OPTIONS} style={{ width: 58, flexShrink: 0 }} />
    </div>
  );
}

function SolverResult({ result }) {
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  if (result.noSolution) {
    return <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>No time to maturity solves these values: the price is out of reach for this face value, yield and coupon.</p>;
  }
  let answer;
  if (result.solveFor === "yield") answer = `${format4(result.value)}%`;
  else if (result.solveFor === "years") answer = `${format4(result.value)} years`;
  else if (result.solveFor === "coupon") {
    answer = `${formatMoney4(result.value)} (${format4(result.percent)}%) per year`;
    if (result.perPeriod) answer += ` or ${formatMoney4(result.perPeriod.value)} (${format4(result.perPeriod.percent)}%) ${result.perPeriod.word}`;
  } else answer = formatMoney4(result.value);
  return (
    <p style={{ fontSize: 14, color: "var(--text-primary)", lineHeight: 1.6, margin: 0 }}>
      {result.sentence} <strong style={{ color: "var(--success)", fontSize: 15 }}>{answer}</strong>.
    </p>
  );
}

function PricingResult({ result }) {
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const rows = [
    ["Dirty price:", formatMoney4(result.dirty)],
    ["Clean price:", formatMoney4(result.clean)],
    ["Accrued interest:", formatMoney4(result.accrued)],
    ["Interest accrued days:", String(result.accruedDays)],
  ];
  return (
    <table style={{ borderCollapse: "collapse", fontSize: 13.5, border: "1px solid var(--border)" }}>
      <tbody>
        {rows.map(([label, value], i) => (
          <tr key={label} style={{ background: i % 2 ? "var(--bg-muted)" : "transparent" }}>
            <td style={{ padding: "6px 12px", color: "var(--text-secondary)", borderBottom: "1px solid var(--border)" }}>{label}</td>
            <td style={{ padding: "6px 12px", color: "var(--text-primary)", fontWeight: 700, textAlign: "right", borderBottom: "1px solid var(--border)" }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function BondSolver() {
  // Blank is meaningful here (it marks the value to solve for), so — like
  // the Sales Tax Calculator — there is no fallback to DEFAULTS; they're
  // only placeholder hints.
  const [price, setPrice] = useState("");
  const [face, setFace] = useState("");
  const [yieldPct, setYieldPct] = useState("");
  const [years, setYears] = useState("");
  const [coupon, setCoupon] = useState("");
  const [unit, setUnit] = useState("p");
  const [frequency, setFrequency] = useState("a");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateBond({ price, face, yield: yieldPct, years, coupon, couponUnit: unit, frequency }));
  }
  function clear() {
    setPrice(""); setFace(""); setYieldPct(""); setYears(""); setCoupon("");
    setUnit("p"); setFrequency("a"); setResult(null);
  }

  return (
    <section>
      <p style={introText}>
        Please enter any four values into the fields below to calculate the remaining value of a bond. This
        calculator is for bonds issued/traded at the coupon date.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Price" fieldWidth={210}><DollarField value={price} onChange={setPrice} placeholder={DEFAULTS.price} /></FieldRow>
          <FieldRow label="Face value" fieldWidth={210}><DollarField value={face} onChange={setFace} placeholder={DEFAULTS.face} /></FieldRow>
          <FieldRow label="Yield" fieldWidth={210}><PercentField value={yieldPct} onChange={setYieldPct} placeholder={DEFAULTS.yield} /></FieldRow>
          <FieldRow label="Time to maturity" suffix="years" fieldWidth={210}><TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} /></FieldRow>
          <FieldRow label="Annual coupon" fieldWidth={210}>
            <CouponField value={coupon} onChange={setCoupon} unit={unit} onUnitChange={setUnit} face={face} placeholder={DEFAULTS.coupon} />
          </FieldRow>
          <FieldRow label="Coupon frequency" fieldWidth={210}>
            <SelectField value={frequency} onChange={setFrequency} options={FREQUENCY_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
          </FieldRow>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={calcButton}>Calculate</button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
        <ResultCard>
          {result ? <SolverResult result={result} /> : (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Fill in any four of the five values and leave the one to solve for blank, then click <strong>Calculate</strong>.
            </p>
          )}
        </ResultCard>
      </div>
    </section>
  );
}

function BondPricing() {
  const dates = defaultDates();
  const [face, setFace] = useState("");
  const [yieldPct, setYieldPct] = useState("");
  const [coupon, setCoupon] = useState("");
  const [unit, setUnit] = useState("p");
  const [frequency, setFrequency] = useState("a");
  const [maturity, setMaturity] = useState(dates.maturity);
  const [settlement, setSettlement] = useState(dates.settlement);
  const [dayCount, setDayCount] = useState("b");
  const [result, setResult] = useState(null);

  function calculate() {
    setResult(calculateBondPricing({
      face: face || PRICING_DEFAULTS.face,
      yield: yieldPct || PRICING_DEFAULTS.yield,
      coupon: coupon || PRICING_DEFAULTS.coupon,
      couponUnit: unit, frequency, maturity, settlement, dayCount,
    }));
  }
  function clear() {
    const d = defaultDates();
    setFace(""); setYieldPct(""); setCoupon(""); setUnit("p"); setFrequency("a");
    setMaturity(d.maturity); setSettlement(d.settlement); setDayCount("b"); setResult(null);
  }

  const dateInput = (value, onChange, label) => (
    <input
      type="date" value={value} aria-label={label}
      onChange={(e) => onChange(e.target.value)}
      style={dateInputStyle}
    />
  );

  return (
    <section>
      <h2 style={sectionTitle}>Bond pricing calculator</h2>
      <p style={introText}>
        Use this calculator to value the price of bonds not traded at the coupon date. It provides the dirty price,
        clean price, accrued interest, and the days since the last coupon payment.
      </p>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 360px", minWidth: 300, padding: 18 }}>
          <FieldRow label="Face value" fieldWidth={210}><DollarField value={face} onChange={setFace} placeholder={PRICING_DEFAULTS.face} /></FieldRow>
          <FieldRow label="Yield" fieldWidth={210}><PercentField value={yieldPct} onChange={setYieldPct} placeholder={PRICING_DEFAULTS.yield} /></FieldRow>
          <FieldRow label="Annual coupon" fieldWidth={210}>
            <CouponField value={coupon} onChange={setCoupon} unit={unit} onUnitChange={setUnit} face={face || PRICING_DEFAULTS.face} placeholder={PRICING_DEFAULTS.coupon} />
          </FieldRow>
          <FieldRow label="Coupon frequency" fieldWidth={210}>
            <SelectField value={frequency} onChange={setFrequency} options={FREQUENCY_OPTIONS} style={{ flex: 1, minWidth: 0 }} />
          </FieldRow>
          <FieldRow label="Maturity date" hint={MATURITY_HINT} fieldWidth={210}>{dateInput(maturity, setMaturity, "Maturity date")}</FieldRow>
          <FieldRow label="Settlement date" hint={SETTLEMENT_HINT} fieldWidth={210}>{dateInput(settlement, setSettlement, "Settlement date")}</FieldRow>

          <fieldset style={{ border: "none", padding: 0, margin: "6px 0 0" }}>
            <legend style={{ padding: 0, marginBottom: 6 }}>
              <FieldLabel hint={DAY_COUNT_HINT}>Day-count convention to use:</FieldLabel>
            </legend>
            {DAY_COUNT_OPTIONS.map((o) => (
              <label key={o.value} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 4px 6px", fontSize: 13.5, color: "var(--text-primary)", cursor: "pointer" }}>
                <input type="radio" name="bondDayCount" value={o.value} checked={dayCount === o.value} onChange={() => setDayCount(o.value)} />
                {o.label}
              </label>
            ))}
          </fieldset>

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={calcButton}>Calculate</button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
          </div>
        </div>
        <ResultCard>
          {result ? <PricingResult result={result} /> : (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>
              Enter the bond details and dates, pick a day-count convention and click <strong>Calculate</strong>.
            </p>
          )}
        </ResultCard>
      </div>
    </section>
  );
}

export default function BondCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
      <BondSolver />
      <BondPricing />
    </div>
  );
}
