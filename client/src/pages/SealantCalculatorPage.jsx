import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SealantCalculatorTool from "../components/tools/sealant-calculator/SealantCalculatorTool";
import SealantCalculatorFaqSection from "../components/tools/sealant-calculator/SealantCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SealantCalculatorPage() {
  const tool = getToolById("sealant-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sealant Calculator | Free Online Sealant Quantity Tool"
      seoDescription="Calculate exactly how much sealant you need from joint length, width, and depth. Get cartridge counts and cost estimates instantly, free."
      footer={<SealantCalculatorFaqSection />}
    >
      <SealantCalculatorTool />
    </ToolPageWrapper>
  );
}
