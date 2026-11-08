import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DimensionalWeightCalculatorTool from "../components/tools/dimensional-weight-calculator/DimensionalWeightCalculatorTool";
import DimensionalWeightCalculatorFaqSection from "../components/tools/dimensional-weight-calculator/DimensionalWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DimensionalWeightCalculatorPage() {
  const tool = getToolById("dimensional-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Dimensional Weight Calculator - UPS, FedEx & USPS DIM Weight"
      seoDescription="Free dimensional weight calculator: find the UPS, FedEx and USPS DIM weight of a package in in/lb or cm/kg and whether you're charged for the dimensional or actual weight."
      footer={<DimensionalWeightCalculatorFaqSection />}
      wide
    >
      <DimensionalWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
