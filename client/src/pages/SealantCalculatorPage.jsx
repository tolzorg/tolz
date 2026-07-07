import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SealantCalculatorTool from "../components/tools/sealant-calculator/SealantCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SealantCalculatorPage() {
  const tool = getToolById("sealant-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SealantCalculatorTool />
    </ToolPageWrapper>
  );
}
