import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CompoundInterestCalculatorTool from "../components/tools/compound-interest-calculator/CompoundInterestCalculatorTool";
import CompoundInterestFaqSection from "../components/tools/compound-interest-calculator/CompoundInterestFaqSection";
import { getToolById } from "../utils/tools";

export default function CompoundInterestCalculatorPage() {
  const tool = getToolById("compound-interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Compound Interest Calculator - Free APR to APY Rate Converter"
      seoDescription="Convert or compare an interest rate between different compounding frequencies, annually, monthly, daily, continuously, and more. Free and instant."
      footer={<CompoundInterestFaqSection />}
      wide
    >
      <CompoundInterestCalculatorTool />
    </ToolPageWrapper>
  );
}
