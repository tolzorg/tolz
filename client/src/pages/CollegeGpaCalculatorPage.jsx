import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CollegeGpaCalculatorTool from "../components/tools/college-gpa-calculator/CollegeGpaCalculatorTool";
import CollegeGpaCalculatorFaqSection from "../components/tools/college-gpa-calculator/CollegeGpaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CollegeGpaCalculatorPage() {
  const tool = getToolById("college-gpa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="College GPA Calculator - Free GPA & Cumulative GPA Tool"
      seoDescription="Free college GPA calculator: enter grades and credits for up to 30 courses to get your semester and cumulative GPA on the 4.0 scale instantly."
      footer={<CollegeGpaCalculatorFaqSection />}
      wide
    >
      <CollegeGpaCalculatorTool />
    </ToolPageWrapper>
  );
}
