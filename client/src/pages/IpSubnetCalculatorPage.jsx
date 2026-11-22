import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IpSubnetCalculatorTool from "../components/tools/ip-subnet-calculator/IpSubnetCalculatorTool";
import IpSubnetCalculatorFaqSection from "../components/tools/ip-subnet-calculator/IpSubnetCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IpSubnetCalculatorPage() {
  const tool = getToolById("ip-subnet-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IP Subnet Calculator - Free IPv4 & IPv6 CIDR Tool"
      seoDescription="Use this free IP subnet calculator to find the network address, broadcast address, usable hosts, wildcard mask and subnets for IPv4 and IPv6 instantly."
      footer={<IpSubnetCalculatorFaqSection />}
      wide
    >
      <IpSubnetCalculatorTool />
    </ToolPageWrapper>
  );
}
