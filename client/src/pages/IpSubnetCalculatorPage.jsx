import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IpSubnetCalculatorTool from "../components/tools/ip-subnet-calculator/IpSubnetCalculatorTool";
import IpSubnetCalculatorFaqSection from "../components/tools/ip-subnet-calculator/IpSubnetCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IpSubnetCalculatorPage() {
  const tool = getToolById("ip-subnet-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IP Subnet Calculator - IPv4 & IPv6 Subnet Mask, Network & Host Range"
      seoDescription="Free IP subnet calculator for IPv4 and IPv6: find the network and broadcast address, usable host range, subnet and wildcard mask, IP class, CIDR notation and all possible subnets."
      footer={<IpSubnetCalculatorFaqSection />}
      wide
    >
      <IpSubnetCalculatorTool />
    </ToolPageWrapper>
  );
}
