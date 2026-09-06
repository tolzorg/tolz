import { useEffect, useRef, useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import InflationCpiChart from "./InflationCpiChart";
import {
  calculateCpiInflation, calculateForwardFlatRate, calculateBackwardFlatRate,
  monthOptions, yearOptions, maxMonthForYear,
  getLatestYear, getLatestMonth, applyLiveCpiWindow,
  MONTH_NAMES, AVERAGE_MONTH,
  formatCurrency, formatPercent,
} from "../../../utils/inflationCalculatorEngine";
import { fetchRecentCpiWindow } from "../../../utils/cpiLiveUpdate";

const DEFAULTS = { amount: "100", rate: "3", years: "10" };

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };

function CalcButtons({ onCalculate, onClear }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button type="button" onClick={onCalculate} style={{
        flex: 1, padding: "12px 0", fontSize: 14.5, background: "var(--success)",
        color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700,
        fontFamily: "var(--font-display)", cursor: "pointer",
      }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
    </div>
  );
}

function ResultsCard({ children }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
        Results
      </div>
      <div style={{ padding: "18px 20px" }}>{children}</div>
    </div>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 4 }}>
        {title}
      </p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{description}</p>
    </div>
  );
}

/** "Inflation Calculator with U.S. CPI Data" */
function CpiSection() {
  const [amount, setAmount] = useState("");
  const [fromYear, setFromYear] = useState(2016);
  const [fromMonth, setFromMonth] = useState(AVERAGE_MONTH);
  const [toYear, setToYear] = useState(getLatestYear());
  const [toMonth, setToMonth] = useState(getLatestMonth());
  const [result, setResult] = useState(null);

  // Tracks whether the CPI dataset has been auto-extended with newer
  // months than the static baseline this build shipped with (see
  // cpiLiveUpdate.js) — `dataVersion` forces the year/month dropdowns
  // and the description line to recompute once that happens, since
  // `yearOptions()`/`maxMonthForYear()` read the engine's current
  // effective latest, not a value frozen at component-mount time.
  const [dataVersion, setDataVersion] = useState(0);
  // "checking" | "up-to-date" | "extended" (a newer month arrived) |
  // "revised" (an existing recent month's value changed, e.g. the
  // synthetic Oct-2025 estimate being replaced by a real BLS figure) |
  // "unavailable" (fetch failed — silently keeps working off whatever
  // data is already in place, static or previously live-merged)
  const [liveStatus, setLiveStatus] = useState("checking");
  const toTouched = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchRecentCpiWindow().then((recentMonths) => {
      if (cancelled) return;
      if (recentMonths.length === 0) { setLiveStatus("unavailable"); return; }
      const { year, month, changed, extended } = applyLiveCpiWindow(recentMonths);
      if (!changed) { setLiveStatus("up-to-date"); return; }
      setDataVersion((v) => v + 1);
      // Only follow a newly-extended latest month if the user hasn't
      // already picked their own "To" period — don't yank a selection
      // out from under someone mid-edit. A revision to an already-past
      // month (rather than a new one arriving) never moves "To" at all.
      if (extended && !toTouched.current) { setToYear(year); setToMonth(month); }
      setLiveStatus(extended ? "extended" : "revised");
    }).catch(() => { if (!cancelled) setLiveStatus("unavailable"); });
    return () => { cancelled = true; };
  }, []);

  // Not memoized: yearOptions()/monthOptions() read the engine's own
  // live module state directly (see inflationCalculatorEngine.js), not
  // their arguments alone — `dataVersion` only exists to force this
  // component to re-render after a live update, so recomputing these
  // small arrays fresh on every render (cheap: at most ~114 and 13
  // entries) is simpler and correct, unlike a useMemo keyed on
  // `dataVersion` alone, which the exhaustive-deps lint rule (rightly)
  // flags as not actually reflecting what the memoized function reads.
  void dataVersion; // read to make the re-render trigger's purpose explicit, not left as a no-op-looking unused variable
  const YEAR_OPTIONS = yearOptions();
  const fromMonthOpts = monthOptions(fromYear);
  const toMonthOpts = monthOptions(toYear);
  const latestLabel = `${MONTH_NAMES[getLatestMonth() - 1]} ${getLatestYear()}`;

  function handleFromYear(y) {
    const year = Number(y);
    setFromYear(year);
    const max = maxMonthForYear(year);
    if (fromMonth > max) setFromMonth(max);
  }
  function handleToYear(y) {
    toTouched.current = true;
    const year = Number(y);
    setToYear(year);
    const max = maxMonthForYear(year);
    if (toMonth > max) setToMonth(max);
  }
  function handleToMonth(v) {
    toTouched.current = true;
    setToMonth(Number(v));
  }

  function calculate() {
    const amt = Number(amount) || Number(DEFAULTS.amount);
    const r = calculateCpiInflation({ amount: amt, fromYear, fromMonth, toYear, toMonth });
    setResult(r);
  }
  function clear() {
    toTouched.current = false;
    setAmount(""); setFromYear(2016); setFromMonth(AVERAGE_MONTH); setToYear(getLatestYear()); setToMonth(getLatestMonth()); setResult(null);
  }

  return (
    <div>
      <SectionHeader
        title="Inflation Calculator with U.S. CPI Data"
        description={`Calculates the equivalent value of the U.S. dollar in any month from 1913 to ${getLatestYear()}. Calculations are based on the average Consumer Price Index (CPI) data for all urban consumers in the U.S.`}
      />
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={fieldWrap}>
              <FieldLabel>Amount</FieldLabel>
              <TextField value={amount} onChange={setAmount} placeholder={DEFAULTS.amount} />
            </div>

            <div style={fieldWrap}>
              <FieldLabel>in</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <SelectField value={fromMonth} onChange={(v) => setFromMonth(Number(v))} options={fromMonthOpts} style={{ flex: 1 }} />
                <SelectField value={fromYear} onChange={handleFromYear} options={YEAR_OPTIONS} style={{ flex: 1 }} />
              </div>
            </div>

            <div style={fieldWrap}>
              <FieldLabel>equals ? in</FieldLabel>
              <div style={{ display: "flex", gap: 8 }}>
                <SelectField value={toMonth} onChange={handleToMonth} options={toMonthOpts} style={{ flex: 1 }} />
                <SelectField value={toYear} onChange={handleToYear} options={YEAR_OPTIONS} style={{ flex: 1 }} />
              </div>
            </div>

            <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 12 }}>
              {liveStatus === "checking" && "Checking for newer or revised CPI data…"}
              {liveStatus === "up-to-date" && `CPI data current through ${latestLabel}.`}
              {liveStatus === "extended" && `CPI data auto-updated — now current through ${latestLabel}.`}
              {liveStatus === "revised" && `A recent CPI figure was just corrected from a live BLS update (data through ${latestLabel}).`}
              {liveStatus === "unavailable" && `Showing built-in CPI data through ${latestLabel} (couldn't check for newer data right now).`}
            </p>

            <CalcButtons onCalculate={calculate} onClear={clear} />
          </div>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <ResultsCard>
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Fill in the details and click <strong>Calculate</strong> to see the equivalent buying power.
              </p>
            ) : (
              <>
                <p style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 12px", lineHeight: 1.5 }}>
                  <span style={{ color: "var(--success)" }}>{formatCurrency(result.value)}</span> in {result.toLabel} equals {formatCurrency(result.amount)} of buying power in {result.fromLabel}.
                </p>
                {result.showAnnualized ? (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 8 }}>
                    The total inflation rate from {result.earlierLabel} to {result.laterLabel} is <strong>{formatPercent(result.totalPercent)}</strong>. The average inflation rate is <strong>{formatPercent(result.avgAnnualPercent)}</strong> per year.
                  </p>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 8 }}>
                    The inflation rate from {result.earlierLabel} to {result.laterLabel} is <strong>{formatPercent(result.totalPercent)}</strong>.
                  </p>
                )}
                <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 16 }}>
                  The CPI of {result.fromLabel} is {result.cpiFrom.toFixed(3)} and the CPI of {result.toLabel} is {result.cpiTo.toFixed(3)}.
                </p>
                <p style={{ fontSize: 13, fontWeight: 700, textAlign: "center", color: "var(--text-primary)", marginBottom: 10 }}>
                  Purchasing power of {formatCurrency(result.amount)} in {result.fromLabel} over time
                </p>
                <InflationCpiChart points={result.chart} />
              </>
            )}
          </ResultsCard>
        </div>
      </div>
    </div>
  );
}

