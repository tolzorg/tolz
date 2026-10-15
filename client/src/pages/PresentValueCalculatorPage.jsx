import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PresentValueCalculatorTool from "../components/tools/present-value-calculator/PresentValueCalculatorTool";
import PresentValueCalculatorFaqSection from "../components/tools/present-value-calculator/PresentValueCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function PresentValueCalculatorPage() {
  const tool = getToolById("present-value-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Present Value Calculator - PV of a Sum or Annuity"
      seoDescription="Calculate the present value of a future sum or of periodic deposits (annuity) made at the beginning or end of each period, with future value, total interest, a schedule and charts. Free, no signup."
      footer={<PresentValueCalculatorFaqSection />}
      wide
    >
      <PresentValueCalculatorTool />
    </ToolPageWrapper>
  );
}
