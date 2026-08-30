import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GrowAGardenCalculatorTool from "../components/tools/grow-a-garden-calculator/GrowAGardenCalculatorTool";
import GrowAGardenFaqSection from "../components/tools/grow-a-garden-calculator/GrowAGardenFaqSection";
import { getToolById } from "../utils/tools";

export default function GrowAGardenCalculatorPage() {
  const tool = getToolById("grow-a-garden-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Grow A Garden Calculator – Plant Value, Mutations, Pet XP &amp; More"
      seoDescription="Free Grow a Garden calculator: plant/crop value with weight and mutations, pet XP growth time, egg hatch speed, pet weight by age, and pet ability stats. No signup."
      footer={<GrowAGardenFaqSection />}
      wide
    >
      <GrowAGardenCalculatorTool />
    </ToolPageWrapper>
  );
}
