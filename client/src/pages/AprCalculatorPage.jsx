import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AprCalculatorTool from "../components/tools/apr-calculator/AprCalculatorTool";
import AprCalculatorFaqSection from "../components/tools/apr-calculator/AprCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AprCalculatorPage() {
  const tool = getToolById("apr-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="APR Calculator - Real APR with Fees, Points & PMI"
      seoDescription="Find the real APR of a loan including loaned and upfront fees, for any compounding and payment frequency, or a U.S. mortgage APR with points and PMI, plus an amortization schedule. Free, no signup."
      footer={<AprCalculatorFaqSection />}
      wide
    >
      <AprCalculatorTool />
    </ToolPageWrapper>
  );
}
