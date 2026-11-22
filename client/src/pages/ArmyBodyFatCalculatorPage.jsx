import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ArmyBodyFatCalculatorTool from "../components/tools/army-body-fat-calculator/ArmyBodyFatCalculatorTool";
import ArmyBodyFatCalculatorFaqSection from "../components/tools/army-body-fat-calculator/ArmyBodyFatCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ArmyBodyFatCalculatorPage() {
  const tool = getToolById("army-body-fat-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Army Body Fat Calculator – Free WHtR Check (0.55 Rule)"
      seoDescription="Use our free Army body fat calculator to check your waist-to-height ratio against the 0.55 standard and see the exact waist size you need to pass. No signup."
      footer={<ArmyBodyFatCalculatorFaqSection />}
      wide
    >
      <ArmyBodyFatCalculatorTool />
    </ToolPageWrapper>
  );
}
