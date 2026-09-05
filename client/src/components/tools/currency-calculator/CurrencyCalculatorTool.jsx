import { useEffect, useMemo, useState } from "react";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import {
  CURRENCY_LIST, MAJOR_CURRENCY_CODES, DEFAULT_FROM, DEFAULT_TO,
  fetchLiveRates, convertLive, convertCustomRate, formatCurrencyRate, formatRateTimestamp,
} from "../../../utils/currencyCalculatorEngine";

const DEFAULTS = { amount: "100", rate: "4", amount2: "100" };

const fieldWrap = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 };
const rowStyle = { display: "flex", gap: 10 };

function currencyOptions(list) {
  return list.map(([code, name]) => ({ value: code, label: `${code}: ${name}` }));
}

function ResultLine({ children }) {
  return (
    <p style={{ fontSize: 17, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--text-primary)", margin: "0 0 8px", lineHeight: 1.5 }}>
      {children}
    </p>
  );
}

function ResultsCard({ title, children, footer }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ background: "var(--success)", color: "#fff", padding: "14px 20px", fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>
        {title}
      </div>
      <div style={{ padding: "18px 20px" }}>
        {children}
        {footer}
      </div>
    </div>
  );
}

function CalcButtons({ onCalculate, onClear, disabled }) {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <button type="button" onClick={onCalculate} disabled={disabled} style={{
        flex: 1, padding: "12px 0", fontSize: 14.5, background: disabled ? "var(--text-muted)" : "var(--success)",
        color: "#fff", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700,
        fontFamily: "var(--font-display)", cursor: disabled ? "not-allowed" : "pointer",
      }}>
        Calculate
      </button>
      <button type="button" onClick={onClear} className="btn-secondary" style={{ padding: "12px 20px", fontSize: 14 }}>Clear</button>
    </div>
  );
}

/** "With Live Exchange Rate" — converts using a real market rate fetched
 * once on mount (see currencyCalculatorEngine.js's fetchLiveRates). */
function LiveRateSection() {
  const [amount, setAmount] = useState("");
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const [popularOnly, setPopularOnly] = useState(true);
  const [result, setResult] = useState(null);

  const [rates, setRates] = useState(null);
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState(null);
  const [rateError, setRateError] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);

  // `cancelled` guards against setting state after the effect has been
  // torn down (StrictMode double-invoke / fast tab navigation) — same
  // pattern already used by useWordFinder.js's own fetch-on-mount effect.
  // No setState call happens synchronously in the effect body itself
  // (rateLoading already starts `true` via its own useState default) —
  // every one is inside a .then/.catch callback, which this codebase's
  // lint rule (react-hooks/set-state-in-effect) doesn't flag.
  useEffect(() => {
    let cancelled = false;
    fetchLiveRates()
      .then(({ rates: r, updatedAt }) => {
        if (cancelled) return;
        setRates(r); setRatesUpdatedAt(updatedAt); setRateLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setRateError("Couldn't fetch live exchange rates. Check your connection and try again.");
        setRateLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Retry is a plain click handler (not an effect), so setting loading
  // state synchronously here is fine.
  function retryLoadRates() {
    setRateLoading(true);
    setRateError(null);
    fetchLiveRates()
      .then(({ rates: r, updatedAt }) => { setRates(r); setRatesUpdatedAt(updatedAt); })
      .catch(() => setRateError("Couldn't fetch live exchange rates. Check your connection and try again."))
      .finally(() => setRateLoading(false));
  }

  const visibleCurrencies = useMemo(
    () => (popularOnly ? CURRENCY_LIST.filter(([code]) => MAJOR_CURRENCY_CODES.has(code)) : CURRENCY_LIST),
    [popularOnly]
  );
  const visibleCodes = useMemo(() => new Set(visibleCurrencies.map(([code]) => code)), [visibleCurrencies]);

  function handlePopularToggle(checked) {
    setPopularOnly(checked);
    const nextList = checked ? CURRENCY_LIST.filter(([code]) => MAJOR_CURRENCY_CODES.has(code)) : CURRENCY_LIST;
    const nextCodes = new Set(nextList.map(([code]) => code));
    // Mirrors the reference's own dropdown-repopulation behavior: if the
    // currently-selected currency isn't in the newly filtered list,
    // fall back to the list's own defaults rather than leaving a
    // dangling selection.
    if (!nextCodes.has(from)) setFrom(nextCodes.has(DEFAULT_FROM) ? DEFAULT_FROM : nextList[0]?.[0] ?? "");
    if (!nextCodes.has(to)) setTo(nextCodes.has(DEFAULT_TO) ? DEFAULT_TO : nextList[1]?.[0] ?? nextList[0]?.[0] ?? "");
  }

  function calculate() {
    if (!rates) return;
    const amt = Number(amount) || Number(DEFAULTS.amount);
    const converted = convertLive(amt, from, to, rates);
    if (!converted) return;
    setResult({ amount: amt, from, to, ...converted });
  }
  function clear() {
    setAmount(""); setFrom(DEFAULT_FROM); setTo(DEFAULT_TO); setPopularOnly(true); setResult(null);
  }

  const timestampLabel = formatRateTimestamp(ratesUpdatedAt);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 360px", minWidth: 320 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={fieldWrap}>
            <FieldLabel>Amount</FieldLabel>
            <TextField value={amount} onChange={setAmount} placeholder={DEFAULTS.amount} />
          </div>
          <div style={fieldWrap}>
            <FieldLabel>From</FieldLabel>
            <SelectField value={visibleCodes.has(from) ? from : ""} onChange={setFrom} options={currencyOptions(visibleCurrencies)} />
          </div>
          <div style={fieldWrap}>
            <FieldLabel>To</FieldLabel>
            <SelectField value={visibleCodes.has(to) ? to : ""} onChange={setTo} options={currencyOptions(visibleCurrencies)} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, cursor: "pointer" }}>
            <input
              type="checkbox" checked={popularOnly}
              onChange={(e) => handlePopularToggle(e.target.checked)}
              style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
            />
            <span style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>Show most popular currencies only</span>
          </label>

          {rateError && (
            <p style={{ fontSize: 12.5, color: "var(--error)", marginBottom: 12, lineHeight: 1.5 }}>
              {rateError}{" "}
              <button type="button" onClick={retryLoadRates} style={{ background: "none", border: "none", padding: 0, color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 12.5 }}>
                Retry
              </button>
            </p>
          )}
          {rateLoading && !rateError && (
            <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginBottom: 12 }}>Fetching live exchange rates…</p>
          )}

          <CalcButtons onCalculate={calculate} onClear={clear} disabled={rateLoading || !!rateError} />
        </div>
      </div>

      <div style={{ flex: "1 1 360px", minWidth: 320 }}>
        <ResultsCard title="Results">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Fill in the details and click <strong>Calculate</strong> to convert at the live exchange rate.
            </p>
          ) : (
            <>
              <ResultLine>
                {result.amount.toLocaleString("en-US")} {result.from} = <span style={{ color: "var(--success)" }}>{formatCurrencyRate(result.forward)}</span> {result.to}
              </ResultLine>
              <ResultLine>
                {result.amount.toLocaleString("en-US")} {result.to} = <span style={{ color: "var(--success)" }}>{formatCurrencyRate(result.reverse)}</span> {result.from}
              </ResultLine>
              {timestampLabel && (
                <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 10 }}>
                  Rates as of {timestampLabel}, via open.er-api.com.
                </p>
              )}
            </>
          )}
        </ResultsCard>
      </div>
    </div>
  );
}

