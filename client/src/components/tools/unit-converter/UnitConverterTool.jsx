import { useState, useRef, useCallback } from "react";
import {
  UNIT_CATEGORIES,
  convert,
  formatResult,
  safeParseFloat,
} from "../../../utils/unitConverter";

// ── Copy button (2 s success state) ──────────────────────────
function CopyButton({ text, disabled }) {
  const [state, setState] = useState("idle"); // idle | ok | err
  const timer = useRef(null);

  const handleCopy = useCallback(async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      try {
        const el = document.createElement("textarea");
        el.value = text;
        Object.assign(el.style, { position: "fixed", opacity: "0" });
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
        setState("ok");
      } catch {
        setState("err");
      }
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2000);
  }, [text]);

  const ok = state === "ok";

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleCopy}
      disabled={disabled || !text}
      title="Copy result"
      style={{
        flexShrink: 0,
        opacity: (disabled || !text) ? 0.4 : 1,
        cursor: (disabled || !text) ? "not-allowed" : "pointer",
        background: ok ? "#f0fdf4" : undefined,
        color: ok ? "#16a34a" : undefined,
        borderColor: ok ? "#bbf7d0" : undefined,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
        padding: "10px 14px",
        fontSize: 13,
      }}
    >
      {ok ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5l3 3 6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M9 4V2.5A1.5 1.5 0 007.5 1H2.5A1.5 1.5 0 001 2.5v5A1.5 1.5 0 002.5 9H4"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

// ── Input field with unit symbol addon ────────────────────────
function UnitInput({ value, onChange, symbol, placeholder = "0", autoFocus = false }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch" }}>
      <input
        type="text"
        inputMode="decimal"
        className="input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          flex: 1,
          borderRadius: "var(--radius-md) 0 0 var(--radius-md)",
          borderRight: "none",
          fontSize: 22,
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--text-primary)",
        }}
      />
      <span style={{
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        background: "var(--bg-muted)",
        border: "1.5px solid var(--border)",
        borderLeft: "none",
        borderRadius: "0 var(--radius-md) var(--radius-md) 0",
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        fontSize: 14,
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
        minWidth: 48,
        justifyContent: "center",
        userSelect: "none",
      }}>
        {symbol}
      </span>
    </div>
  );
}

