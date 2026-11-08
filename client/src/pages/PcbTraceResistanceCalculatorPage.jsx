import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceResistanceCalculatorTool from "../components/tools/pcb-trace-resistance-calculator/PcbTraceResistanceCalculatorTool";
import PcbTraceResistanceCalculatorFaqSection from "../components/tools/pcb-trace-resistance-calculator/PcbTraceResistanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceResistanceCalculatorPage() {
  const tool = getToolById("pcb-trace-resistance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Resistance Calculator - Resistance & Voltage Drop"
      seoDescription="Free PCB trace resistance calculator: find a copper (or any metal) trace's resistance from its width, length, thickness and temperature, and its voltage drop."
      footer={<PcbTraceResistanceCalculatorFaqSection />}
      wide
    >
      <PcbTraceResistanceCalculatorTool />
    </ToolPageWrapper>
  );
}
