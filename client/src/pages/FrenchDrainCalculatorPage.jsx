import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FrenchDrainCalculatorTool from "../components/tools/french-drain-calculator/FrenchDrainCalculatorTool";
import { getToolById } from "../utils/tools";

export default function FrenchDrainCalculatorPage() {
  const tool = getToolById("french-drain-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <FrenchDrainCalculatorTool />
    </ToolPageWrapper>
  );
}
