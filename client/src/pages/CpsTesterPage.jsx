import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CpsTesterTool from "../components/tools/cps-tester/CpsTesterTool";
import CpsFaqSection from "../components/tools/cps-tester/CpsFaqSection";
import { getToolById } from "../utils/tools";

export default function CpsTesterPage() {
  const tool = getToolById("cps-tester");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CPS Test – Free Clicks Per Second Tester Online"
      seoDescription="Test your clicking speed with a free, accurate CPS (Clicks Per Second) tester. Choose preset tests or a custom duration up to 5 minutes, see Peak CPS and click intervals, and track your personal best. No signup."
      footer={<CpsFaqSection />}
    >
      <CpsTesterTool />
    </ToolPageWrapper>
  );
}
