import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CompoundInterestCalculatorTool from "../components/tools/compound-interest-calculator/CompoundInterestCalculatorTool";
import CompoundInterestFaqSection from "../components/tools/compound-interest-calculator/CompoundInterestFaqSection";
import { getToolById } from "../utils/tools";

export default function CompoundInterestCalculatorPage() {
  const tool = getToolById("compound-interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Compound Interest Calculator – Compare Compounding Rates"
      seoDescription="Free compound interest calculator to compare and convert rates across annual, monthly, daily, and continuous compounding. Instant results, no signup needed."
      footer={<CompoundInterestFaqSection />}
      wide
    >
      <CompoundInterestCalculatorTool />
    </ToolPageWrapper>
  );
}
