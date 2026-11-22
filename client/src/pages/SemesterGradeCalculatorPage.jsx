import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SemesterGradeCalculatorTool from "../components/tools/semester-grade-calculator/SemesterGradeCalculatorTool";
import SemesterGradeCalculatorFaqSection from "../components/tools/semester-grade-calculator/SemesterGradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SemesterGradeCalculatorPage() {
  const tool = getToolById("semester-grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Semester Grade Calculator - Free Weighted Final Grade Tool"
      seoDescription="Use this free semester grade calculator to combine quarter grades and your final exam by weight, or find the score you need on the final to hit your goal."
      footer={<SemesterGradeCalculatorFaqSection />}
      wide
    >
      <SemesterGradeCalculatorTool />
    </ToolPageWrapper>
  );
}
