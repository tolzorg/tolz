import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IraCalculatorTool from "../components/tools/ira-calculator/IraCalculatorTool";
import IraCalculatorFaqSection from "../components/tools/ira-calculator/IraCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IraCalculatorPage() {
  const tool = getToolById("ira-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IRA Calculator - Traditional vs. Roth IRA vs. Taxable Savings"
      seoDescription="Compare a Traditional, SIMPLE, or SEP IRA with a Roth IRA and a regular taxable account, before and after tax, with a growth graph and a full annual schedule. Free, no signup."
      footer={<IraCalculatorFaqSection />}
      wide
    >
      <IraCalculatorTool />
    </ToolPageWrapper>
  );
}
