import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CommissionCalculatorTool from "../components/tools/commission-calculator/CommissionCalculatorTool";
import CommissionCalculatorFaqSection from "../components/tools/commission-calculator/CommissionCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CommissionCalculatorPage() {
  const tool = getToolById("commission-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Commission Calculator - Simple & Tiered Sales Commission"
      seoDescription="Calculate a sales commission, sales price or commission rate from the other two, or work out tiered commissions with an optional base amount. Free, no signup."
      footer={<CommissionCalculatorFaqSection />}
      wide
    >
      <CommissionCalculatorTool />
    </ToolPageWrapper>
  );
}
