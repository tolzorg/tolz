import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FrenchDrainCalculatorTool from "../components/tools/french-drain-calculator/FrenchDrainCalculatorTool";
import FrenchDrainCalculatorFaqSection from "../components/tools/french-drain-calculator/FrenchDrainCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FrenchDrainCalculatorPage() {
  const tool = getToolById("french-drain-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="French Drain Calculator | Gravel, Pipe & Cost Estimate"
      seoDescription="Free French Drain Calculator to estimate trench volume, gravel, and pipe length. Supports Schedule 40 & SDR35 pipe with instant cost totals."
      footer={<FrenchDrainCalculatorFaqSection />}
    >
      <FrenchDrainCalculatorTool />
    </ToolPageWrapper>
  );
}
