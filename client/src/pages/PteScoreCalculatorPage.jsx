import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PteScoreCalculatorTool from "../components/tools/pte-score-calculator/PteScoreCalculatorTool";
import PteScoreCalculatorFaqSection from "../components/tools/pte-score-calculator/PteScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PteScoreCalculatorPage() {
  const tool = getToolById("pte-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PTE Score Calculator - CEFR, IELTS & TOEFL Equivalents"
      seoDescription="Free PTE score calculator: enter your overall PTE score (10-90) to see the university courses it may qualify you for and its CEFR level, IELTS band and TOEFL score equivalents."
      footer={<PteScoreCalculatorFaqSection />}
      wide
    >
      <PteScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
