import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CidrCalculatorTool from "../components/tools/cidr-calculator/CidrCalculatorTool";
import CidrCalculatorFaqSection from "../components/tools/cidr-calculator/CidrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CidrCalculatorPage() {
  const tool = getToolById("cidr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CIDR Calculator - CIDR to IP Range & IP Range to CIDR"
      seoDescription="Free CIDR calculator: convert CIDR notation to an IPv4 range with subnet mask, wildcard bits, network and broadcast addresses and host count, or an IP range to CIDR blocks."
      footer={<CidrCalculatorFaqSection />}
      wide
    >
      <CidrCalculatorTool />
    </ToolPageWrapper>
  );
}
