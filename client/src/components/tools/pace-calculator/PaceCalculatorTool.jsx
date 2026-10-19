import PaceSection from "./PaceSection";
import MultipointSection from "./MultipointSection";
import { ConverterSection, FinishTimeSection } from "./ConverterFinishSections";
import { SectionHeading } from "./PaceParts";

// The reference page holds four calculators: pace / time / distance, multipoint
// splits, a pace unit converter and a finish-time estimate.
export default function PaceCalculatorTool() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
          Use the following calculator to estimate the pace for a variety of activities, including running, walking, and biking. The
          calculator can also be used to estimate the time taken or distance traveled with a given pace and time or distance.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", textDecoration: "underline", padding: 0 }}
        >
          Print
        </button>
      </div>
      <PaceSection />

      <SectionHeading id="multipoint" title="Multipoint Pace Calculator">
        The following calculator can determine the pace of segments of a run (or other activity) for those with access to the time at
        intermittent points during the run. For example, if a person runs from point A to point B, then to point C, records the time at each
        point, and subsequently determines the distance between those points (using many available websites, applications, or maps), the
        multipoint calculator can determine how fast the person traveled between each pair of points, allowing use for training purposes; a
        person can run the same route (or distance) repeatedly and track pace over that given route, enabling comparison of times between
        each segment (or lap) to identify areas for potential improvement.
      </SectionHeading>
      <MultipointSection />

      <SectionHeading id="paceconverter" title="Pace Converter" />
      <ConverterSection />

      <SectionHeading id="finishtime" title="Finish Time Calculator">
        The following calculator can be used to estimate a person's finish time based on the time and distance covered in a race at the
        point the calculator is used.
      </SectionHeading>
      <FinishTimeSection />
    </div>
  );
}