// ── Main tool ─────────────────────────────────────────────────
export default function UnitConverterTool() {
  const firstCat  = UNIT_CATEGORIES[0];
  const initResult = formatResult(
    convert(1, firstCat.defaultFrom, firstCat.defaultTo, firstCat.id)
  );

  const [catId,     setCatId]     = useState(firstCat.id);
  const [fromId,    setFromId]    = useState(firstCat.defaultFrom);
  const [toId,      setToId]      = useState(firstCat.defaultTo);
  const [fromVal,   setFromVal]   = useState("1");
  const [toVal,     setToVal]     = useState(initResult);
  const [swapSpin,  setSwapSpin]  = useState(false);

  const category  = UNIT_CATEGORIES.find(c => c.id === catId);
  const fromUnit  = category?.units.find(u => u.id === fromId);
  const toUnit    = category?.units.find(u => u.id === toId);

  // ── Conversion helpers ──────────────────────────────────────
  function calcTo(val, fId, tId, cId) {
    const n = safeParseFloat(val);
    if (isNaN(n)) return "";
    const r = convert(n, fId, tId, cId);
    return isFinite(r) ? formatResult(r) : "";
  }

  function calcFrom(val, fId, tId, cId) {
    // Reverse: treat "to" value as input, convert back to "from" unit
    return calcTo(val, tId, fId, cId);
  }

  // ── Handlers ───────────────────────────────────────────────
  function handleCategoryChange(newCatId) {
    const cat = UNIT_CATEGORIES.find(c => c.id === newCatId);
    const fId = cat.defaultFrom;
    const tId = cat.defaultTo;
    const newTo = calcTo("1", fId, tId, newCatId);
    setCatId(newCatId);
    setFromId(fId);
    setToId(tId);
    setFromVal("1");
    setToVal(newTo);
  }

  function handleFromUnitChange(newFromId) {
    setFromId(newFromId);
    setToVal(calcTo(fromVal, newFromId, toId, catId));
  }

  function handleToUnitChange(newToId) {
    setToId(newToId);
    setToVal(calcTo(fromVal, fromId, newToId, catId));
  }

  function handleFromValueChange(val) {
    // Allow: digits, decimal point, leading minus, empty
    if (!/^-?\d*\.?\d*$/.test(val) && val !== "" && val !== "-") return;
    setFromVal(val);
    setToVal(calcTo(val, fromId, toId, catId));
  }

  function handleToValueChange(val) {
    if (!/^-?\d*\.?\d*$/.test(val) && val !== "" && val !== "-") return;
    setToVal(val);
    setFromVal(calcFrom(val, fromId, toId, catId));
  }

  function handleSwap() {
    setSwapSpin(true);
    setTimeout(() => setSwapSpin(false), 350);

    const newFromId = toId;
    const newToId   = fromId;
    const newFromVal = toVal;
    const newToVal   = fromVal;
    setFromId(newFromId);
    setToId(newToId);
    setFromVal(newFromVal);
    setToVal(newToVal);
  }

  // Equivalence reference: "1 meter = 3.28084 feet"
  const equivResult = calcTo("1", fromId, toId, catId);
  const equivNote = fromUnit && toUnit && equivResult
    ? `1 ${fromUnit.symbol} = ${equivResult} ${toUnit.symbol}`
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        .uc-cat-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 10px 8px;
          border-radius: var(--radius-md);
          border: 1.5px solid var(--border);
          background: var(--bg-white);
          cursor: pointer;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 11.5px;
          color: var(--text-secondary);
          transition: all var(--transition);
          text-align: center;
          line-height: 1.2;
        }
        .uc-cat-btn:hover {
          border-color: var(--border-hover);
          background: var(--bg-muted);
          color: var(--text-primary);
        }
        .uc-cat-btn.uc-active {
          border-color: var(--accent);
          background: var(--accent-light);
          color: var(--accent);
          box-shadow: 0 0 0 2px rgba(59,123,252,0.12);
        }
        .uc-select {
          width: 100%;
          padding: 11px 14px;
          background: var(--bg-white);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          outline: none;
          transition: border-color var(--transition), box-shadow var(--transition);
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%238888a0' stroke-width='1.5' stroke-linecap='round' fill='none'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
        }
        .uc-select:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(59,123,252,0.12);
        }
        @keyframes uc-spin-half {
          from { transform: rotate(0deg); }
          to   { transform: rotate(180deg); }
        }
        .uc-swap-spin svg {
          animation: uc-spin-half 0.32s ease forwards;
        }
      `}</style>

      {/* ── Category selector ── */}
      <div className="animate-fadeUp">
        <div style={{
          fontFamily: "var(--font-display)", fontWeight: 700,
          fontSize: 12, color: "var(--text-muted)",
          textTransform: "uppercase", letterSpacing: "0.08em",
          marginBottom: 10,
        }}>
          Select Category
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
          gap: 7,
        }}>
          {UNIT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              className={`uc-cat-btn${catId === cat.id ? " uc-active" : ""}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Converter card ── */}
      <div className="card animate-fadeUp delay-100" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Active category badge */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{category?.icon}</span>
          <div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 800,
              fontSize: 16, color: "var(--text-primary)", letterSpacing: "-0.02em",
            }}>
              {category?.label}
            </div>
            {equivNote && (
              <div style={{
                fontSize: 12, color: "var(--text-muted)",
                fontFamily: "var(--font-display)", fontWeight: 500, marginTop: 1,
              }}>
                {equivNote}
              </div>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: "var(--border)" }} />

        {/* FROM row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: 12, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            From
          </label>
          <select
            className="uc-select"
            value={fromId}
            onChange={e => handleFromUnitChange(e.target.value)}
          >
            {category?.units.map(u => (
              <option key={u.id} value={u.id}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>
          <UnitInput
            value={fromVal}
            onChange={handleFromValueChange}
            symbol={fromUnit?.symbol ?? ""}
            placeholder="Enter value"
            autoFocus
          />
        </div>

        {/* Swap button */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className={`btn btn-secondary${swapSpin ? " uc-swap-spin" : ""}`}
            onClick={handleSwap}
            title="Swap units and values"
            style={{ gap: 8, padding: "9px 20px", fontSize: 13 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 3L4 13M4 13L1.5 10.5M4 13L6.5 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 13L12 3M12 3L9.5 5.5M12 3L14.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Swap
          </button>
        </div>

        {/* TO row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{
            fontFamily: "var(--font-display)", fontWeight: 600,
            fontSize: 12, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            To
          </label>
          <select
            className="uc-select"
            value={toId}
            onChange={e => handleToUnitChange(e.target.value)}
          >
            {category?.units.map(u => (
              <option key={u.id} value={u.id}>
                {u.label} ({u.symbol})
              </option>
            ))}
          </select>

          {/* Result row: input + copy button */}
          <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
            <div style={{ flex: 1 }}>
              <UnitInput
                value={toVal}
                onChange={handleToValueChange}
                symbol={toUnit?.symbol ?? ""}
              />
            </div>
            <CopyButton text={toVal} disabled={!toVal} />
          </div>
        </div>

        {/* Quick reference: what 1 of each unit equals */}
        {fromUnit && toUnit && fromId !== toId && (
          <div style={{
            background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
            padding: "10px 14px", display: "flex", flexWrap: "wrap", gap: "6px 16px",
            border: "1px solid var(--border)",
          }}>
            <QuickRef fromId={fromId} toId={toId} catId={catId} units={category.units} />
          </div>
        )}
      </div>

      {/* ── Common conversions cheat sheet ── */}
      <CommonConversions catId={catId} fromId={fromId} toId={toId} category={category} />

      {/* ── Info note ── */}
      <div className="animate-fadeUp delay-200" style={{
        background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
        padding: "12px 16px", fontSize: 12.5,
        color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 500, display: "flex", gap: 8,
        alignItems: "flex-start", border: "1px solid var(--border)",
      }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
        <span>
          Both fields are editable — type in either box to convert in both directions.
          All conversions use exact SI definitions. Temperature uses linear transformations per standard formulas.
          Data storage uses binary prefixes (1 KB = 1,024 bytes).
        </span>
      </div>
    </div>
  );
}

// ── Quick reference row ───────────────────────────────────────
// Shows "1 A = X B" and "1 B = X A"
function QuickRef({ fromId, toId, catId, units }) {
  const fromUnit = units.find(u => u.id === fromId);
  const toUnit   = units.find(u => u.id === toId);
  if (!fromUnit || !toUnit) return null;

  const fwdResult = formatResult(convert(1, fromId, toId, catId));
  const revResult = formatResult(convert(1, toId, fromId, catId));

  const itemStyle = {
    fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 12.5,
    color: "var(--text-secondary)", whiteSpace: "nowrap",
  };

  return (
    <>
      {fwdResult && (
        <span style={itemStyle}>
          1&nbsp;<strong style={{ color: "var(--text-primary)" }}>{fromUnit.symbol}</strong>
          &nbsp;=&nbsp;
          <strong style={{ color: "var(--accent)" }}>{fwdResult}</strong>
          &nbsp;{toUnit.symbol}
        </span>
      )}
      {revResult && (
        <span style={itemStyle}>
          1&nbsp;<strong style={{ color: "var(--text-primary)" }}>{toUnit.symbol}</strong>
          &nbsp;=&nbsp;
          <strong style={{ color: "var(--accent)" }}>{revResult}</strong>
          &nbsp;{fromUnit.symbol}
        </span>
      )}
    </>
  );
}

// ── Common conversions cheat sheet ────────────────────────────
// Shows a handful of "milestone" values for the current unit pair.
const CHEAT_SHEETS = {
  length: [
    { from: "km",  to: "mi",  values: [1, 5, 10, 100] },
    { from: "m",   to: "ft",  values: [1, 10, 100] },
    { from: "cm",  to: "in",  values: [1, 30, 100] },
  ],
  weight: [
    { from: "kg",  to: "lb",  values: [1, 5, 10, 70] },
    { from: "lb",  to: "kg",  values: [1, 10, 100, 150] },
    { from: "g",   to: "oz",  values: [100, 250, 500] },
  ],
  temperature: [
    { from: "c",   to: "f",   values: [0, 20, 37, 100] },
    { from: "f",   to: "c",   values: [32, 98.6, 212] },
  ],
  speed: [
    { from: "kmh", to: "mph", values: [60, 100, 120, 300] },
    { from: "mph", to: "kmh", values: [30, 60, 100] },
  ],
  data: [
    { from: "gb",  to: "mb",  values: [1, 4, 16, 256] },
    { from: "tb",  to: "gb",  values: [1, 2, 4, 8] },
  ],
};

function CommonConversions({ catId, fromId, toId, category }) {
  const sheets = CHEAT_SHEETS[catId];
  if (!sheets) return null;

  // Pick the sheet that matches from/to (or close enough)
  const sheet = sheets.find(s => s.from === fromId && s.to === toId)
    || sheets.find(s => s.to === fromId && s.from === toId)
    || sheets[0];

  if (!sheet) return null;

  const fromUnit = category?.units.find(u => u.id === sheet.from);
  const toUnit   = category?.units.find(u => u.id === sheet.to);
  if (!fromUnit || !toUnit) return null;

  const rows = sheet.values.map(v => ({
    from: v,
    to:   formatResult(convert(v, sheet.from, sheet.to, catId)),
  }));

  return (
    <div className="card animate-fadeUp delay-200" style={{ overflow: "hidden" }}>
      <div style={{
        padding: "12px 16px",
        fontFamily: "var(--font-display)", fontWeight: 700,
        fontSize: 12, color: "var(--text-muted)",
        textTransform: "uppercase", letterSpacing: "0.08em",
        borderBottom: "1px solid var(--border)",
      }}>
        Common {fromUnit.symbol} → {toUnit.symbol} conversions
      </div>
      <div style={{ padding: "4px 0" }}>
        {rows.map(row => (
          <div key={row.from} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "9px 16px",
            borderBottom: "1px solid var(--border)",
          }}>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 600,
              fontSize: 14, color: "var(--text-secondary)",
            }}>
              {row.from} <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{fromUnit.symbol}</span>
            </span>
            <span style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 8px" }}>→</span>
            <span style={{
              fontFamily: "var(--font-display)", fontWeight: 700,
              fontSize: 14, color: "var(--text-primary)",
            }}>
              {row.to} <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{toUnit.symbol}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
