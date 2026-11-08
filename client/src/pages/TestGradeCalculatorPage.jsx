import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TestGradeCalculatorTool from "../components/tools/test-grade-calculator/TestGradeCalculatorTool";
import TestGradeCalculatorFaqSection from "../components/tools/test-grade-calculator/TestGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TestGradeCalculatorPage() {
  const tool = getToolById("test-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Test Grade Calculator - Score, Percentage & Letter Grade"
      seoDescription="Free test grade calculator (teacher grader): get the percentage and letter grade from points and wrong or correct answers, with a full grading table."
      footer={<TestGradeCalculatorFaqSection />}
      wide
    >
      <TestGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
