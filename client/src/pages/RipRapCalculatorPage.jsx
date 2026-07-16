import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RipRapCalculatorTool from "../components/tools/rip-rap-calculator/RipRapCalculatorTool";
import RipRapCalculatorFaqSection from "../components/tools/rip-rap-calculator/RipRapCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RipRapCalculatorPage() {
  const tool = getToolById("rip-rap-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rip Rap Calculator | Free D50 Size & Cost Estimator"
      seoDescription="Calculate rip rap D50 size with the Isbash equation, plus volume, weight, and cost. Free, fast, no signup. Supports metric and imperial units."
      footer={<RipRapCalculatorFaqSection />}
    >
      <RipRapCalculatorTool />
    </ToolPageWrapper>
  );
}
