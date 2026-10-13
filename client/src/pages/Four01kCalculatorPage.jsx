import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import Four01kCalculatorTool from "../components/tools/401k-calculator/Four01kCalculatorTool";
import Four01kCalculatorFaqSection from "../components/tools/401k-calculator/Four01kCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function Four01kCalculatorPage() {
  const tool = getToolById("401k-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free 401k Calculator - Estimate Balance & Match"
      seoDescription="Free 401k calculator to estimate your balance at retirement, plan withdrawals, see early withdrawal costs, and find the contribution that maxes your match."
      footer={<Four01kCalculatorFaqSection />}
      wide
    >
      <Four01kCalculatorTool />
    </ToolPageWrapper>
  );
}
