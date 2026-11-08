import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import MarginCalculatorTool from "../components/tools/margin-calculator/MarginCalculatorTool";
import MarginCalculatorFaqSection from "../components/tools/margin-calculator/MarginCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function MarginCalculatorPage() {
  const tool = getToolById("margin-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Margin Calculator – Profit Margin & Markup (Free Online)"
      seoDescription="Free margin calculator to find profit margin, markup, cost, revenue and profit from any two values. Also calculates margin required for stocks and forex."
      footer={<MarginCalculatorFaqSection />}
      wide
    >
      <MarginCalculatorTool />
    </ToolPageWrapper>
  );
}
