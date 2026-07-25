import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DrywallCalculatorTool from "../components/tools/drywall-calculator/DrywallCalculatorTool";
import DrywallCalculatorFaqSection from "../components/tools/drywall-calculator/DrywallCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DrywallCalculatorPage() {
  const tool = getToolById("drywall-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Drywall Calculator | Free Sheet & Cost Estimator"
      seoDescription="Calculate exactly how much drywall you need by room size, including doors, windows, and sloped walls. Free, instant, no signup required."
      footer={<DrywallCalculatorFaqSection />}
    >
      <DrywallCalculatorTool />
    </ToolPageWrapper>
  );
}
