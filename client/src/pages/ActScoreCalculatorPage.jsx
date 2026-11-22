import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ActScoreCalculatorTool from "../components/tools/act-score-calculator/ActScoreCalculatorTool";
import ActScoreCalculatorFaqSection from "../components/tools/act-score-calculator/ActScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ActScoreCalculatorPage() {
  const tool = getToolById("act-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="ACT Score Calculator: Raw to Scaled Score & Composite"
      seoDescription="Free ACT score calculator: enter your English, Math, Reading and Science raw scores to get section scores (1–36), your composite score and percentile."
      footer={<ActScoreCalculatorFaqSection />}
      wide
    >
      <ActScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
