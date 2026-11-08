import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PresentValueCalculatorTool from "../components/tools/present-value-calculator/PresentValueCalculatorTool";
import PresentValueCalculatorFaqSection from "../components/tools/present-value-calculator/PresentValueCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PresentValueCalculatorPage() {
  const tool = getToolById("present-value-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Present Value Calculator - Free PV of Sum or Annuity"
      seoDescription="Use our free present value calculator to find the PV of a future sum or periodic deposits, with future value, total interest, and a full schedule."
      footer={<PresentValueCalculatorFaqSection />}
      wide
    >
      <PresentValueCalculatorTool />
    </ToolPageWrapper>
  );
}
