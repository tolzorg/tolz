import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ActScoreCalculatorTool from "../components/tools/act-score-calculator/ActScoreCalculatorTool";
import ActScoreCalculatorFaqSection from "../components/tools/act-score-calculator/ActScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ActScoreCalculatorPage() {
  const tool = getToolById("act-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="ACT Score Calculator - Composite Score & Percentile"
      seoDescription="Free ACT score calculator: choose your English, Math, Reading and Science raw scores to see your section scores (1-36), composite ACT score and percentile."
      footer={<ActScoreCalculatorFaqSection />}
      wide
    >
      <ActScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
