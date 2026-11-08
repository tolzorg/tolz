import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ApScoreCalculatorTool from "../components/tools/ap-score-calculator/ApScoreCalculatorTool";
import ApBioScoreCalculatorFaqSection from "../components/tools/ap-bio-score-calculator/ApBioScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";
import { AP_EXAMS } from "../utils/apScoreCalculatorEngine";

const INTRO = "Estimate your AP® Biology exam score from the points you expect to earn in each section. Your official score may differ, as the College Board adjusts the scale each year to account for exam difficulty.";

export default function ApBioScoreCalculatorPage() {
  const tool = getToolById("ap-bio-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="AP® Bio Score Calculator - AP Biology Score (1-5)"
      seoDescription="Free AP® Biology score calculator: enter your multiple-choice and free-response points to estimate your composite score (0-120), AP® score (1-5) and College Board recommendation."
      footer={<ApBioScoreCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.bio} intro={INTRO} />
    </ToolPageWrapper>
  );
}
