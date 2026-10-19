import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import {
  calculateTakeHomePay, PAY_FREQUENCIES, FILING_STATUSES, TAKE_HOME_DEFAULTS, TAX_YEAR,
} from "../../../utils/takeHomePayCalculatorEngine";
import { useRequiredFields, pickFields, withFill } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";

const D = TAKE_HOME_DEFAULTS;
const TEXT_KEYS = ["salary", "children", "otherDependents", "otherIncome", "pretaxDeductions", "deductionsNotWithheld", "itemizedDeductions",
  "job2", "job3", "stateRate", "cityRate", "tips", "overtime", "vehicleLoanInterest", "charityGifts"];
const EMPTY = Object.fromEntries(TEXT_KEYS.map((k) => [k, ""]));
const CHOICES = { payFrequency: D.payFrequency, filingStatus: D.filingStatus, hasOtherJobs: false, age65: false, spouse65: false, selfEmployed: false };

const hintStyle = { fontSize: 11.5, color: "var(--text-muted)", margin: "3px 0 0", textAlign: "right" };
const cell = { padding: "6px 10px", fontSize: 13.5, color: "var(--text-primary)", border: "1px solid var(--border)" };
const sectionTitle = { background: "var(--accent)", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "var(--font-display)", padding: "6px 10px" };

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

/** Label beside the input, wrapping above it on narrow screens. */
function Row({ label, hint, help, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", columnGap: 8, rowGap: 4 }}>
        <div style={{ flex: "1 1 170px", minWidth: 0 }}><FieldLabel hint={help}>{label}</FieldLabel></div>
        <div style={{ flex: "1 1 200px", maxWidth: 250, display: "flex", minWidth: 0 }}>{children}</div>
      </div>
      {hint && <p style={hintStyle}>{hint}</p>}
    </div>
  );
}

function YearField({ value, onChange, placeholder }) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, display: "flex" }}>
      <DollarField value={value} onChange={onChange} placeholder={placeholder} style={{ paddingRight: 46 }} />
      <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 12, pointerEvents: "none" }}>/year</span>
    </div>
  );
}

