import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DeckingCalculatorTool from "../components/tools/decking-calculator/DeckingCalculatorTool";
import DeckingCalculatorFaqSection from "../components/tools/decking-calculator/DeckingCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DeckingCalculatorPage() {
  const tool = getToolById("decking-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Decking Calculator | Free Boards, Screws & Cost Estimate"
      seoDescription="Free decking calculator to estimate boards, screws or clips, and total cost, with a 10% waste factor. Works for tiles and standard decking too."
      footer={<DeckingCalculatorFaqSection />}
    >
      <DeckingCalculatorTool />
    </ToolPageWrapper>
  );
}
