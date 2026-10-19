import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ArmyBodyFatCalculatorTool from "../components/tools/army-body-fat-calculator/ArmyBodyFatCalculatorTool";
import ArmyBodyFatCalculatorFaqSection from "../components/tools/army-body-fat-calculator/ArmyBodyFatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ArmyBodyFatCalculatorPage() {
  const tool = getToolById("army-body-fat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Army Body Fat Calculator - Army Waist-to-Height Ratio Standard (2026)"
      seoDescription="Free Army body fat calculator using the Army's current body composition test: your waist-to-height ratio (waist at the navel ÷ height) must be below 0.55. See your ratio, whether you pass and the waist you need."
      footer={<ArmyBodyFatCalculatorFaqSection />}
      wide
    >
      <ArmyBodyFatCalculatorTool />
    </ToolPageWrapper>
  );
}
