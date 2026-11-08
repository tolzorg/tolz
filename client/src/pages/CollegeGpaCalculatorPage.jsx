import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CollegeGpaCalculatorTool from "../components/tools/college-gpa-calculator/CollegeGpaCalculatorTool";
import CollegeGpaCalculatorFaqSection from "../components/tools/college-gpa-calculator/CollegeGpaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CollegeGpaCalculatorPage() {
  const tool = getToolById("college-gpa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="College GPA Calculator - Semester & Cumulative GPA"
      seoDescription="Free college GPA calculator: enter your course grades and credits (up to 30 courses) to find your college GPA on the 4.0 scale and your cumulative GPA."
      footer={<CollegeGpaCalculatorFaqSection />}
      wide
    >
      <CollegeGpaCalculatorTool />
    </ToolPageWrapper>
  );
}
