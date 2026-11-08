import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IeltsScoreCalculatorTool from "../components/tools/ielts-score-calculator/IeltsScoreCalculatorTool";
import IeltsScoreCalculatorFaqSection from "../components/tools/ielts-score-calculator/IeltsScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IeltsScoreCalculatorPage() {
  const tool = getToolById("ielts-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IELTS Score Calculator - Overall Band Score"
      seoDescription="Free IELTS score calculator: work out your overall IELTS band score from listening, reading, speaking and writing, find the score you need for a target average, and convert listening and reading correct answers to band scores."
      footer={<IeltsScoreCalculatorFaqSection />}
      wide
    >
      <IeltsScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
