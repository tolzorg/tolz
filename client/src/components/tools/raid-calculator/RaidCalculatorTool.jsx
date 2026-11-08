import { useState } from "react";
import { Link } from "react-router-dom";
import { FieldLabel, TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { ErrorPanel, ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { Req } from "../calculator-ui/Required";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import RaidDiagram from "./RaidDiagram";
import {
  LEVELS, DATA_UNITS, DEFAULT_DISKS, DEFAULT_SETS, levelOf, diskNote, calculateRaid, fmt, inUnit, money,
} from "../../../utils/raidCalculatorEngine";
import { CURRENCIES } from "../../../utils/freightClassCalculatorEngine";

const para = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 10px" };
const muted = { fontSize: 13, color: "var(--text-muted)", margin: 0 };
const resultBanner = { background: "var(--accent)", color: "#fff", padding: "11px 16px", fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)" };
const fieldWrap = { display: "flex", flexDirection: "column", gap: 5, marginBottom: 12, minWidth: 0 };
const cardTitle = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15, color: "var(--text-primary)", margin: "0 0 12px" };
const notice = { fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, margin: "0 0 12px", padding: "8px 10px", borderRadius: "var(--radius-sm)", background: "var(--warning-light)", border: "1px solid var(--warning)" };
const groupHead = { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 13.5, color: "var(--text-primary)", margin: "16px 0 0" };
const small = { width: "auto", flexShrink: 0, padding: "8px 6px", fontSize: 13 };
const unitSelect = { width: "auto", padding: "3px 6px", fontSize: 12.5, marginLeft: 6 };
const suffix = { fontSize: 12.5, color: "var(--text-muted)", flexShrink: 0 };

const LEVEL_OPTIONS = LEVELS.map((l) => ({ value: l.value, label: l.label }));
const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: c }));
const UNIT_OPTIONS = DATA_UNITS.map((u) => ({ value: u.value, label: u.short }));
const shortOf = (unit) => DATA_UNITS.find((u) => u.value === unit)?.short ?? unit;

const EMPTY = () => ({
  level: "0", size: "", sizeUnit: "TB",
  disks: { ...DEFAULT_DISKS }, sets: { raid50: DEFAULT_SETS, raid60: DEFAULT_SETS }, cost: "", currency: "USD",
  outUnits: { usable: "TB", unavailable: "TB" },
});

function SuffixField({ value, onChange, unit }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <TextField value={value} onChange={onChange} style={{ flex: 1, minWidth: 0 }} />
      {unit && <span style={suffix}>{unit}</span>}
    </div>
  );
}

function ResultBody({ result, s, setOutUnit }) {
  if (!result) return <p style={muted}>Choose the RAID level, enter the size of one disk and the number of disks, then click Calculate.</p>;
  if (result.errors) return <ErrorPanel messages={result.errors} />;
  const cap = (k, label) => (
    <StatRow label={label}>
      <span style={{ display: "inline-flex", alignItems: "center" }}>
        {fmt(inUnit(result[k], s.outUnits[k]))}
        <SelectField value={s.outUnits[k]} onChange={(u) => setOutUnit(k, u)} options={UNIT_OPTIONS} style={unitSelect} />
      </span>
    </StatRow>
  );
  const { faultInfo, currency } = result; // the currency the result was calculated in
  const faultUnit = faultInfo.unit;
  return (
    <>
      <HighlightSummary
        label="Usable capacity" value={fmt(inUnit(result.usable, s.outUnits.usable))} unit={shortOf(s.outUnits.usable)} color="var(--accent)"
        note={`${fmt(result.utilization * 100)}% of ${fmt(inUnit(result.total, s.outUnits.usable))} ${shortOf(s.outUnits.usable)} raw`}
      />
      <h3 style={groupHead}>Capacity statistics</h3>
      <StatList>
        {cap("usable", "Usable capacity")}
        {cap("unavailable", "Unavailable capacity")}
        <StatRow label="Capacity utilization">{fmt(result.utilization * 100)}%</StatRow>
      </StatList>
      <h3 style={groupHead}>Performance &amp; fault tolerance</h3>
      <StatList>
        <StatRow label="Read speed gain (max)" tone="var(--success)">{fmt(result.read)}x</StatRow>
        <StatRow label="Write speed gain (max)" tone="var(--success)">{fmt(result.write)}x</StatRow>
        <StatRow label={faultInfo.label} tone={result.fault === 0 ? "var(--error)" : "var(--warning)"}>
          {result.fault}{faultUnit ? ` ${faultUnit}` : ""}
        </StatRow>
      </StatList>
      <p style={{ ...muted, fontSize: 12.5, marginTop: 6 }}>{faultInfo.help}</p>
      {result.totalCost !== null && (
        <>
          <h3 style={groupHead}>Cost</h3>
          <StatList>
            <StatRow label="Cost per usable TB" tone="var(--accent)">{money(result.costPerTb)} {currency}/TB</StatRow>
            <StatRow label="Total disk cost">{money(result.totalCost)} {currency}</StatRow>
          </StatList>
        </>
      )}
      <p style={{ ...muted, fontSize: 12.5, marginTop: 10 }}>
        Speed gains are theoretical maximums relative to a single disk. The cost counts the disks only, not any RAID controller.
      </p>
    </>
  );
}

