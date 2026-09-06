import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InterestCalculatorTool from "../components/tools/interest-calculator/InterestCalculatorTool";
import InterestCalculatorFaqSection from "../components/tools/interest-calculator/InterestCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InterestCalculatorPage() {
  const tool = getToolById("interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Compound Interest Calculator - Free"
      seoDescription="Calculate compound interest on a lump sum plus monthly or annual contributions. Adjust for taxes and inflation. Free, no signup, instant results."
      footer={<InterestCalculatorFaqSection />}
      wide
    >
      <InterestCalculatorTool />
    </ToolPageWrapper>
  );
}
