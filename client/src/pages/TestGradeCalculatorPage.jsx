import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import TestGradeCalculatorTool from "../components/tools/test-grade-calculator/TestGradeCalculatorTool";
import TestGradeCalculatorFaqSection from "../components/tools/test-grade-calculator/TestGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function TestGradeCalculatorPage() {
  const tool = getToolById("test-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Test Grade Calculator - Percentage & Letter Grade"
      seoDescription="Free test grade calculator. Enter points or correct and wrong answers to get your percentage and letter grade, with a full grading table and custom scale."
      footer={<TestGradeCalculatorFaqSection />}
      wide
    >
      <TestGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
