import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IeltsScoreCalculatorTool from "../components/tools/ielts-score-calculator/IeltsScoreCalculatorTool";
import IeltsScoreCalculatorFaqSection from "../components/tools/ielts-score-calculator/IeltsScoreCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IeltsScoreCalculatorPage() {
  const tool = getToolById("ielts-score-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IELTS Score Calculator – Free Overall Band Score Tool"
      seoDescription="Use the free IELTS score calculator to find your overall band, convert listening and reading raw scores, and see what you need to hit your target band."
      footer={<IeltsScoreCalculatorFaqSection />}
      wide
    >
      <IeltsScoreCalculatorTool />
    </ToolPageWrapper>
  );
}
