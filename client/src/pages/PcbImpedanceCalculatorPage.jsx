import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbImpedanceCalculatorTool from "../components/tools/pcb-impedance-calculator/PcbImpedanceCalculatorTool";
import PcbImpedanceCalculatorFaqSection from "../components/tools/pcb-impedance-calculator/PcbImpedanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbImpedanceCalculatorPage() {
  const tool = getToolById("pcb-impedance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Impedance Calculator: Microstrip & Stripline"
      seoDescription="Free PCB impedance calculator for microstrip and stripline traces. Find characteristic impedance and effective dielectric constant (ε_eff) in seconds."
      footer={<PcbImpedanceCalculatorFaqSection />}
      wide
    >
      <PcbImpedanceCalculatorTool />
    </ToolPageWrapper>
  );
}
