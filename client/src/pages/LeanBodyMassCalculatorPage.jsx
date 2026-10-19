import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LeanBodyMassCalculatorTool from "../components/tools/lean-body-mass-calculator/LeanBodyMassCalculatorTool";
import LeanBodyMassCalculatorFaqSection from "../components/tools/lean-body-mass-calculator/LeanBodyMassCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LeanBodyMassCalculatorPage() {
  const tool = getToolById("lean-body-mass-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Lean Body Mass Calculator - Boer, James, Hume & Peters Formulas"
      seoDescription="Free lean body mass calculator: estimate your lean body mass (LBM) and body fat from height, weight, gender and age with the Boer, James and Hume formulas, plus the Peters formula for children."
      footer={<LeanBodyMassCalculatorFaqSection />}
      wide
    >
      <LeanBodyMassCalculatorTool />
    </ToolPageWrapper>
  );
}
