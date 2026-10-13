import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CdCalculatorTool from "../components/tools/cd-calculator/CdCalculatorTool";
import CdCalculatorFaqSection from "../components/tools/cd-calculator/CdCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CdCalculatorPage() {
  const tool = getToolById("cd-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="CD Calculator - Free Certificate of Deposit Calculator"
      seoDescription="Free CD calculator: see your certificate of deposit's ending balance, total interest, and after-tax earnings with annual, monthly, or continuous compounding."
      footer={<CdCalculatorFaqSection />}
      wide
    >
      <CdCalculatorTool />
    </ToolPageWrapper>
  );
}
