import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GpaCalculatorTool from "../components/tools/gpa-calculator/GpaCalculatorTool";
import HighSchoolGpaCalculatorFaqSection from "../components/tools/high-school-gpa-calculator/HighSchoolGpaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

const INTRO = "Find your high school GPA: unweighted or weighted with course difficulty (Honors / AP / IB / College), with or without credits, and your cumulative GPA. Enter up to 20 courses.";

export default function HighSchoolGpaCalculatorPage() {
  const tool = getToolById("high-school-gpa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="High School GPA Calculator - Weighted & Unweighted"
      seoDescription="Free high school GPA calculator for weighted, unweighted & cumulative GPA. Add Honors, AP, IB or college courses, with or without credits."
      footer={<HighSchoolGpaCalculatorFaqSection />}
      wide
    >
      <GpaCalculatorTool variant="highSchool" intro={INTRO} />
    </ToolPageWrapper>
  );
}
