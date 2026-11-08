import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RaidCalculatorTool from "../components/tools/raid-calculator/RaidCalculatorTool";
import RaidCalculatorFaqSection from "../components/tools/raid-calculator/RaidCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RaidCalculatorPage() {
  const tool = getToolById("raid-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="RAID Calculator - Capacity, Speed, Fault Tolerance & Cost"
      seoDescription="Free RAID calculator: usable capacity, read and write speed gain, fault tolerance and cost per TB for RAID 0, 1, 1E, 10, 5, 50, 5E, 5EE, 6 and 60."
      footer={<RaidCalculatorFaqSection />}
      wide
    >
      <RaidCalculatorTool />
    </ToolPageWrapper>
  );
}
