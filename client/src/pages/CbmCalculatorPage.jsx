import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CbmCalculatorTool from "../components/tools/cbm-calculator/CbmCalculatorTool";
import CbmCalculatorFaqSection from "../components/tools/cbm-calculator/CbmCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CbmCalculatorPage() {
  const tool = getToolById("cbm-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CBM Calculator - Free Cubic Meter & Container Loading Tool"
      seoDescription="Use our free CBM calculator to find carton volume, total CBM, volumetric weight, and how many cartons fit in a 20ft or 40ft container. No signup needed."
      footer={<CbmCalculatorFaqSection />}
      wide
    >
      <CbmCalculatorTool />
    </ToolPageWrapper>
  );
}
