import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SemesterGradeCalculatorTool from "../components/tools/semester-grade-calculator/SemesterGradeCalculatorTool";
import SemesterGradeCalculatorFaqSection from "../components/tools/semester-grade-calculator/SemesterGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SemesterGradeCalculatorPage() {
  const tool = getToolById("semester-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Semester Grade Calculator - Quarters, Final Exam & Weights"
      seoDescription="Free semester grade calculator: combine your quarter grades and final exam by their weights, or find the grade you need on your final exam."
      footer={<SemesterGradeCalculatorFaqSection />}
      wide
    >
      <SemesterGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
