import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CommissionCalculatorTool from "../components/tools/commission-calculator/CommissionCalculatorTool";
import CommissionCalculatorFaqSection from "../components/tools/commission-calculator/CommissionCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CommissionCalculatorPage() {
  const tool = getToolById("commission-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Commission Calculator - Free Sales & Tiered Commission Tool"
      seoDescription="Use this free commission calculator to find commission, sales price, or rate in seconds. Handles tiered commissions with an optional base amount."
      footer={<CommissionCalculatorFaqSection />}
      wide
    >
      <CommissionCalculatorTool />
    </ToolPageWrapper>
  );
}
