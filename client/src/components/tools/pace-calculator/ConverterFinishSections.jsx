import { useState } from "react";
import { TextField, SelectField } from "../loan-calculator/LoanFormControls";
import { ButtonRow } from "../fha-loan-calculator/MortgageResultParts";
import { HighlightSummary, StatRow, StatList } from "../calculator-ui/ResultHighlight";
import UnitMeasureField from "../calculator-ui/UnitMeasureField";
import { useRequiredFields } from "../calculator-ui/requiredFields";
import { RequiredProvider, Req } from "../calculator-ui/Required";
import { TIME_UNITS, blankTime, timeToEngine, secondsToTime, timeToSeconds } from "./timeUnits";

// Time boxes need room: on narrow screens they drop onto their own full-width line.
const timeFieldStyle = { flex: "1 1 250px", minWidth: 0, display: "flex" };
import { SectionLayout, ResultOrErrors, SummaryText } from "./PaceParts";
import { rowStyle, srOnly } from "./paceStyles";
import {
  convertPace, calculateFinishTime, parseTime, CONVERTER_DEFAULTS, FINISH_DEFAULTS, DISTANCE_UNITS, PACE_UNITS, isTimeUnit,
} from "../../../utils/paceCalculatorEngine";

const DISTANCE_OPTIONS = DISTANCE_UNITS.map((u) => ({ value: u, label: u }));
const PACE_OPTIONS = PACE_UNITS.map((u) => ({ value: u.value, label: u.label }));
const finishLabel = { flex: "0 0 150px", fontSize: 13.5, color: "var(--text-primary)" };

/** Time boxes with a unit dropdown; switching the unit converts what is typed. */
function useTimeBoxes(defaultUnit) {
  const [unit, setUnit] = useState(defaultUnit);
  const [values, setValues] = useState(blankTime(defaultUnit));
  const changeUnit = (next) => {
    const secs = timeToSeconds(unit, values);
    setUnit(next);
    setValues(Number.isNaN(secs) ? blankTime(next) : secondsToTime(next, secs));
  };
  const setPart = (i, text) => setValues((prev) => prev.map((x, j) => (j === i ? text : x)));
  const clear = () => setValues(blankTime(unit));
  return { unit, values, changeUnit, setPart, clear };
}

export function ConverterSection() {
  const C = CONVERTER_DEFAULTS;
  const EXAMPLE = parseTime(C.value); // 5:30
  const [v, setV] = useState({ value: "", from: C.from, to: C.to });
  const time = useTimeBoxes("min-sec");
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const timeFrom = isTimeUnit(v.from);
  // A per-mile / per-km pace uses the time boxes; a speed is a plain number. Examples go in
  // only while working out whether the empty box is required.
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { value: timeFrom ? time.values : v.value },
    (fill) => convertPace({
      ...v,
      value: timeFrom
        ? (fill.has("value") ? String(EXAMPLE) : timeToEngine(time.unit, time.values))
        : (fill.has("value") ? "10" : v.value),
    }),
  ));
  const clear = () => { setV((prev) => ({ ...prev, value: "" })); time.clear(); req.clear(); setResult(null); };

  const form = (
    <div className="card" style={{ padding: 16 }}>
      <div style={rowStyle}>
        {timeFrom ? (
          <div style={timeFieldStyle}>
            <Req name="value"><UnitMeasureField
              label="Pace to convert" units={TIME_UNITS} unit={time.unit} onUnitChange={time.changeUnit}
              values={time.values} placeholders={secondsToTime(time.unit, EXAMPLE)} onChange={time.setPart}
            /></Req>
          </div>
        ) : (
          <label style={{ flex: "1 1 120px", minWidth: 90 }}><span style={srOnly}>Pace to convert</span><Req name="value"><TextField value={v.value} onChange={set("value")} /></Req></label>
        )}
      </div>
      <div style={rowStyle}>
        <label style={{ flex: "1 1 160px", minWidth: 150 }}><span style={srOnly}>From unit</span><SelectField value={v.from} onChange={set("from")} options={PACE_OPTIONS} /></label>
        <strong style={{ color: "var(--text-primary)" }}>= ?</strong>
        <label style={{ flex: "1 1 160px", minWidth: 150 }}><span style={srOnly}>To unit</span><SelectField value={v.to} onChange={set("to")} options={PACE_OPTIONS} /></label>
      </div>
      <ButtonRow onCalculate={calculate} onClear={clear} />
    </div>
  );
  const body = result && !result.errors && (
    <HighlightSummary label="Converted pace" value={<SummaryText>{result.to}</SummaryText>} color="#008137" note={`= ${result.from}`} />
  );
  return (
    <RequiredProvider flagged={req.flagged}>
      <SectionLayout form={form} formWidth={480} result={<ResultOrErrors result={result}>{body}</ResultOrErrors>} />
    </RequiredProvider>
  );
}