/** "Forward Flat Rate Inflation Calculator" */
function ForwardFlatRateSection() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const amt = Number(amount) || Number(DEFAULTS.amount);
    const r = Number(rate) || Number(DEFAULTS.rate);
    const yrs = Number(years) || Number(DEFAULTS.years);
    setResult({ amount: amt, rate: r, years: yrs, ...calculateForwardFlatRate({ amount: amt, ratePercent: r, years: yrs }) });
  }
  function clear() {
    setAmount(""); setRate(""); setYears(""); setResult(null);
  }

  return (
    <div>
      <SectionHeader
        title="Forward Flat Rate Inflation Calculator"
        description="Calculates an inflation based on a certain average inflation rate after some years."
      />
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={fieldWrap}>
              <FieldLabel>Amount</FieldLabel>
              <TextField value={amount} onChange={setAmount} placeholder={DEFAULTS.amount} />
            </div>
            <div style={fieldWrap}>
              <FieldLabel>Inflation rate</FieldLabel>
              <div style={{ position: "relative" }}>
                <TextField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} style={{ paddingRight: 26 }} />
                <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
              </div>
            </div>
            <div style={fieldWrap}>
              <FieldLabel>After</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>years</span>
              </div>
            </div>
            <CalcButtons onCalculate={calculate} onClear={clear} />
          </div>
        </div>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <ResultsCard>
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Fill in the details and click <strong>Calculate</strong> to project the future value.
              </p>
            ) : (
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {formatCurrency(result.amount)} now equals <strong style={{ color: "var(--success)" }}>{formatCurrency(result.value)}</strong> after {result.years} years in purchasing power with an average inflation rate of {result.rate}%.
              </p>
            )}
          </ResultsCard>
        </div>
      </div>
    </div>
  );
}

