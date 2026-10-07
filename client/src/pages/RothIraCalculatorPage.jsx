import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RothIraCalculatorTool from "../components/tools/roth-ira-calculator/RothIraCalculatorTool";
import RothIraCalculatorFaqSection from "../components/tools/roth-ira-calculator/RothIraCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RothIraCalculatorPage() {
  const tool = getToolById("roth-ira-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Roth IRA Calculator - Roth IRA vs. Taxable Account Growth"
      seoDescription="Project your Roth IRA balance at retirement and compare it with a regular taxable account, with 2026 contribution limits, a growth graph, and a full annual schedule. Free, no signup."
      footer={<RothIraCalculatorFaqSection />}
      wide
    >
      <RothIraCalculatorTool />
    </ToolPageWrapper>
  );
}
