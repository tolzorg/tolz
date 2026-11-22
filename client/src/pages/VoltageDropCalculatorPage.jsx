import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import VoltageDropCalculatorTool from "../components/tools/voltage-drop-calculator/VoltageDropCalculatorTool";
import VoltageDropCalculatorFaqSection from "../components/tools/voltage-drop-calculator/VoltageDropCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function VoltageDropCalculatorPage() {
  const tool = getToolById("voltage-drop-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Voltage Drop Calculator - Free DC, 1-Phase & 3-Phase"
      seoDescription="Free voltage drop calculator for DC, single-phase and 3-phase circuits. Enter wire size, length and current to get drop, percentage and end voltage."
      footer={<VoltageDropCalculatorFaqSection />}
      wide
    >
      <VoltageDropCalculatorTool />
    </ToolPageWrapper>
  );
}
