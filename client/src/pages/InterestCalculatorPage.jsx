import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InterestCalculatorTool from "../components/tools/interest-calculator/InterestCalculatorTool";
import InterestCalculatorFaqSection from "../components/tools/interest-calculator/InterestCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InterestCalculatorPage() {
  const tool = getToolById("interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Interest Calculator – Compound Interest, Contributions & Inflation"
      seoDescription="Calculate compound interest growth on a lump-sum investment plus annual and monthly contributions, with any compounding frequency, tax rate, and inflation adjustment. Free, no signup."
      footer={<InterestCalculatorFaqSection />}
      wide
    >
      <InterestCalculatorTool />
    </ToolPageWrapper>
  );
}
