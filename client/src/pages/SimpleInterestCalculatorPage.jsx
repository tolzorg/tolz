import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SimpleInterestCalculatorTool from "../components/tools/simple-interest-calculator/SimpleInterestCalculatorTool";
import SimpleInterestCalculatorFaqSection from "../components/tools/simple-interest-calculator/SimpleInterestCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SimpleInterestCalculatorPage() {
  const tool = getToolById("simple-interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Simple Interest Calculator: Free, With Steps"
      seoDescription="Free simple interest calculator. Find interest, end balance, principal, rate or time with steps, a growth chart and full schedule. No signup needed."
      footer={<SimpleInterestCalculatorFaqSection />}
      wide
    >
      <SimpleInterestCalculatorTool />
    </ToolPageWrapper>
  );
}
