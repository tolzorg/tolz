import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CpsTesterTool from "../components/tools/cps-tester/CpsTesterTool";
import CpsFaqSection from "../components/tools/cps-tester/CpsFaqSection";
import { getToolById } from "../utils/tools";

export default function CpsTesterPage() {
  const tool = getToolById("cps-tester");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CPS Test | Free Online Click Speed Tester"
      seoDescription="Test your clicks per second with this free CPS tester. Choose a preset or custom duration, track Peak CPS, and beat your personal best. No signup."
      footer={<CpsFaqSection />}
    >
      <CpsTesterTool />
    </ToolPageWrapper>
  );
}
