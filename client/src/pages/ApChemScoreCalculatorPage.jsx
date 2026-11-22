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
      seoTitle="AP Chem Score Calculator - Estimate Your 1-5 AP Score"
      seoDescription="Free AP Chem score calculator. Enter your multiple-choice and free-response points to estimate your composite score, AP score (1-5), and credit outlook."
      footer={<ApChemScoreCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.chem} intro={INTRO} />
    </ToolPageWrapper>
  );
}
