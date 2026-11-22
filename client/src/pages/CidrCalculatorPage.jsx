import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CidrCalculatorTool from "../components/tools/cidr-calculator/CidrCalculatorTool";
import CidrCalculatorFaqSection from "../components/tools/cidr-calculator/CidrCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CidrCalculatorPage() {
  const tool = getToolById("cidr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free CIDR Calculator Online – IPv4 Subnet & Range Tool"
      seoDescription="Use this free CIDR calculator to get the subnet mask, wildcard, network and broadcast address, and usable hosts, or convert an IP range to CIDR. Try it now."
      footer={<CidrCalculatorFaqSection />}
      wide
    >
      <CidrCalculatorTool />
    </ToolPageWrapper>
  );
}
