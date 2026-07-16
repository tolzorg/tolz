import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SquareYardsCalculatorTool from "../components/tools/square-yards-calculator/SquareYardsCalculatorTool";
import SquareYardsCalculatorFaqSection from "../components/tools/square-yards-calculator/SquareYardsCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SquareYardsCalculatorPage() {
  const tool = getToolById("square-yards-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Square Yards Calculator | Free Area & Material Tool"
      seoDescription="Calculate square yards for any shape instantly. Free online tool with a built-in material estimator for sod, carpet, tile, mulch & gravel."
      footer={<SquareYardsCalculatorFaqSection />}
    >
      <SquareYardsCalculatorTool />
    </ToolPageWrapper>
  );
}
