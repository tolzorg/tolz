import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GradeCalculatorTool from "../components/tools/grade-calculator/GradeCalculatorTool";
import GradeCalculatorFaqSection from "../components/tools/grade-calculator/GradeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GradeCalculatorPage() {
  const tool = getToolById("grade-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Grade Calculator - Weighted Letter, Percentage & Points"
      seoDescription="Free grade calculator: estimate your overall grade from letter grades, percentages or points, unweighted or weighted, with an adjustable grading scale."
      footer={<GradeCalculatorFaqSection />}
      wide
    >
      <GradeCalculatorTool />
    </ToolPageWrapper>
  );
}
