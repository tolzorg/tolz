import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ApScoreCalculatorTool from "../components/tools/ap-score-calculator/ApScoreCalculatorTool";
import ApWorldCalculatorFaqSection from "../components/tools/ap-world-calculator/ApWorldCalculatorFaqSection";
import { getToolById } from "../utils/tools";
import { AP_EXAMS } from "../utils/apScoreCalculatorEngine";

const INTRO = "Predict your AP® World History score from the points you think you will get on each part of the exam, with the matching College Board qualification level. Official scores may differ slightly, as the scale is adjusted each year for exam difficulty.";

export default function ApWorldCalculatorPage() {
  const tool = getToolById("ap-world-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="AP® World Calculator - AP World History Score (1-5)"
      seoDescription="Free AP® World History calculator: enter your multiple-choice, short-answer, DBQ and long essay points to estimate your composite score (0-130), AP® score (1-5) and College Board recommendation."
      footer={<ApWorldCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.world} intro={INTRO} />
    </ToolPageWrapper>
  );
}
