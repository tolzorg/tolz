import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RothIraCalculatorTool from "../components/tools/roth-ira-calculator/RothIraCalculatorTool";
import RothIraCalculatorFaqSection from "../components/tools/roth-ira-calculator/RothIraCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RothIraCalculatorPage() {
  const tool = getToolById("roth-ira-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Roth IRA Calculator - Free 2026 Growth Projection Tool"
      seoDescription="Free Roth IRA calculator: project your retirement balance, compare it with a taxable account, and view 2026 limits, a growth graph and annual schedule."
      footer={<RothIraCalculatorFaqSection />}
      wide
    >
      <RothIraCalculatorTool />
    </ToolPageWrapper>
  );
}
