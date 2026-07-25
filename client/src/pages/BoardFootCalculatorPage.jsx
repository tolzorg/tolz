import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BoardFootCalculatorTool from "../components/tools/board-foot-calculator/BoardFootCalculatorTool";
import BoardFootCalculatorFaqSection from "../components/tools/board-foot-calculator/BoardFootCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BoardFootCalculatorPage() {
  const tool = getToolById("board-foot-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Board Foot Calculator | Free Online Lumber Tool"
      seoDescription="Calculate board feet instantly for any lumber size. Supports inches, mm, cm, feet & meters. Free, accurate, no signup required."
      footer={<BoardFootCalculatorFaqSection />}
    >
      <BoardFootCalculatorTool />
    </ToolPageWrapper>
  );
}
