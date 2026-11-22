import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbTraceWidthCalculatorTool from "../components/tools/pcb-trace-width-calculator/PcbTraceWidthCalculatorTool";
import PcbTraceWidthCalculatorFaqSection from "../components/tools/pcb-trace-width-calculator/PcbTraceWidthCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbTraceWidthCalculatorPage() {
  const tool = getToolById("pcb-trace-width-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Trace Width Calculator (IPC-2221) – Free Online Tool"
      seoDescription="Free PCB trace width calculator (IPC-2221). Enter current and temperature rise to get trace width, resistance, voltage drop and power for any layer."
      footer={<PcbTraceWidthCalculatorFaqSection />}
      wide
    >
      <PcbTraceWidthCalculatorTool />
    </ToolPageWrapper>
  );
}
