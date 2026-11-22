import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PteScoreCalculatorTool from "../components/tools/pte-score-calculator/PteScoreCalculatorTool";
import PteScoreCalculatorFaqSection from "../components/tools/pte-score-calculator/PteScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PteScoreCalculatorPage() {
  const tool = getToolById("pte-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free PTE Score Calculator: IELTS, TOEFL & CEFR Equivalent"
      seoDescription="Enter your overall PTE score to see its IELTS band, TOEFL equivalent, CEFR level and the university courses you may qualify for. Free and instant."
      footer={<PteScoreCalculatorFaqSection />}
      wide
    >
      <PteScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
