import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ResistorCalculatorTool from "../components/tools/resistor-calculator/ResistorCalculatorTool";
import ResistorCalculatorFaqSection from "../components/tools/resistor-calculator/ResistorCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ResistorCalculatorPage() {
  const tool = getToolById("resistor-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Resistor Calculator: Color Code, Series & Parallel"
      seoDescription="Use our free resistor calculator to decode 3–6 band color codes, find series and parallel resistance, and calculate conductor resistance. No signup needed."
      footer={<ResistorCalculatorFaqSection />}
      wide
    >
      <ResistorCalculatorTool />
    </ToolPageWrapper>
  );
}
