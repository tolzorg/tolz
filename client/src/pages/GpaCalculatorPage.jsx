import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GpaCalculatorTool from "../components/tools/gpa-calculator/GpaCalculatorTool";
import GpaCalculatorFaqSection from "../components/tools/gpa-calculator/GpaCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GpaCalculatorPage() {
  const tool = getToolById("gpa-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GPA Calculator - High School & College GPA"
      seoDescription="Free GPA calculator: work out your high school or college GPA with or without credits, including honors, AP, IB and college courses, and your cumulative GPA."
      footer={<GpaCalculatorFaqSection />}
      wide
    >
      <GpaCalculatorTool />
    </ToolPageWrapper>
  );
}