export function FinishTimeSection() {
  const F = FINISH_DEFAULTS;
  const EXAMPLE = parseTime(F.time); // 6:15
  const [v, setV] = useState({ distanceNow: "", nowUnit: F.nowUnit, distanceFull: "", fullUnit: F.fullUnit });
  const time = useTimeBoxes("hms");
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));
  const req = useRequiredFields();
  const calculate = () => setResult(req.evaluate(
    { distanceNow: v.distanceNow, time: time.values, distanceFull: v.distanceFull },
    (fill) => calculateFinishTime({
      ...v,
      distanceNow: fill.has("distanceNow") ? F.distanceNow : v.distanceNow,
      time: fill.has("time") ? String(EXAMPLE) : timeToEngine(time.unit, time.values),
      distanceFull: fill.has("distanceFull") ? F.distanceFull : v.distanceFull,
    }),
  ));
  const clear = () => { setV((prev) => ({ ...prev, distanceNow: "", distanceFull: "" })); time.clear(); req.clear(); setResult(null); };

  const distance = (label, key, unitKey, placeholder) => (
    <div style={rowStyle}>
      <span style={finishLabel}>{label}</span>
      <label style={{ flex: "0 1 90px", minWidth: 70 }}><span style={srOnly}>{label}</span><Req name={key}><TextField value={v[key]} onChange={set(key)} placeholder={placeholder} /></Req></label>
      <label style={{ flex: "0 1 130px", minWidth: 115 }}><span style={srOnly}>{`${label} unit`}</span><SelectField value={v[unitKey]} onChange={set(unitKey)} options={DISTANCE_OPTIONS} /></label>
    </div>
  );
  const form = (
    <div className="card" style={{ padding: 16 }}>
      {distance("Current Distance Traveled", "distanceNow", "nowUnit", F.distanceNow)}
      <div style={rowStyle}>
        <span style={finishLabel}>Elapsed Time</span>
        <div style={timeFieldStyle}>
          <Req name="time"><UnitMeasureField
            label="Elapsed time" units={TIME_UNITS} unit={time.unit} onUnitChange={time.changeUnit}
            values={time.values} placeholders={secondsToTime(time.unit, EXAMPLE)} onChange={time.setPart}
          /></Req>
        </div>
      </div>
      {distance("Full Distance", "distanceFull", "fullUnit", F.distanceFull)}
      <ButtonRow onCalculate={calculate} onClear={clear} />
    </div>
  );
  const body = result && !result.errors && (
    <>
      <HighlightSummary label="Time to finish" value={<SummaryText>{result.finish}</SummaryText>} color="#008137" note={`At current pace, to finish ${result.distance}`} />
      <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "14px 0 0" }}>Your pace so far:</p>
      <StatList>
        {result.paces.map((p) => {
          const m = p.match(/^(.*) (Per Mile|Per Kilometer|Miles Per Hour|Kilometers Per Hour|Meters Per Minute|Meters Per Second|Yards Per Minute|Yards Per Second)$/);
          return <StatRow key={p} label={m[2]}>{m[1]}</StatRow>;
        })}
      </StatList>
    </>
  );
  return (
    <RequiredProvider flagged={req.flagged}>
      <SectionLayout form={form} formWidth={460} result={<ResultOrErrors result={result}>{body}</ResultOrErrors>} />
    </RequiredProvider>
  );
}
