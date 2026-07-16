import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RebarCalculatorTool from "../components/tools/rebar-calculator/RebarCalculatorTool";
import RebarCalculatorFaqSection from "../components/tools/rebar-calculator/RebarCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RebarCalculatorPage() {
  const tool = getToolById("rebar-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Rebar Calculator | Weight, Length & Cost Estimator"
      seoDescription="Calculate rebar weight, length, and material cost for slabs, footings, walls, and columns. Free rebar calculator with US and metric bar sizes."
      footer={<RebarCalculatorFaqSection />}
    >
      <RebarCalculatorTool />
    </ToolPageWrapper>
  );
}
