import { useState } from "react";
import { FieldLabel, TextField } from "../mortgage-payoff-calculator/MortgagePayoffFormControls";
import { SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import PcbConductorDiagram from "./PcbConductorDiagram";
import { unitToSi, convertUnitTexts } from "../../../utils/cbmCalculatorEngine";
import { decimalOf } from "../../../utils/ieltsScoreCalculatorEngine";
import { TYPES, calculatePcbImpedance, fmt } from "../../../utils/pcbImpedanceCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const help = { ...muted, fontSize: 12, marginTop: -2 };
const unitSelect = { width: "auto", padding: "3px 6px", fontSize: 12.5, marginLeft: 6 };

const dec = (s) => decimalOf(s);
const lu = (value, label, short, n, d = "1") => ({ value, label, short, f: [dec(n), dec(d)] });
const LENGTH_UNITS = [
  lu("nm", "nanometers (nm)", "nm", "1", "1000000000"), lu("um", "micrometers (μm)", "μm", "1", "1000000"), lu("mm", "millimeters (mm)", "mm", "1", "1000"),
  lu("cm", "centimeters (cm)", "cm", "1", "100"), lu("m", "meters (m)", "m", "1"), lu("mil", "thou, thousandth of an inch (mil)", "mil", "127", "5000000"),
  lu("in", "inches (in)", "in", "127", "5000"), lu("ft", "feet (ft)", "ft", "381", "1250"), lu("eighths", "eighths of an inch (⅛ in)", "⅛ in", "127", "40000"),
  lu("oz", "ounces per square foot (oz/ft²)", "oz/ft²", "7", "200000"),
];
const IMPEDANCE_UNITS = [{ value: "mohm", short: "mΩ", factor: 1e-3 }, { value: "ohm", short: "Ω", factor: 1 }, { value: "kohm", short: "kΩ", factor: 1e3 }, { value: "Mohm", short: "MΩ", factor: 1e6 }];
const FIELDS = {
  thickness: { label: "Thickness (T)" },
  diameter: { label: "Wire diameter (D)", help: "Diameter of the wire carrying the signal inside the substrate." },
  width: { label: "Width (W)" },
  height: { label: "Substrate height (H)", help: "The separation between the signal line and the reference plane." },
  height1: { label: "Substrate height (H1)", help: "Height in the substrate at which the microstrip is placed." },
  b: { label: "Substrate height (B)" },
  height2: { label: "Substrate height (H2)", help: "Total height of the substrate." },
  spacing: { label: "Spacing (S)", help: "Distance between two microstrips." },
  er: { label: "Substrate dielectric", help: "Relative permittivity of the substrate material." },
};
const LENGTH_KEYS = Object.keys(FIELDS).filter((k) => k !== "er");
const TYPE_OPTIONS = TYPES.map((t) => ({ value: String(t.value), label: t.label }));

const EMPTY = () => ({
  type: 0,
  fields: Object.fromEntries(LENGTH_KEYS.map((k) => [k, { unit: "um", texts: [""] }])),
  er: "", showWidth: false, zUnit: "ohm", wUnit: "um",
});

function ResultBody({ result, zUnit, setZUnit, wUnit, setWUnit, showWidth }) {
  if (!result) return <p style={muted}>Choose the conductor type, enter its dimensions and the substrate dielectric, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const zf = IMPEDANCE_UNITS.find((x) => x.value === zUnit);
  const z = (x) => fmt(x / zf.factor);
  const pick = <SelectField value={zUnit} onChange={setZUnit} options={IMPEDANCE_UNITS.map((x) => ({ value: x.value, label: x.short }))} style={unitSelect} />;
  const wu = LENGTH_UNITS.find((x) => x.value === wUnit);
  const single = result.impedance !== undefined;
  return (
    <>
      <HighlightSummary
        label={single ? "Impedance" : "Impedance (differential)"} value={z(single ? result.impedance : result.differential)} unit={zf.short}
        color="var(--accent)" note={single ? "characteristic impedance" : "of the coupled pair"}
      />
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 4, marginTop: -4 }}>
        <span style={{ ...muted, fontSize: 12.5 }}>Impedance in</span>{pick}
      </div>
      <StatList>
        {result.epsEff !== null && <StatRow label="Effective dielectric constant (ε_eff)">{fmt(result.epsEff)}</StatRow>}
        {!single && (
          <>
            <StatRow label="Impedance (odd)">{z(result.odd)} {zf.short}</StatRow>
            <StatRow label="Impedance (even)">{z(result.even)} {zf.short}</StatRow>
            <StatRow label="Impedance (differential)" tone="var(--accent)">{z(result.differential)} {zf.short}</StatRow>
            <StatRow label="Impedance (common)">{z(result.common)} {zf.short}</StatRow>
          </>
        )}
        {showWidth && result.effectiveWidth !== null && (
          <StatRow label="Effective signal width (w′)">
            <span style={{ display: "inline-flex", alignItems: "center" }}>
              {fmt(result.effectiveWidth / (Number(`${wu.f[0].n}e-${wu.f[0].s}`) / Number(`${wu.f[1].n}e-${wu.f[1].s}`)))}
              <SelectField value={wUnit} onChange={setWUnit} options={LENGTH_UNITS.map((x) => ({ value: x.value, label: x.short }))} style={unitSelect} />
            </span>
          </StatRow>
        )}
      </StatList>
    </>
  );
}

