import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GpaCalculatorTool from "../components/tools/gpa-calculator/GpaCalculatorTool";
import GpaCalculatorFaqSection from "../components/tools/gpa-calculator/GpaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GpaCalculatorPage() {
  const tool = getToolById("gpa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free GPA Calculator – High School & College"
      seoDescription="Use our free GPA calculator to find your high school or college GPA, weighted or unweighted, with credits. Supports honors, AP, IB and cumulative GPA."
      footer={<GpaCalculatorFaqSection />}
      wide
    >
      <GpaCalculatorTool />
    </ToolPageWrapper>
  );
}