/** "Backward Flat Rate Inflation Calculator" */
function BackwardFlatRateSection() {
  const [amount, setAmount] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const amt = Number(amount) || Number(DEFAULTS.amount);
    const r = Number(rate) || Number(DEFAULTS.rate);
    const yrs = Number(years) || Number(DEFAULTS.years);
    setResult({ amount: amt, rate: r, years: yrs, ...calculateBackwardFlatRate({ amount: amt, ratePercent: r, years: yrs }) });
  }
  function clear() {
    setAmount(""); setRate(""); setYears(""); setResult(null);
  }

  return (
    <div>
      <SectionHeader
        title="Backward Flat Rate Inflation Calculator"
        description="Calculates the equivalent purchasing power of an amount some years ago based on a certain average inflation rate."
      />
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={fieldWrap}>
              <FieldLabel>Amount</FieldLabel>
              <TextField value={amount} onChange={setAmount} placeholder={DEFAULTS.amount} />
            </div>
            <div style={fieldWrap}>
              <FieldLabel>Inflation rate</FieldLabel>
              <div style={{ position: "relative" }}>
                <TextField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} style={{ paddingRight: 26 }} />
                <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: 14, pointerEvents: "none" }}>%</span>
              </div>
            </div>
            <div style={fieldWrap}>
              <FieldLabel>Years ago</FieldLabel>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <TextField value={years} onChange={setYears} placeholder={DEFAULTS.years} style={{ flex: 1 }} />
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>years</span>
              </div>
            </div>
            <CalcButtons onCalculate={calculate} onClear={clear} />
          </div>
        </div>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <ResultsCard>
            {!result ? (
              <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
                Fill in the details and click <strong>Calculate</strong> to see the equivalent past value.
              </p>
            ) : (
              <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                {formatCurrency(result.amount)} now equals <strong style={{ color: "var(--success)" }}>{formatCurrency(result.value)}</strong> of purchasing power {result.years} years ago with an average inflation rate of {result.rate}%.
              </p>
            )}
          </ResultsCard>
        </div>
      </div>
    </div>
  );
}

export default function InflationCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <CpiSection />
      <ForwardFlatRateSection />
      <BackwardFlatRateSection />
    </div>
  );
}
