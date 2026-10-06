import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SimpleInterestCalculatorTool from "../components/tools/simple-interest-calculator/SimpleInterestCalculatorTool";
import SimpleInterestCalculatorFaqSection from "../components/tools/simple-interest-calculator/SimpleInterestCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SimpleInterestCalculatorPage() {
  const tool = getToolById("simple-interest-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Simple Interest Calculator - Interest, Principal, Term & Rate"
      seoDescription="Calculate simple interest and end balance with I = Prt, or solve for the principal, term, or rate. Shows calculation steps, a growth chart, and a full schedule. Free, no signup."
      footer={<SimpleInterestCalculatorFaqSection />}
      wide
    >
      <SimpleInterestCalculatorTool />
    </ToolPageWrapper>
  );
}
