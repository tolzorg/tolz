import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceWidthCalculatorTool from "../components/tools/pcb-trace-width-calculator/PcbTraceWidthCalculatorTool";
import PcbTraceWidthCalculatorFaqSection from "../components/tools/pcb-trace-width-calculator/PcbTraceWidthCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceWidthCalculatorPage() {
  const tool = getToolById("pcb-trace-width-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Width Calculator - IPC-2221 Internal & External Traces"
      seoDescription="Free PCB trace width calculator (IPC-2221): find the trace width and cross section for a current and temperature rise, plus resistance, voltage drop and power."
      footer={<PcbTraceWidthCalculatorFaqSection />}
      wide
    >
      <PcbTraceWidthCalculatorTool />
    </ToolPageWrapper>
  );
}