/** "Customized Currency Exchange Rate" — fully offline arithmetic, no
 * live data involved at all. */
function CustomRateSection() {
  const [rate, setRate] = useState("");
  const [amount2, setAmount2] = useState("");
  const [result, setResult] = useState(null);

  function calculate() {
    const r = Number(rate) || Number(DEFAULTS.rate);
    const amt = Number(amount2) || Number(DEFAULTS.amount2);
    setResult({ amount: amt, ...convertCustomRate(r, amt) });
  }
  function clear() {
    setRate(""); setAmount2(""); setResult(null);
  }

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div style={{ flex: "1 1 360px", minWidth: 320 }}>
        <div className="card" style={{ padding: 24 }}>
          <div style={fieldWrap}>
            <FieldLabel>Exchange rate for currency A/B</FieldLabel>
            <TextField value={rate} onChange={setRate} placeholder={DEFAULTS.rate} />
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Equivalent unit(s) of B compared to 1 unit of A</span>
          </div>
          <div style={fieldWrap}>
            <FieldLabel>Amount to exchange</FieldLabel>
            <TextField value={amount2} onChange={setAmount2} placeholder={DEFAULTS.amount2} />
          </div>
          <CalcButtons onCalculate={calculate} onClear={clear} />
        </div>
      </div>

      <div style={{ flex: "1 1 360px", minWidth: 320 }}>
        <ResultsCard title="Results">
          {!result ? (
            <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
              Fill in the details and click <strong>Calculate</strong> to convert using your own rate.
            </p>
          ) : (
            <>
              <ResultLine>
                currency A {formatCurrencyRate(result.amount)} = currency B <span style={{ color: "var(--success)" }}>{formatCurrencyRate(result.aToB)}</span>
              </ResultLine>
              <ResultLine>
                currency B {formatCurrencyRate(result.amount)} = currency A <span style={{ color: "var(--success)" }}>{formatCurrencyRate(result.bToA)}</span>
              </ResultLine>
            </>
          )}
        </ResultsCard>
      </div>
    </div>
  );
}

export default function CurrencyCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 14 }}>
          With Live Exchange Rate
        </p>
        <LiveRateSection />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text-primary)", marginBottom: 14 }}>
          Customized Currency Exchange Rate
        </p>
        <CustomRateSection />
      </div>
    </div>
  );
}
