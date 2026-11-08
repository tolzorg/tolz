import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PalletCalculatorTool from "../components/tools/pallet-calculator/PalletCalculatorTool";
import PalletCalculatorFaqSection from "../components/tools/pallet-calculator/PalletCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PalletCalculatorPage() {
  const tool = getToolById("pallet-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Pallet Calculator - How Many Boxes Fit on a Pallet"
      seoDescription="Free pallet calculator: find how many boxes fit on a 48×40, 1200×1000, 1200×800 or custom pallet, with layers, utilization, weight limit and arrangement."
      footer={<PalletCalculatorFaqSection />}
      wide
    >
      <PalletCalculatorTool />
    </ToolPageWrapper>
  );
}
