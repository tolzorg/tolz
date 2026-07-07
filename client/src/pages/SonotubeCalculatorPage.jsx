import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SonotubeCalculatorTool from "../components/tools/sonotube-calculator/SonotubeCalculatorTool";
import { getToolById } from "../utils/tools";

export default function SonotubeCalculatorPage() {
  const tool = getToolById("sonotube-calculator");
  return (
    <ToolPageWrapper tool={tool}>
      <SonotubeCalculatorTool />
    </ToolPageWrapper>
  );
}
