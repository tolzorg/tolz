import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CurrencyCalculatorTool from "../components/tools/currency-calculator/CurrencyCalculatorTool";
import CurrencyCalculatorFaqSection from "../components/tools/currency-calculator/CurrencyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CurrencyCalculatorPage() {
  const tool = getToolById("currency-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Currency Calculator - Live & Custom Exchange Rates"
      seoDescription="Convert currencies instantly with live market rates or set your own custom rate. Free, no signup currency calculator with accurate, real-time results."
      footer={<CurrencyCalculatorFaqSection />}
      wide
    >
      <CurrencyCalculatorTool />
    </ToolPageWrapper>
  );
}
