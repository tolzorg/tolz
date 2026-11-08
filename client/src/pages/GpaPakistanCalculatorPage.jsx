import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import GpaPakistanCalculatorTool from "../components/tools/gpa-pakistan-calculator/GpaPakistanCalculatorTool";
import GpaPakistanCalculatorFaqSection from "../components/tools/gpa-pakistan-calculator/GpaPakistanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function GpaPakistanCalculatorPage() {
  const tool = getToolById("gpa-calculator-pakistan");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="GPA Calculator Pakistan - University GPA & cGPA"
      seoDescription="Free GPA calculator for Pakistan: calculate your university GPA and cGPA on the 4-point or 5-point scale or the Quaid-e-Azam University (MPhil) scale from your grades and credit hours."
      footer={<GpaPakistanCalculatorFaqSection />}
      wide
    >
      <GpaPakistanCalculatorTool />
    </ToolPageWrapper>
  );
}