function YesNo({ legend, value, onChange, name }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "4px 0 10px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
      <legend style={{ float: "left", fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", fontFamily: "var(--font-display)", padding: 0, marginRight: 4 }}>{legend}</legend>
      {[[true, "Yes"], [false, "No"]].map(([v, label]) => (
        <label key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-primary)", cursor: "pointer" }}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

function W4Block({ block }) {
  const line = (label, value, indent = 20) => (
    <tr>
      <td style={{ padding: `3px 10px 3px ${indent}px`, fontSize: 13.5, color: "var(--text-primary)" }}>{label}</td>
      <td style={{ padding: "3px 10px", fontSize: 13.5, color: "var(--text-primary)", textAlign: "right" }}>{value}</td>
    </tr>
  );
  return (
    // fontVariantLigatures: the site font would otherwise turn "(c)" into ©.
    <table style={{ borderCollapse: "collapse", margin: "6px 0 10px", minWidth: 280, fontVariantLigatures: "none", fontFeatureSettings: "\"liga\" 0, \"dlig\" 0" }}>
      <tbody>
        <tr><td colSpan={2} style={sectionTitle}>Step 3: Claim Dependents</td></tr>
        {line("Qualifying children under 17:", block.step3.children, 40)}
        {line("Other dependents:", block.step3.others, 40)}
        {line("Total:", block.step3.total)}
        <tr><td colSpan={2} style={sectionTitle}>Step 4: Other Adjustments</td></tr>
        {line("(a) Other income (not from jobs):", block.a)}
        {line("(b) Deductions:", block.b)}
        {line("(c) Extra withholding per period:", block.c)}
      </tbody>
    </table>
  );
}

export default function TakeHomePayCalculatorTool() {
  const [v, setV] = useState(EMPTY);
  const [choice, setChoice] = useState(CHOICES);
  const [result, setResult] = useState(null);
  const set = (key) => (value) => setV((p) => ({ ...p, [key]: value }));
  const pick = (key) => (value) => setChoice((p) => ({ ...p, [key]: value }));
  const joint = choice.filingStatus === "MarriedJoint";

  // The example applies only while every box is empty; otherwise a blank box
  // means $0 (or 0), exactly as on the reference.
  const req = useRequiredFields();
  const calculate = () => {
    setResult(req.evaluate(pickFields(v, TEXT_KEYS), (fill) => calculateTakeHomePay({ ...withFill(v, D, fill), ...choice, spouse65: joint && choice.spouse65 })));
  };
  const clear = () => { req.clear(); setV(EMPTY); setResult(null); };

  let body;
  if (!result) {
    body = <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: 0 }}>Enter your salary and details, then click Calculate.</p>;
  } else if (result.errors) {
    body = <ErrorPanel messages={result.errors} />;
  } else {
    const w4 = result.w4;
    body = (
      <>
        <h2 style={{ fontSize: 17, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 10px" }}>{result.title}</h2>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", border: "1px solid var(--border)", width: "100%", maxWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ ...cell, background: "var(--bg-muted)" }}><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" }}>Item</span></th>
              <th style={{ ...cell, background: "var(--bg-muted)", textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {result.rows.map((r) => (
              <tr key={r.label}>
                <td style={{ ...cell, fontWeight: r.strong ? 700 : 400 }}>{r.label}</td>
                <td style={{ ...cell, textAlign: "right", fontWeight: r.strong ? 700 : 400 }}>{r.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {result.note && <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "6px 0 0" }}>{result.note}</p>}
        {w4 && (
          <div style={{ marginTop: 16 }}>
            <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.55, margin: 0 }}>
              {w4.highest
                ? `If you are filling a W-4 form for ${TAX_YEAR} and this is your highest paying job. Please complete Step 3 and Step 4 of the W-4 using the following numbers.`
                : `Since this is not the highest paying job entered, the IRS recommends completing Step 3, Step 4 (a), and Step 4 (b) on the W-4 of the higher paying job. For the ${TAX_YEAR} W-4 of this job please input the following:`}
            </p>
            <W4Block block={w4.main} />
            {w4.privacy && (w4.highest ? (
              <>
                <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.55, margin: 0 }}>
                  If you are concerned about privacy and do not want to let your employer know of your other source of income
                  and/or extra withholding, you can fill the W-4 as follows. Then, fill a 1040-ES and send a payment
                  of <strong>{w4.privacy.quarterly}</strong> directly to the IRS every quarter.
                </p>
                <W4Block block={w4.privacy} />
              </>
            ) : (
              <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.55, margin: "0 0 10px" }}>
                If you are concerned about privacy and do not want to let your employer know of the extra withholding, you can
                input $0 in Step 4 (c) above, fill a 1040-ES, and send a payment of <strong>{w4.privacy.quarterly}</strong> directly to
                the IRS every quarter.
              </p>
            ))}
          </div>
        )}
        <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "10px 0 0" }}>
          * The assessment of this calculator is only an estimate. The actual result will be slightly different.
        </p>
      </>
    );
  }

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div className="card" style={{ flex: "1 1 420px", minWidth: 280, maxWidth: 540, padding: 18 }}>
        <Row label="Your job income (salary)"><Req name="salary" flagged={req.flagged}><YearField value={v.salary} onChange={set("salary")} placeholder={D.salary} /></Req></Row>
        <Row label="Pay frequency">
          <SelectField value={choice.payFrequency} onChange={pick("payFrequency")} options={PAY_FREQUENCIES} style={{ flex: 1, minWidth: 0 }} />
        </Row>
        <Row label="File status">
          <SelectField value={choice.filingStatus} onChange={pick("filingStatus")} options={FILING_STATUSES} style={{ flex: 1, minWidth: 0 }} />
        </Row>
        <Row label="Number of children under age 17"><Req name="children" flagged={req.flagged}><TextField value={v.children} onChange={set("children")} placeholder={D.children} /></Req></Row>
        <Row label="Number of other dependents"><Req name="otherDependents" flagged={req.flagged}><TextField value={v.otherDependents} onChange={set("otherDependents")} placeholder={D.otherDependents} /></Req></Row>
        <Row label="Other income (not from jobs)" hint="interest, dividends, retirement income, etc.">
          <Req name="otherIncome" flagged={req.flagged}><YearField value={v.otherIncome} onChange={set("otherIncome")} placeholder={D.otherIncome} /></Req>
        </Row>
        <Row
          label="Pretax deductions withheld" hint="401k, health insurance, HSA, etc."
          help="Deductions to be withheld from salary by the employer before being paid out, including those for a 401k, health savings account (HSA), the employee's share of the health insurance premium, child support payments, union and uniform dues, etc."
        >
          <Req name="pretaxDeductions" flagged={req.flagged}><YearField value={v.pretaxDeductions} onChange={set("pretaxDeductions")} placeholder={D.pretaxDeductions} /></Req>
        </Row>
        <Row
          label="Deductions not withheld" hint="IRA, student loan interest, etc."
          help="Deductions that will not be withheld by the employer but can be subtracted from taxable income, including IRA contributions, student loan interest, qualified tuition and education-related fees up to $4,000, etc."
        >
          <Req name="deductionsNotWithheld" flagged={req.flagged}><YearField value={v.deductionsNotWithheld} onChange={set("deductionsNotWithheld")} placeholder={D.deductionsNotWithheld} /></Req>
        </Row>
        <Row
          label="Itemized deductions" hint="mortgage interest, charitable donations, state/local/sales/property taxes, etc."
          help="Expenditure on eligible products, services, or contributions that may be subtracted from taxable income, including qualified mortgage interest, state and local income plus either property or sales taxes up to a certain amount, charitable donations, medical and dental expenses (over 10% of adjusted gross income), etc."
        >
          <Req name="itemizedDeductions" flagged={req.flagged}><YearField value={v.itemizedDeductions} onChange={set("itemizedDeductions")} placeholder={D.itemizedDeductions} /></Req>
        </Row>

        <YesNo
          name="thp-jobs" value={choice.hasOtherJobs} onChange={pick("hasOtherJobs")}
          legend={<>Has 2<sup>nd</sup>, 3<sup>rd</sup> job {joint ? "income or spouse has " : ""}income?</>}
        />
        {choice.hasOtherJobs && (
          <div style={{ padding: "8px 10px 2px", marginBottom: 10, border: "1px dashed var(--border)", borderRadius: "var(--radius-sm)" }}>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)", margin: "0 0 8px" }}>Please list these income(s):</p>
            <Row label="Income #2"><Req name="job2" flagged={req.flagged}><YearField value={v.job2} onChange={set("job2")} placeholder={D.job2} /></Req></Row>
            <Row label="Income #3"><Req name="job3" flagged={req.flagged}><YearField value={v.job3} onChange={set("job3")} placeholder={D.job3} /></Req></Row>
          </div>
        )}

        <Row label="State income tax rate" hint={<a href="https://en.wikipedia.org/wiki/State_income_tax" target="_blank" rel="noopener noreferrer nofollow" style={{ color: "var(--accent)" }}>click here to find out</a>}>
          <Req name="stateRate" flagged={req.flagged}><PercentField value={v.stateRate} onChange={set("stateRate")} placeholder={D.stateRate} /></Req>
        </Row>
        <Row label="City income tax rate"><Req name="cityRate" flagged={req.flagged}><PercentField value={v.cityRate} onChange={set("cityRate")} placeholder={D.cityRate} /></Req></Row>

        <YesNo name="thp-age" legend="Are you age 65 or older?" value={choice.age65} onChange={pick("age65")} />
        {joint && <YesNo name="thp-spouse-age" legend="Is your spouse age 65 or older?" value={choice.spouse65} onChange={pick("spouse65")} />}

        <Row label="Qualified tips income"><Req name="tips" flagged={req.flagged}><YearField value={v.tips} onChange={set("tips")} placeholder={D.tips} /></Req></Row>
        <Row label="Qualified overtime compensation"><Req name="overtime" flagged={req.flagged}><YearField value={v.overtime} onChange={set("overtime")} placeholder={D.overtime} /></Req></Row>
        <Row label="Qualified passenger vehicle loan interest"><Req name="vehicleLoanInterest" flagged={req.flagged}><YearField value={v.vehicleLoanInterest} onChange={set("vehicleLoanInterest")} placeholder={D.vehicleLoanInterest} /></Req></Row>
        <Row label="Cash gifts to charities"><Req name="charityGifts" flagged={req.flagged}><YearField value={v.charityGifts} onChange={set("charityGifts")} placeholder={D.charityGifts} /></Req></Row>

        <YesNo name="thp-self" legend="Are you self-employed or an independent contractor?" value={choice.selfEmployed} onChange={pick("selfEmployed")} />

        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <button type="button" onClick={calculate} style={{ flex: 1, padding: "9px 0", fontSize: 12.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
            Calculate
          </button>
          <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "9px 16px", fontSize: 12 }}>Clear</button>
        </div>
      </div>
      <div className="card" style={{ flex: "1 1 420px", minWidth: 280, padding: 0, overflow: "hidden" }}>
        <div style={{ background: "var(--success)", color: "#fff", padding: "11px 16px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>Results:</div>
        <div style={{ padding: "14px 16px" }} aria-live="polite">{body}</div>
      </div>
    </div>
  );
}
