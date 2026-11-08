import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AprCalculatorTool from "../components/tools/apr-calculator/AprCalculatorTool";
import AprCalculatorFaqSection from "../components/tools/apr-calculator/AprCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AprCalculatorPage() {
  const tool = getToolById("apr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="APR Calculator - Real Loan & Mortgage APR (2027)"
      seoDescription="Free APR calculator for loans and U.S. mortgages. Add fees, points and PMI to see the real APR, plus a full amortization schedule. Updated for 2027."
      footer={<AprCalculatorFaqSection />}
      wide
    >
      <AprCalculatorTool />
    </ToolPageWrapper>
  );
}