export default function PcbImpedanceCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const def = TYPES.find((t) => t.value === s.type);

  const run = (state) => {
    const v = {};
    for (const k of LENGTH_KEYS) {
      const si = unitToSi(LENGTH_UNITS, state.fields[k].unit, state.fields[k].texts);
      v[k] = si === null ? null : si === false ? Number.NaN : Number(`${si.n}e-${si.s}`);
    }
    const erText = String(state.er).replace(/,/g, "").trim();
    const erDec = erText === "" ? null : dec(erText);
    v.er = erText === "" ? null : erDec ? Number(`${erDec.n}e-${erDec.s}`) : Number.NaN;
    const r = calculatePcbImpedance(state.type, v);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r;
  };
  const update = (patch) => {
    const next = { ...s, ...patch };
    setS(next);
    if (result) setResult(run(next));
  };
  const setTexts = (k) => (i, text) => setS((p) => ({ ...p, fields: { ...p.fields, [k]: { unit: p.fields[k].unit, texts: [text] } } }));
  const setUnit = (k) => (unit) => setS((p) => ({ ...p, fields: { ...p.fields, [k]: { unit, texts: convertUnitTexts(LENGTH_UNITS, p.fields[k].unit, unit, p.fields[k].texts) } } }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Find the characteristic impedance of a PCB conductor: microstrips (single, edge-coupled, wire and embedded) and striplines (wire,
        edge-coupled, broadside-coupled, symmetric and asymmetric), plus the effective dielectric constant and signal width.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="PCB conductor">
            <label style={fieldWrap}>
              <FieldLabel>Select PCB conductor</FieldLabel>
              <SelectField value={String(s.type)} onChange={(v) => update({ type: Number(v) })} options={TYPE_OPTIONS} />
            </label>
            <PcbConductorDiagram type={s.type} />
            <div style={{ marginTop: 14 }}>
              {def.fields.map((k) => (
                <div key={`${s.type}-${k}`} style={fieldWrap}>
                  <label style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <FieldLabel>{FIELDS[k].label}</FieldLabel>
                    <Req name={k} flagged={req.flagged}>
                      {k === "er" ? (
                        <TextField value={s.er} onChange={(t) => setS((p) => ({ ...p, er: t }))} />
                      ) : (
                        <UnitMeasureField label={FIELDS[k].label} units={LENGTH_UNITS} unit={s.fields[k].unit} onUnitChange={setUnit(k)} values={s.fields[k].texts} onChange={setTexts(k)} />
                      )}
                    </Req>
                  </label>
                  {FIELDS[k].help && <p style={help}>{FIELDS[k].help}</p>}
                </div>
              ))}
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-primary)", marginBottom: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={s.showWidth} onChange={(e) => setS((p) => ({ ...p, showWidth: e.target.checked }))} />
              Show effective signal width
            </label>
            <ButtonRow onCalculate={calculate} onClear={clear} />
          </section>
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Results</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody
              result={result} zUnit={s.zUnit} setZUnit={(u) => setS((p) => ({ ...p, zUnit: u }))}
              wUnit={s.wUnit} setWUnit={(u) => setS((p) => ({ ...p, wUnit: u }))} showWidth={s.showWidth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
