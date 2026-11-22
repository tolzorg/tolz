import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PalletCalculatorTool from "../components/tools/pallet-calculator/PalletCalculatorTool";
import PalletCalculatorFaqSection from "../components/tools/pallet-calculator/PalletCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PalletCalculatorPage() {
  const tool = getToolById("pallet-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Pallet Calculator - Boxes Per Pallet & Layers"
      seoDescription="Use our free pallet calculator to find how many boxes fit on a standard or custom pallet, plus layers, utilization, and weight limits. No signup needed."
      footer={<PalletCalculatorFaqSection />}
      wide
    >
      <PalletCalculatorTool />
    </ToolPageWrapper>
  );
}
