import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CurrencyCalculatorTool from "../components/tools/currency-calculator/CurrencyCalculatorTool";
import CurrencyCalculatorFaqSection from "../components/tools/currency-calculator/CurrencyCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CurrencyCalculatorPage() {
  const tool = getToolById("currency-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Currency Calculator – Live Exchange Rate Converter"
      seoDescription="Convert between currencies using a live market exchange rate, or plug in your own custom rate for a quick offline conversion. Free, no signup."
      footer={<CurrencyCalculatorFaqSection />}
      wide
    >
      <CurrencyCalculatorTool />
    </ToolPageWrapper>
  );
}
