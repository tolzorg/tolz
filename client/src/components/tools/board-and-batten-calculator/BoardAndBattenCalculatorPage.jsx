import BoardAndBattenCalculatorTool from "./BoardAndBattenCalculatorTool";
import SEO from "../../SEO";

export default function BoardAndBattenCalculatorPage() {
  return (
    <>
      <SEO
        title="Board and Batten Calculator — Siding Material Estimator"
        description="Calculate board and batten siding material quantities. Supports multiple walls, openings, 7 board profiles, lumber database, layout engine, trim, fasteners, and paint estimators."
        canonicalUrl="https://www.tolz.org/calculators/construction/board-and-batten"
      />
      <div style={{ paddingTop: 24, paddingBottom: 40 }}>
        <div className="container" style={{ maxWidth: 860, margin: "0 auto", padding: "0 16px 20px" }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(22px, 4vw, 32px)", color: "var(--text-primary)", margin: "0 0 6px" }}>
            Board and Batten Calculator
          </h1>
          <p style={{ fontFamily: "var(--font-display)", fontSize: 14, color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
            Estimate boards, battens, trim, fasteners, and paint for exterior or interior board-and-batten siding.
            Supports multiple walls, openings, 7 board profiles, and full North American lumber sizing.
          </p>
        </div>
        <BoardAndBattenCalculatorTool />
      </div>
    </>
  );
}
