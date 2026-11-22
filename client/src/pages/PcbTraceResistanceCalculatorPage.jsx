import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceResistanceCalculatorTool from "../components/tools/pcb-trace-resistance-calculator/PcbTraceResistanceCalculatorTool";
import PcbTraceResistanceCalculatorFaqSection from "../components/tools/pcb-trace-resistance-calculator/PcbTraceResistanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceResistanceCalculatorPage() {
  const tool = getToolById("pcb-trace-resistance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Resistance Calculator – Free Online Tool"
      seoDescription="Free PCB trace resistance calculator. Enter width, length, copper thickness and temperature to get resistance and voltage drop instantly. No signup needed."
      footer={<PcbTraceResistanceCalculatorFaqSection />}
      wide
    >
      <PcbTraceResistanceCalculatorTool />
    </ToolPageWrapper>
  );
}
