import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GrowAGardenCalculatorTool from "../components/tools/grow-a-garden-calculator/GrowAGardenCalculatorTool";
import GrowAGardenFaqSection from "../components/tools/grow-a-garden-calculator/GrowAGardenFaqSection";
import { getToolById } from "../utils/tools";

export default function GrowAGardenCalculatorPage() {
  const tool = getToolById("grow-a-garden-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Grow A Garden Calculator - Free Value & Pet Tool"
      seoDescription="Calculate Grow a Garden plant values, mutations, pet XP, egg hatch time & pet weight instantly. 100% free, no signup. Try the calculator now."
      footer={<GrowAGardenFaqSection />}
      wide
    >
      <GrowAGardenCalculatorTool />
    </ToolPageWrapper>
  );
}
