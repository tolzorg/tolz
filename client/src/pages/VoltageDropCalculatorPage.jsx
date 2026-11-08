import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VoltageDropCalculatorTool from "../components/tools/voltage-drop-calculator/VoltageDropCalculatorTool";
import VoltageDropCalculatorFaqSection from "../components/tools/voltage-drop-calculator/VoltageDropCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VoltageDropCalculatorPage() {
  const tool = getToolById("voltage-drop-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Voltage Drop Calculator - NEC, Wire Size & Custom Resistance"
      seoDescription="Free voltage drop calculator: voltage drop, drop percentage and voltage at the end for DC, single-phase and 3-phase circuits, from NEC data, AWG wire size or your own resistance."
      footer={<VoltageDropCalculatorFaqSection />}
      wide
    >
      <VoltageDropCalculatorTool />
    </ToolPageWrapper>
  );
}
