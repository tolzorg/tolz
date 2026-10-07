import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VatCalculatorTool from "../components/tools/vat-calculator/VatCalculatorTool";
import VatCalculatorFaqSection from "../components/tools/vat-calculator/VatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VatCalculatorPage() {
  const tool = getToolById("vat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="VAT Calculator - Add or Remove VAT, Net & Gross Price"
      seoDescription="Calculate VAT from any two of the VAT rate, net price, gross price, and tax amount: add VAT to a price, remove it from a gross price, or find the rate. Free, no signup."
      footer={<VatCalculatorFaqSection />}
      wide
    >
      <VatCalculatorTool />
    </ToolPageWrapper>
  );
}
