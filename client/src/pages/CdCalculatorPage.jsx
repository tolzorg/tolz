import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CdCalculatorTool from "../components/tools/cd-calculator/CdCalculatorTool";
import CdCalculatorFaqSection from "../components/tools/cd-calculator/CdCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CdCalculatorPage() {
  const tool = getToolById("cd-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CD Calculator - Certificate of Deposit Interest & End Balance"
      seoDescription="Calculate a certificate of deposit's end balance and interest with annual, monthly, or continuous compounding and an optional tax rate. Includes annual and monthly schedules. Free, no signup."
      footer={<CdCalculatorFaqSection />}
      wide
    >
      <CdCalculatorTool />
    </ToolPageWrapper>
  );
}
