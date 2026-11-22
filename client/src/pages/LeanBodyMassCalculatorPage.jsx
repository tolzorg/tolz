import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import LeanBodyMassCalculatorTool from "../components/tools/lean-body-mass-calculator/LeanBodyMassCalculatorTool";
import LeanBodyMassCalculatorFaqSection from "../components/tools/lean-body-mass-calculator/LeanBodyMassCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function LeanBodyMassCalculatorPage() {
  const tool = getToolById("lean-body-mass-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Lean Body Mass Calculator – Free LBM & Body Fat Tool"
      seoDescription="Use our free lean body mass calculator to estimate LBM and body fat with Boer, James and Hume formulas. Enter height, weight, age and gender. No signup."
      footer={<LeanBodyMassCalculatorFaqSection />}
      wide
    >
      <LeanBodyMassCalculatorTool />
    </ToolPageWrapper>
  );
}
