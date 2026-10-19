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
import { rowStyle, labelStyle, srOnly } from "./paceStyles";
import {
  calculatePace, parseTime, PACE_DEFAULTS, DISTANCE_UNITS, PACE_UNITS, EVENTS, isTimeUnit,
} from "../../../utils/paceCalculatorEngine";

const MODES = [["pace", "Pace"], ["time", "Time"], ["distance", "Distance"]];
const D = PACE_DEFAULTS;
const DISTANCE_OPTIONS = DISTANCE_UNITS.map((u) => ({ value: u, label: u }));
const PACE_OPTIONS = PACE_UNITS.map((u) => ({ value: u.value, label: u.label }));
const EVENT_OPTIONS = [{ value: "", label: "-- Or pick an event --" }, ...EVENTS.map(([value, label]) => ({ value, label }))];
const cell = { padding: "4px 10px", fontSize: 13, whiteSpace: "nowrap" };
const PACE_ROW_LABELS = {
  "per kilometer": "Per kilometer", "miles/hour": "Miles per hour", "kilometers/hour": "Kilometers per hour",
  "meters/minute": "Meters per minute", "meters/second": "Meters per second",
};

// The examples (50:25 over 5 km, 8:10 per mile), in seconds for the time boxes.
const TIME_EXAMPLE = parseTime(D.time);
const PACE_EXAMPLE = parseTime(D.pace);

/** Engine input: time boxes become seconds. The example goes in only for the fields named in
 * `fill` (used to work out which empty fields are required); a shown result uses typed values only. */
const engineInput = (v, fill = new Set()) => ({
  ...v,
  time: fill.has("time") ? String(TIME_EXAMPLE) : timeToEngine(v.timeUnit, v.time),
  distance: fill.has("distance") ? D.distance : v.distance,
  pace: isTimeUnit(v.paceUnit)
    ? (fill.has("pace") ? String(PACE_EXAMPLE) : timeToEngine(v.paceTimeUnit, v.paceTime))
    : (fill.has("pace") ? "10" : v.pace),
});

function SplitTable({ rows }) {
  return (
    <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", color: "var(--text-primary)" }}>
      <tbody>{rows.map(([label, time]) => <tr key={label}><td style={cell}>{label}</td><td style={{ ...cell, textAlign: "right" }}>{time}</td></tr>)}</tbody>
    </table>
  );
}

function PaceResult({ result: r }) {
  let summary;
  let rows;
  if (r.mode === "pace") {
    summary = <HighlightSummary label="Your pace" value={<SummaryText>{r.paces[0][0]}</SummaryText>} unit={r.paces[0][1]} color="#008137" />;
    rows = r.paces.slice(1).map(([v, u]) => <StatRow key={u} label={PACE_ROW_LABELS[u]}>{v} {u}</StatRow>);
  } else if (r.mode === "time") {
    summary = <HighlightSummary label="Time required" value={<SummaryText>{r.time}</SummaryText>} color="#008137" note="With the given distance and pace" />;
  } else {
    summary = <HighlightSummary label="Distance traveled" value={r.distances[0][0]} unit={r.distances[0][1]} color="#008137" note="With the given time and pace" />;
    rows = r.distances.slice(1).map(([v, u]) => <StatRow key={u} label={u}>{v} {u}</StatRow>);
  }
  return (
    <>
      {summary}
      {rows && <StatList>{rows}</StatList>}
      <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "16px 0 8px" }}>At this pace, the times required for popular race distances are:</p>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table data-table--framed" style={{ borderCollapse: "collapse", color: "var(--text-primary)" }}>
          <tbody>
            {r.races.map(([a, at, b, bt]) => (
              <tr key={a}>
                <td style={cell}>{a}</td><td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{at}</td>
                <td style={cell}>{b}</td><td style={{ ...cell, textAlign: "right", fontWeight: 600 }}>{bt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.splits && (
        <>
          <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)", margin: "16px 0 8px" }}>Splits:</p>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start", flexWrap: "wrap", maxHeight: 360, overflowY: "auto" }}>
            {r.splits.km.length > 0 && <SplitTable rows={r.splits.km} />}
            {r.splits.miles.length > 0 && <SplitTable rows={r.splits.miles} />}
          </div>
        </>
      )}
    </>
  );
}

