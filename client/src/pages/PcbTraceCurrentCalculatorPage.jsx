import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceCurrentCalculatorTool from "../components/tools/pcb-trace-current-calculator/PcbTraceCurrentCalculatorTool";
import PcbTraceCurrentCalculatorFaqSection from "../components/tools/pcb-trace-current-calculator/PcbTraceCurrentCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceCurrentCalculatorPage() {
  const tool = getToolById("pcb-trace-current-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Current Calculator (IPC-2221) - Free"
      seoDescription="Free PCB trace current calculator using IPC-2221. Enter trace width, copper thickness and temperature rise to get max current, resistance and voltage drop."
      footer={<PcbTraceCurrentCalculatorFaqSection />}
      wide
    >
      <PcbTraceCurrentCalculatorTool />
    </ToolPageWrapper>
  );
}
