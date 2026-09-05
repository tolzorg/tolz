import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import InvestmentCalculatorTool from "../components/tools/investment-calculator/InvestmentCalculatorTool";
import InvestmentCalculatorFaqSection from "../components/tools/investment-calculator/InvestmentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function InvestmentCalculatorPage() {
  const tool = getToolById("investment-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Investment Calculator – End Amount, Return Rate & More"
      seoDescription="Project how an investment will grow, or solve backward from a target for the contribution, return rate, starting amount, or time needed to reach it. Free, no signup."
      footer={<InvestmentCalculatorFaqSection />}
      wide
    >
      <InvestmentCalculatorTool />
    </ToolPageWrapper>
  );
}
