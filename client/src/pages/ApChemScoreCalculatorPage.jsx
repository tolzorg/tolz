import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ApScoreCalculatorTool from "../components/tools/ap-score-calculator/ApScoreCalculatorTool";
import ApChemScoreCalculatorFaqSection from "../components/tools/ap-chem-score-calculator/ApChemScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";
import { AP_EXAMS } from "../utils/apScoreCalculatorEngine";

const INTRO = "Convert the points you earn in each section of the AP® Chemistry exam into a composite score (0-100) and an estimated AP® score (1-5). Your official score may differ slightly, as the College Board adjusts the scale each year based on exam difficulty.";

export default function ApChemScoreCalculatorPage() {
  const tool = getToolById("ap-chem-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="AP® Chem Score Calculator - AP Chemistry Score (1-5)"
      seoDescription="Free AP® Chemistry score calculator: enter your multiple-choice and free-response points to estimate your composite score (0-100), AP® score (1-5) and College Board recommendation."
      footer={<ApChemScoreCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.chem} intro={INTRO} />
    </ToolPageWrapper>
  );
}
