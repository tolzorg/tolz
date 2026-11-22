import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FinalGradeCalculatorTool from "../components/tools/final-grade-calculator/FinalGradeCalculatorTool";
import FinalGradeCalculatorFaqSection from "../components/tools/final-grade-calculator/FinalGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FinalGradeCalculatorPage() {
  const tool = getToolById("final-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Final Grade Calculator - What Do I Need on My Final?"
      seoDescription="Free final grade calculator: enter your current grade, final exam weight and target to see the score you need. Works with percentages, points and letters."
      footer={<FinalGradeCalculatorFaqSection />}
      wide
    >
      <FinalGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
