import { useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { DollarField, PercentField, ResultTable, ValidationWarning } from "./RetirementFormControls";
import BalanceByAgeChart from "./BalanceByAgeChart";
import { calculateRetirementNeed, validateRetirementAges, formatCurrency, formatHeadlineMoney } from "../../../utils/retirementCalculatorEngine";

const DEFAULTS = {
  currentAge: "35", retireAge: "67", lifeExpectancy: "85", currentIncome: "70000",
  incomeIncrease: "3", retIncomeLevel: "75", avgReturn: "6", inflation: "3",
  otherIncome: "0", currentSavings: "30000", futureSavings: "10",
};

const UNIT_OPTIONS = [{ value: "percent", label: "%" }, { value: "dollar", label: "$" }];

const sectionHeader = { background: "var(--accent)", color: "#fff", padding: "8px 14px", fontSize: 12.5, fontWeight: 700, fontFamily: "var(--font-display)", marginTop: 16, marginBottom: 12, borderRadius: "var(--radius-sm)" };
const fieldRow = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 };
const fieldLabelWrap = { flex: "1 1 auto", minWidth: 0 };
const fieldInputWrap = { flex: "0 0 130px", display: "flex", alignItems: "center", gap: 4 };

function Field({ label, hint, value, onChange, placeholder, suffix }) {
  return (
    <div style={fieldRow}>
      <div style={fieldLabelWrap}><FieldLabel hint={hint}>{label}</FieldLabel></div>
      <div style={fieldInputWrap}>
        <TextField value={value} onChange={onChange} placeholder={placeholder} style={{ textAlign: "right" }} />
        {suffix && <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>{suffix}</span>}
      </div>
    </div>
  );
}

// Needs THREE things in limited width — the number, a $/% unit picker,
// and a descriptive suffix ("of current income") — which is too much to
// cram into one row without starving the number input (previously
// squeezed down to ~2-3 visible characters, and the $/% select's own
// width was too tight for its sign to render clearly). Fixed by stacking
// the suffix onto its own line below, so the number input and unit
// picker each get real room on their row, and by widening/bolding the
// unit select so its $ or % reads clearly.
function ValueUnitField({ label, hint, value, onChange, unit, onUnitChange, unitLabel, unitOptions = UNIT_OPTIONS }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...fieldRow, marginBottom: 4 }}>
        <div style={fieldLabelWrap}><FieldLabel hint={hint}>{label}</FieldLabel></div>
        <div style={{ flex: "0 0 175px", display: "flex", gap: 6, alignItems: "center" }}>
          <TextField value={value} onChange={onChange} style={{ textAlign: "right", flex: 1, minWidth: 0 }} />
          <div style={{ width: 64, flexShrink: 0 }}>
            <SelectField
              value={unit} onChange={onUnitChange} options={unitOptions}
              style={{ padding: "9px 6px", textAlign: "center", fontWeight: 700, fontSize: 14 }}
            />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 11.5, color: "var(--text-muted)", flexShrink: 0 }}>{unitLabel}</span>
      </div>
    </div>
  );
}

