import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DimensionalWeightCalculatorTool from "../components/tools/dimensional-weight-calculator/DimensionalWeightCalculatorTool";
import DimensionalWeightCalculatorFaqSection from "../components/tools/dimensional-weight-calculator/DimensionalWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DimensionalWeightCalculatorPage() {
  const tool = getToolById("dimensional-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Dimensional Weight Calculator - UPS, FedEx & USPS (Free)"
      seoDescription="Free dimensional weight calculator for UPS, FedEx & USPS. Enter package size, get DIM weight, and see whether you’re billed on actual or dimensional weight."
      footer={<DimensionalWeightCalculatorFaqSection />}
      wide
    >
      <DimensionalWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
