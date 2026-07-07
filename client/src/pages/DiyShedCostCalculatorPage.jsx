import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DiyShedCostCalculatorTool from "../components/tools/diy-shed-cost-calculator/DiyShedCostCalculatorTool";
import { getToolById } from "../utils/tools";

export default function DiyShedCostCalculatorPage() {
  const tool = getToolById("diy-shed-cost-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <DiyShedCostCalculatorTool />
    </ToolPageWrapper>
  );
}
