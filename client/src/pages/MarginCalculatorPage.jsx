import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MarginCalculatorTool from "../components/tools/margin-calculator/MarginCalculatorTool";
import MarginCalculatorFaqSection from "../components/tools/margin-calculator/MarginCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MarginCalculatorPage() {
  const tool = getToolById("margin-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Margin Calculator - Profit Margin, Markup, Stock & Forex Margin"
      seoDescription="Calculate profit margin and markup from any two of cost, revenue, margin, and profit, plus the amount required to buy stocks or currency on margin. Free, no signup."
      footer={<MarginCalculatorFaqSection />}
      wide
    >
      <MarginCalculatorTool />
    </ToolPageWrapper>
  );
}
