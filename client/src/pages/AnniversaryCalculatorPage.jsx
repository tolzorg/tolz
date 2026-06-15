import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnniversaryCalculatorTool from "../components/tools/anniversary-calculator/AnniversaryCalculatorTool";
import { getToolById } from "../utils/tools";

export default function AnniversaryCalculatorPage() {
  const tool = getToolById("anniversary-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <AnniversaryCalculatorTool />
    </ToolPageWrapper>
  );
}