export default function PaceSection() {
  const [mode, setMode] = useState("pace");
  const [v, setV] = useState({
    time: blankTime("hms"), timeUnit: "hms", distance: "", distanceUnit: D.distanceUnit,
    pace: "", paceTime: blankTime("min-sec"), paceTimeUnit: "min-sec", paceUnit: D.paceUnit, event: "",
  });
  const [result, setResult] = useState(null); // no result until Calculate
  const set = (key) => (value) => setV((prev) => ({ ...prev, [key]: value }));

  const req = useRequiredFields();
  const calculate = (m = mode) => setResult(req.evaluate(
    { time: v.time, distance: v.distance, pace: isTimeUnit(v.paceUnit) ? v.paceTime : v.pace },
    (fill) => calculatePace({ mode: m, ...engineInput(v, fill) }),
  ));
  const clear = () => {
    setV((prev) => ({ ...prev, time: blankTime(prev.timeUnit), distance: "", pace: "", paceTime: blankTime(prev.paceTimeUnit), event: "" }));
    req.clear();
    setResult(null);
  };
  // A time box edit, and a time-unit switch that converts what is already typed.
  const setTimePart = (key) => (i, text) => setV((prev) => ({ ...prev, [key]: prev[key].map((x, j) => (j === i ? text : x)) }));
  const changeTimeUnit = (key, unitKey) => (unit) => setV((prev) => {
    const secs = timeToSeconds(prev[unitKey], prev[key]);
    return { ...prev, [unitKey]: unit, [key]: Number.isNaN(secs) ? blankTime(unit) : secondsToTime(unit, secs) };
  });
  // Like the reference, switching tabs recalculates with that tab's fields (once there is a result).
  const pickMode = (m) => { setMode(m); if (result) calculate(m); else setResult(null); };
  const pickEvent = (value) => {
    const ev = EVENTS.find(([key]) => key === value);
    setV((prev) => (ev ? { ...prev, event: value, distance: ev[2], distanceUnit: ev[3] } : { ...prev, event: value }));
  };

  const timeRow = (
    <div style={rowStyle}>
      <span style={labelStyle}>Time</span>
      <div style={timeFieldStyle}>
        <Req name="time"><UnitMeasureField
          label="Time" units={TIME_UNITS} unit={v.timeUnit} onUnitChange={changeTimeUnit("time", "timeUnit")}
          values={v.time} placeholders={secondsToTime(v.timeUnit, TIME_EXAMPLE)} onChange={setTimePart("time")}
        /></Req>
      </div>
    </div>
  );
  const distanceRow = (
    <div style={rowStyle}>
      <span style={labelStyle}>Distance</span>
      <label style={{ flex: "0 1 90px", minWidth: 70 }}><span style={srOnly}>Distance</span><Req name="distance"><TextField value={v.distance} onChange={(t) => { set("distance")(t); set("event")(""); }} placeholder={D.distance} /></Req></label>
      <label style={{ flex: "0 1 120px", minWidth: 110 }}><span style={srOnly}>Distance unit</span><SelectField value={v.distanceUnit} onChange={set("distanceUnit")} options={DISTANCE_OPTIONS} /></label>
      <label style={{ flex: "1 1 170px", minWidth: 160 }}><span style={srOnly}>Pick an event</span><SelectField value={v.event} onChange={pickEvent} options={EVENT_OPTIONS} /></label>
    </div>
  );
  const paceRow = (
    <div style={rowStyle}>
      <span style={labelStyle}>Pace</span>
      {isTimeUnit(v.paceUnit) ? (
        <div style={timeFieldStyle}>
          <Req name="pace"><UnitMeasureField
            label="Pace" units={TIME_UNITS} unit={v.paceTimeUnit} onUnitChange={changeTimeUnit("paceTime", "paceTimeUnit")}
            values={v.paceTime} placeholders={secondsToTime(v.paceTimeUnit, PACE_EXAMPLE)} onChange={setTimePart("paceTime")}
          /></Req>
        </div>
      ) : (
        <label style={{ flex: "1 1 120px", minWidth: 100 }}><span style={srOnly}>Pace</span><Req name="pace"><TextField value={v.pace} onChange={set("pace")} /></Req></label>
      )}
      <label style={{ flex: "1 1 100%", minWidth: 150, paddingLeft: 82 }}><span style={srOnly}>Pace unit</span><SelectField value={v.paceUnit} onChange={set("paceUnit")} options={PACE_OPTIONS} /></label>
    </div>
  );

  const form = (
    <>
      <div style={{ display: "flex", marginBottom: -1 }}>
        {MODES.map(([key, label], i) => (
          <button
            key={key}
            type="button"
            aria-pressed={mode === key}
            onClick={() => pickMode(key)}
            style={{
              flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-display)",
              cursor: "pointer", border: "1px solid var(--border)",
              borderBottom: mode === key ? "1px solid var(--accent)" : "1px solid var(--border)",
              borderTopLeftRadius: i === 0 ? "var(--radius-md)" : 0,
              borderTopRightRadius: i === MODES.length - 1 ? "var(--radius-md)" : 0,
              background: mode === key ? "var(--accent)" : "var(--bg-white)",
              color: mode === key ? "#fff" : "var(--text-primary)",
              position: "relative", zIndex: mode === key ? 1 : 0,
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 18, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        {mode === "pace" && <>{timeRow}{distanceRow}</>}
        {mode === "time" && <>{distanceRow}{paceRow}</>}
        {mode === "distance" && <>{timeRow}{paceRow}</>}
        <div style={{ marginTop: 6 }}><ButtonRow onCalculate={() => calculate()} onClear={clear} /></div>
      </div>
    </>
  );

  return (
    <RequiredProvider flagged={req.flagged}>
      <SectionLayout form={form} formWidth={460} result={<ResultOrErrors result={result}><PaceResult result={result} /></ResultOrErrors>} />
    </RequiredProvider>
  );
}
