import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ApScoreCalculatorTool from "../components/tools/ap-score-calculator/ApScoreCalculatorTool";
import ApLangScoreCalculatorFaqSection from "../components/tools/ap-lang-score-calculator/ApLangScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";
import { AP_EXAMS } from "../utils/apScoreCalculatorEngine";

const INTRO = "Work out your AP® English Language and Composition (AP® Lang) score from the points you think you got in each section of the exam. Your official score may differ, as the College Board adjusts the scale each year.";

export default function ApLangScoreCalculatorPage() {
  const tool = getToolById("ap-lang-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="AP Lang Score Calculator - Free AP Exam Score Estimator"
      seoDescription="Free AP Lang score calculator: enter multiple-choice and essay points to get a composite score, an AP score (1–5), and the College Board recommendation."
      footer={<ApLangScoreCalculatorFaqSection />}
      wide
    >
      <ApScoreCalculatorTool exam={AP_EXAMS.lang} intro={INTRO} />
    </ToolPageWrapper>
  );
}
