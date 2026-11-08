import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ResistorCalculatorTool from "../components/tools/resistor-calculator/ResistorCalculatorTool";
import ResistorCalculatorFaqSection from "../components/tools/resistor-calculator/ResistorCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ResistorCalculatorPage() {
  const tool = getToolById("resistor-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Resistor Calculator - Color Code, Parallel, Series & Wire Resistance"
      seoDescription="Free resistor calculator: decode 3, 4, 5 and 6-band resistor color codes, add resistors in parallel and in series, and find the resistance of a conductor."
      footer={<ResistorCalculatorFaqSection />}
      wide
    >
      <ResistorCalculatorTool />
    </ToolPageWrapper>
  );
}
