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
      seoTitle="AP Bio Score Calculator - Estimate Your 1-5 AP Score"
      seoDescription="Free AP Bio score calculator: enter your multiple-choice and free-response points to estimate your composite score, AP score (1-5) and credit outlook."
      footer={<ApBioScoreCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.bio} intro={INTRO} />
    </ToolPageWrapper>
  );
}