export default function RaidCalculatorTool() {
  const [s, setS] = useState(EMPTY);
  const [result, setResult] = useState(null); // no result until Calculate
  const req = useRequiredFields();
  const lv = levelOf(s.level);

  const run = (state) => {
    const l = levelOf(state.level);
    // The usable capacity is a result only (it has no input box), so the disk size is always required.
    const input = {
      level: state.level, size: state.size, sizeUnit: state.sizeUnit, target: "", targetUnit: "TB", source: "size",
      disks: state.disks[l.disks], sets: l.sets ? state.sets[l.disks] : "", cost: state.cost,
    };
    const r = calculateRaid(input);
    if (r.missing) { req.flag(r.missing); return null; }
    req.flag([]);
    return r.errors ? r : { ...r, currency: state.currency };
  };
  const update = (patch) => setS((prev) => ({ ...prev, ...patch })); // the result updates on Calculate only
  const setBox = (key) => (_, text) => update({ [key]: text });
  const setUnit = (key) => (unit) => {
    const x = Number(String(s[key]).replace(/,/g, ""));
    const f = (u) => DATA_UNITS.find((d) => d.value === u).factor;
    const text = String(s[key]).trim() !== "" && Number.isFinite(x) ? fmt((x * f(s[`${key}Unit`])) / f(unit)) : s[key];
    update({ [`${key}Unit`]: unit, [key]: text });
  };
  const setOutUnit = (k, unit) => setS((p) => ({ ...p, outUnits: { ...p.outUnits, [k]: unit } }));
  const calculate = () => setResult(run(s));
  const clear = () => { setS(EMPTY()); setResult(null); req.clear(); };
  const note = diskNote(s.level, s.disks[lv.disks]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ ...para, margin: 0 }}>
        Compare RAID levels by usable capacity, read and write speed gains, fault tolerance and cost per usable terabyte — RAID 0, 1, 1E, 10, 5,
        50, 5E, 5EE, 6 and 60.
      </p>

      <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 340px", minWidth: 260, maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>
          <section className="card" style={{ padding: 18 }} aria-label="RAID type and disks">
            <h3 style={cardTitle}>RAID type and disks</h3>
            <RaidDiagram level={s.level} />
            <label style={fieldWrap}>
              <FieldLabel>RAID level</FieldLabel>
              <SelectField value={s.level} onChange={(v) => update({ level: v })} options={LEVEL_OPTIONS} />
            </label>
            <label style={fieldWrap}>
              <FieldLabel>Disk size (single)</FieldLabel>
              <Req name="size" flagged={req.flagged}>
                <UnitMeasureField
                  label="Disk size (single)" units={DATA_UNITS} unit={s.sizeUnit} onUnitChange={setUnit("size")}
                  values={[s.size]} onChange={setBox("size")}
                />
              </Req>
            </label>
            <label style={fieldWrap}>
              <FieldLabel>Number of disks</FieldLabel>
              <Req name="disks" flagged={req.flagged}>
                <SuffixField value={s.disks[lv.disks]} unit="disks" onChange={(v) => update({ disks: { ...s.disks, [lv.disks]: v } })} />
              </Req>
            </label>
            {note && <p style={notice}>{note}</p>}
            {lv.sets && (
              <label style={fieldWrap}>
                <FieldLabel>Number of RAID {s.level === "50" ? 5 : 6} sub-arrays</FieldLabel>
                <Req name="sets" flagged={req.flagged}>
                  <SuffixField value={s.sets[lv.disks]} onChange={(v) => update({ sets: { ...s.sets, [lv.disks]: v } })} />
                </Req>
              </label>
            )}
            <p style={{ ...muted, fontSize: 12.5 }}>All disks are assumed to be the same size; with mixed sizes, enter the smallest.</p>
          </section>

          <section className="card" style={{ padding: 18 }} aria-label="Cost">
            <h3 style={cardTitle}>Cost <span style={{ fontWeight: 500, fontSize: 12.5, color: "var(--text-muted)" }}>(optional)</span></h3>
            <label style={fieldWrap}>
              <FieldLabel>Disk cost</FieldLabel>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <TextField value={s.cost} onChange={(v) => update({ cost: v })} style={{ flex: 1, minWidth: 0 }} />
                <SelectField value={s.currency} onChange={(v) => setS((p) => ({ ...p, currency: v }))} options={CURRENCY_OPTIONS} style={small} />
                <span style={suffix}>/disk</span>
              </div>
            </label>
            <p style={{ ...muted, fontSize: 12.5 }}>
              Gives the cost per usable TB and the total disk cost. To convert between currencies, use the{" "}
              <Link to="/calculators/financial/currency-calculator" style={{ color: "var(--accent)" }}>currency calculator</Link>.
            </p>
          </section>
          <ButtonRow onCalculate={calculate} onClear={clear} />
        </div>

        <div className="card" style={{ flex: "1 1 400px", minWidth: 0, padding: 0, overflow: "hidden", position: "sticky", top: 80 }}>
          <div style={resultBanner}>Result</div>
          <div style={{ padding: "14px 16px" }} aria-live="polite">
            <ResultBody result={result} s={s} setOutUnit={setOutUnit} />
          </div>
        </div>
      </div>
    </div>
  );
}
