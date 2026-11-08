import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CbmCalculatorTool from "../components/tools/cbm-calculator/CbmCalculatorTool";
import CbmCalculatorFaqSection from "../components/tools/cbm-calculator/CbmCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CbmCalculatorPage() {
  const tool = getToolById("cbm-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CBM Calculator - Cubic Meters, Volumetric Weight & Container Fit"
      seoDescription="Free CBM calculator for shipping: find carton cubic meters, total volume, total and volumetric weight, and how many cartons fit in a 20′, 40′ or 45′ container."
      footer={<CbmCalculatorFaqSection />}
      wide
    >
      <CbmCalculatorTool />
    </ToolPageWrapper>
  );
}
