import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceCurrentCalculatorTool from "../components/tools/pcb-trace-current-calculator/PcbTraceCurrentCalculatorTool";
import PcbTraceCurrentCalculatorFaqSection from "../components/tools/pcb-trace-current-calculator/PcbTraceCurrentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceCurrentCalculatorPage() {
  const tool = getToolById("pcb-trace-current-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Current Calculator - Max Current Capacity (IPC-2221)"
      seoDescription="Free PCB trace current calculator (IPC-2221): find how much current a trace can carry from its width, thickness and temperature rise, plus resistance and voltage drop."
      footer={<PcbTraceCurrentCalculatorFaqSection />}
      wide
    >
      <PcbTraceCurrentCalculatorTool />
    </ToolPageWrapper>
  );
}
