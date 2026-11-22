import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GpaPakistanCalculatorTool from "../components/tools/gpa-pakistan-calculator/GpaPakistanCalculatorTool";
import GpaPakistanCalculatorFaqSection from "../components/tools/gpa-pakistan-calculator/GpaPakistanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GpaPakistanCalculatorPage() {
  const tool = getToolById("gpa-calculator-pakistan");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GPA Calculator Pakistan - Free CGPA Calculator Online"
      seoDescription="Use our free GPA calculator Pakistan to work out semester GPA and CGPA on the 4.0 or 5.0 scale, or the QAU MPhil scale. No signup, instant results."
      footer={<GpaPakistanCalculatorFaqSection />}
      wide
    >
      <GpaPakistanCalculatorTool />
    </ToolPageWrapper>
  );
}
