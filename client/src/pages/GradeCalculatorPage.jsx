import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GradeCalculatorTool from "../components/tools/grade-calculator/GradeCalculatorTool";
import GradeCalculatorFaqSection from "../components/tools/grade-calculator/GradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GradeCalculatorPage() {
  const tool = getToolById("grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Grade Calculator - Free Weighted & Unweighted Grades"
      seoDescription="Use our free grade calculator to work out your overall grade from letter grades, percentages or points. Weighted or unweighted, with a custom grading scale."
      footer={<GradeCalculatorFaqSection />}
      wide
    >
      <GradeCalculatorTool />
    </ToolPageWrapper>
  );
}