export default function RetirementNeedCard() {
  const [currentAge, setCurrentAge] = useState("");
  const [retireAge, setRetireAge] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [currentIncome, setCurrentIncome] = useState("");
  const [incomeIncrease, setIncomeIncrease] = useState("");
  const [retIncomeLevel, setRetIncomeLevel] = useState("");
  const [retIncomeUnit, setRetIncomeUnit] = useState("percent");
  const [avgReturn, setAvgReturn] = useState("");
  const [inflation, setInflation] = useState("");
  const [otherIncome, setOtherIncome] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [futureSavings, setFutureSavings] = useState("");
  const [futureSavingsUnit, setFutureSavingsUnit] = useState("percent");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function calculate() {
    const inputs = {
      currentAge: currentAge || DEFAULTS.currentAge,
      retireAge: retireAge || DEFAULTS.retireAge,
      lifeExpectancy: lifeExpectancy || DEFAULTS.lifeExpectancy,
    };
    const validationError = validateRetirementAges(inputs);
    if (validationError) {
      setError(validationError);
      setResult(null);
      return;
    }
    setError(null);
    setResult(calculateRetirementNeed({
      ...inputs,
      currentIncome: currentIncome || DEFAULTS.currentIncome,
      incomeIncreasePercent: incomeIncrease || DEFAULTS.incomeIncrease,
      retIncomeLevel: retIncomeLevel || DEFAULTS.retIncomeLevel,
      retIncomeUnit,
      avgReturnPercent: avgReturn || DEFAULTS.avgReturn,
      inflationPercent: inflation || DEFAULTS.inflation,
      otherIncomeMonthly: otherIncome || DEFAULTS.otherIncome,
      currentSavings: currentSavings || DEFAULTS.currentSavings,
      futureSavings: futureSavings || DEFAULTS.futureSavings,
      futureSavingsUnit,
    }));
  }

  function clear() {
    setCurrentAge(""); setRetireAge(""); setLifeExpectancy(""); setCurrentIncome("");
    setIncomeIncrease(""); setRetIncomeLevel(""); setRetIncomeUnit("percent");
    setAvgReturn(""); setInflation(""); setOtherIncome(""); setCurrentSavings("");
    setFutureSavings(""); setFutureSavingsUnit("percent"); setResult(null); setError(null);
  }

  return (
    <section aria-label="How much do you need to retire calculator" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 18, color: "var(--text-primary)", marginBottom: 6 }}>
          How much do you need to retire?
        </h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
          This calculator can help with planning the financial aspects of your retirement, such as providing an idea
          where you stand in terms of retirement savings, how much to save to reach your target, and what your
          retirements will look like in retirement.
        </p>
      </div>

      {error && <ValidationWarning message={error} />}

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div className="card" style={{ padding: 20, flex: "1 1 360px", minWidth: 320 }}>
          <Field label="Your current age" value={currentAge} onChange={setCurrentAge} placeholder={DEFAULTS.currentAge} />
          <Field label="Your planned retirement age" value={retireAge} onChange={setRetireAge} placeholder={DEFAULTS.retireAge} />
          <Field label="Your life expectancy" hint="The age up to which your retirement savings need to last." value={lifeExpectancy} onChange={setLifeExpectancy} placeholder={DEFAULTS.lifeExpectancy} />
          <DollarField label="Your current pre-tax income" value={currentIncome} onChange={setCurrentIncome} placeholder={DEFAULTS.currentIncome} suffix="/year" />

          <p style={sectionHeader}>Assumptions</p>
          <PercentField label="Your current income increase" value={incomeIncrease} onChange={setIncomeIncrease} placeholder={DEFAULTS.incomeIncrease} suffix="/year" />
          <ValueUnitField
            label="Income needed after retirement" hint="How much of your pre-retirement income you'll want to replace each year in retirement."
            value={retIncomeLevel} onChange={setRetIncomeLevel} unit={retIncomeUnit} onUnitChange={setRetIncomeUnit}
            unitLabel="of current income"
          />
          <PercentField label="Average investment return" value={avgReturn} onChange={setAvgReturn} placeholder={DEFAULTS.avgReturn} suffix="/year" />
          <PercentField label="Inflation rate" hint="Used to project your income and expenses forward, and to show results in today's purchasing power." value={inflation} onChange={setInflation} placeholder={DEFAULTS.inflation} suffix="/year" />

          <p style={sectionHeader}>Optional</p>
          <DollarField label="Other income after retirement" hint="Social Security, pension, or any other income you'll receive in retirement." value={otherIncome} onChange={setOtherIncome} placeholder={DEFAULTS.otherIncome} suffix="/month" />
          <DollarField label="Your current retirement savings" value={currentSavings} onChange={setCurrentSavings} placeholder={DEFAULTS.currentSavings} />
          <ValueUnitField
            label="Future retirement savings" value={futureSavings} onChange={setFutureSavings}
            unit={futureSavingsUnit} onUnitChange={setFutureSavingsUnit} unitLabel="of income"
          />

          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button type="button" onClick={calculate} style={{ flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)", color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontFamily: "var(--font-display)", cursor: "pointer" }}>
              Calculate
            </button>
            <button type="button" onClick={clear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
          </div>
        </div>

        <div style={{ flex: "1 1 360px", minWidth: 320 }}>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
              Result
            </div>
            <div style={{ padding: "18px 20px" }}>
              {!result ? (
                <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                  Fill in the details and click <strong>Calculate</strong> to see how much you need to retire.
                </p>
              ) : (
                <>
                  {result.amountNeeded <= 0 && result.alreadyRetired ? (
                    // Entered retirement age was <= current age — the
                    // reference recognizes this as "already retired" and
                    // switches to present-tense narration instead of
                    // talking about a future retirement date (and, most
                    // importantly, never echoes back the raw nonsensical
                    // input age — every age shown uses the clamped
                    // `effectiveRetireAge`, which here equals the
                    // person's current age).
                    <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
                      You are in retirement. Your other income is sufficient to support your desired lifestyle.
                      Your retirement saving balance of {formatHeadlineMoney(result.amountWillHave)} can be retrieved at{" "}
                      {formatCurrency(result.incomeNow.fromSavings.actual, { decimals: 0 })}/month until the age of{" "}
                      {lifeExpectancy || DEFAULTS.lifeExpectancy}.
                    </p>
                  ) : result.amountNeeded <= 0 ? (
                    <>
                      <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
                        You don't need to save for your retirement! Your other income after retirement is sufficient to support your desired lifestyle after retirement.
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                        If you continue on the current saving plan, your retirement saving balance will reach about {formatHeadlineMoney(result.amountWillHave)} when you retire at the age of {result.effectiveRetireAge}. You can retrieve {formatCurrency(result.incomeNow.fromSavings.actual, { decimals: 0 })}/mo ({formatCurrency(result.incomeNow.fromSavings.todays, { decimals: 0 })}/mo in today's money) until the age of {lifeExpectancy || DEFAULTS.lifeExpectancy}.
                      </p>
                    </>
                  ) : result.alreadyRetired ? (
                    // Already retired (entered age <= current age) AND
                    // underfunded (amountNeeded > 0) — a third narrative
                    // combo the reference calls out distinctly from both
                    // the not-yet-retired "You will need..." case and the
                    // fully-funded "You are in retirement" case above:
                    // present tense throughout, no future retirement date,
                    // and it states what your CURRENT balance can support
                    // right now rather than projecting to a future age.
                    <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}>
                      You are in retirement already. You need about <strong>{formatHeadlineMoney(result.amountNeeded)}</strong> of savings now to retrieve{" "}
                      {formatCurrency(result.incomeTarget.fromSavings.actual, { decimals: 0 })} per month until {lifeExpectancy || DEFAULTS.lifeExpectancy}. At your current balance of{" "}
                      {formatHeadlineMoney(result.amountWillHave)}, you can retrieve {formatCurrency(result.incomeNow.fromSavings.actual, { decimals: 0 })} per month until {lifeExpectancy || DEFAULTS.lifeExpectancy}.
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 8 }}>
                        You will need about <strong>{formatHeadlineMoney(result.amountNeeded)}</strong> at age {result.effectiveRetireAge} to retire.
                      </p>
                      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                        Based on your current plan, you will have about {formatHeadlineMoney(result.amountWillHave)} at age {result.effectiveRetireAge}, which {" "}
                        {result.amountWillHave < result.amountNeeded ? "is less than" : "exceeds"} what you need for retirement.
                      </p>
                    </>
                  )}

                  <div style={{ display: "flex", alignItems: "flex-end", gap: 40, justifyContent: "center", marginBottom: 20, height: 170 }}>
                    {[
                      { label: "You will have", value: result.amountWillHave, color: "#e8cf00", showPct: true },
                      { label: "You will need", value: result.amountNeeded, color: "#336699", showPct: false },
                    ].map(({ label, value, color, showPct }) => {
                      const maxVal = Math.max(result.amountWillHave, result.amountNeeded, 1);
                      const heightPct = Math.max(4, (value / maxVal) * 100);
                      // The reference annotates the "have" bar with its
                      // size relative to "need" (e.g. "(381%)") — only
                      // meaningful once there's a nonzero target to
                      // compare against.
                      const pctLabel = showPct && result.amountNeeded > 0 ? ` (${Math.round(result.haveRatio * 100)}%)` : "";
                      return (
                        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 110, height: "100%" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
                            ~{formatHeadlineMoney(value)}{pctLabel}
                          </span>
                          {/* This wrapper is the bar's DIRECT parent and
                              the one that must carry a resolved pixel
                              height — a percentage height on the bar
                              itself, one level up from the fixed-height
                              container, doesn't resolve in CSS and was
                              rendering the bar at zero height (invisible)
                              before this fix. */}
                          <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                            <div style={{ width: "100%", height: `${heightPct}%`, background: color }} />
                          </div>
                          <span style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 6 }}>{label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {[
                    ["if saved current plan", result.amountWillHave, result.incomeNow],
                    ["if saved amount needed", result.amountNeeded, result.incomeTarget],
                  ].map(([label, amount, income]) => (
                    <ResultTable
                      key={label}
                      title={`After retirement (${label} — ${formatHeadlineMoney(amount)}):`}
                      columns={["", "Actual amount", "Today's money"]}
                      rows={[
                        {
                          label: "Income:", emphasize: true,
                          cells: [`${formatCurrency(income.actual, { decimals: 0 })}/mo`, `${formatCurrency(income.todays, { decimals: 0 })}/mo`],
                        },
                        {
                          label: "from savings:", indent: true,
                          cells: [`${formatCurrency(income.fromSavings.actual, { decimals: 0 })}/mo`, `${formatCurrency(income.fromSavings.todays, { decimals: 0 })}/mo`],
                        },
                        {
                          label: "other income:", indent: true,
                          cells: [`${formatCurrency(income.otherIncome.actual, { decimals: 0 })}/mo`, `${formatCurrency(income.otherIncome.todays, { decimals: 0 })}/mo`],
                        },
                      ]}
                    />
                  ))}

                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", margin: "18px 0 6px" }}>
                    How can you save {formatHeadlineMoney(result.amountNeeded)} at {result.effectiveRetireAge}?
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                    To save {formatHeadlineMoney(result.amountNeeded)} at {result.effectiveRetireAge}, you can either save{" "}
                    <strong>{formatCurrency(result.monthlySavingsAmount, { decimals: 0 })}</strong> per month or{" "}
                    <strong>{formatCurrency(result.yearlySavingsAmount, { decimals: 0 })}</strong> per year or save{" "}
                    <strong>{result.percentOfIncomeNeeded.toFixed(2)}%</strong> of your income every year.
                  </p>

                  <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: 10 }}>
                    Balance by age
                  </p>
                  <BalanceByAgeChart
                    have={result.balanceByAge.have}
                    // The reference only plots (and legends) the "need"
                    // comparison line when there's a meaningful pre-
                    // retirement accumulation phase to contrast it
                    // against AND the current plan falls short of the
                    // target. Once already retired (no accumulation
                    // years) it shows just the "have" trajectory alone —
                    // confirmed across two separate already-retired
                    // reference screenshots (one fully-funded, one
                    // underfunded): both were single-line, the
                    // underfunded one scaled to the tiny "have" balance's
                    // own range rather than sharing an axis with the much
                    // larger "need" figure.
                    need={!result.alreadyRetired && result.amountWillHave < result.amountNeeded ? result.balanceByAge.need : undefined}
                    haveLabel={`If saved ${formatHeadlineMoney(result.amountWillHave)}`}
                    needLabel={`If saved ${formatHeadlineMoney(result.amountNeeded)}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
