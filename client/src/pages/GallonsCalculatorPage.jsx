import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GallonsCalculatorTool from "../components/tools/gallons-calculator/GallonsCalculatorTool";
import { getToolById } from "../utils/tools";

export default function GallonsCalculatorPage() {
  const tool = getToolById("gallons-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <GallonsCalculatorTool />
    </ToolPageWrapper>
  );
}
