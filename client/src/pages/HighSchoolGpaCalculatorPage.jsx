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
      seoTitle="High School GPA Calculator - Weighted & Unweighted GPA"
      seoDescription="Free high school GPA calculator: find your unweighted, weighted (Honors / AP / IB) and cumulative GPA, with or without course credits, for up to 20 courses."
      footer={<HighSchoolGpaCalculatorFaqSection />}
      wide
    >
      <GpaCalculatorTool variant="highSchool" intro={INTRO} />
    </ToolPageWrapper>
  );
}
