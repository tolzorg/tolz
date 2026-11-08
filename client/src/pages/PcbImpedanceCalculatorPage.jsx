import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PcbImpedanceCalculatorTool from "../components/tools/pcb-impedance-calculator/PcbImpedanceCalculatorTool";
import PcbImpedanceCalculatorFaqSection from "../components/tools/pcb-impedance-calculator/PcbImpedanceCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PcbImpedanceCalculatorPage() {
  const tool = getToolById("pcb-impedance-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="PCB Impedance Calculator - Microstrip & Stripline Impedance"
      seoDescription="Free PCB impedance calculator: microstrip, edge-coupled, wire and embedded microstrip, and stripline impedance (symmetric, asymmetric, coupled), with ε_eff."
      footer={<PcbImpedanceCalculatorFaqSection />}
      wide
    >
      <PcbImpedanceCalculatorTool />
    </ToolPageWrapper>
  );
}
