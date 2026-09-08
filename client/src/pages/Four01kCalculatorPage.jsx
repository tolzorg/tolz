import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import Four01kCalculatorTool from "../components/tools/401k-calculator/Four01kCalculatorTool";
import Four01kCalculatorFaqSection from "../components/tools/401k-calculator/Four01kCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function Four01kCalculatorPage() {
  const tool = getToolById("401k-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="401K Calculator - Free Retirement Balance & Withdrawal Estimator"
      seoDescription="Estimate a 401(k) balance at retirement and withdrawals afterward, plus early withdrawal costs and the contribution percentage that maximizes your employer match. Free and instant."
      footer={<Four01kCalculatorFaqSection />}
      wide
    >
      <Four01kCalculatorTool />
    </ToolPageWrapper>
  );
}
