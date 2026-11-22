import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RaidCalculatorTool from "../components/tools/raid-calculator/RaidCalculatorTool";
import RaidCalculatorFaqSection from "../components/tools/raid-calculator/RaidCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RaidCalculatorPage() {
  const tool = getToolById("raid-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="RAID Calculator - Capacity, Speed & Fault Tolerance"
      seoDescription="Free RAID calculator for RAID 0, 1, 1E, 10, 5, 50, 5E, 5EE, 6 and 60. Check usable capacity, speed gain, fault tolerance and cost per TB in seconds."
      footer={<RaidCalculatorFaqSection />}
      wide
    >
      <RaidCalculatorTool />
    </ToolPageWrapper>
  );
}
