import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VatCalculatorTool from "../components/tools/vat-calculator/VatCalculatorTool";
import VatCalculatorFaqSection from "../components/tools/vat-calculator/VatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VatCalculatorPage() {
  const tool = getToolById("vat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="VAT Calculator – Add or Remove VAT Online (Free)"
      seoDescription="Free VAT calculator to add VAT, remove VAT from a gross price, or find the VAT rate. Enter any two values and get net, gross and tax amount instantly."
      footer={<VatCalculatorFaqSection />}
      wide
    >
      <VatCalculatorTool />
    </ToolPageWrapper>
  );
}
