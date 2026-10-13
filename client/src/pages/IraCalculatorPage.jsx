import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IraCalculatorTool from "../components/tools/ira-calculator/IraCalculatorTool";
import IraCalculatorFaqSection from "../components/tools/ira-calculator/IraCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IraCalculatorPage() {
  const tool = getToolById("ira-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="IRA Calculator: Compare Traditional, Roth & Taxable Growth"
      seoDescription="Free IRA calculator to compare Traditional, SIMPLE, SEP, Roth IRA and taxable accounts after tax, with a growth graph and a year-by-year schedule."
      footer={<IraCalculatorFaqSection />}
      wide
    >
      <IraCalculatorTool />
    </ToolPageWrapper>
  );
}
