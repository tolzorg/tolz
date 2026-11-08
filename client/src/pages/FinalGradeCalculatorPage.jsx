import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FinalGradeCalculatorTool from "../components/tools/final-grade-calculator/FinalGradeCalculatorTool";
import FinalGradeCalculatorFaqSection from "../components/tools/final-grade-calculator/FinalGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FinalGradeCalculatorPage() {
  const tool = getToolById("final-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Final Grade Calculator - What Grade Do I Need on My Final?"
      seoDescription="Free final grade calculator: find the grade you need on your final exam from your current grade or previous exams, in numbers, percentages or letter grades."
      footer={<FinalGradeCalculatorFaqSection />}
      wide
    >
      <FinalGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
