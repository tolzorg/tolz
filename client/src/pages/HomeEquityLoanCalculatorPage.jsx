import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HomeEquityLoanCalculatorTool from "../components/tools/home-equity-loan-calculator/HomeEquityLoanCalculatorTool";
import HomeEquityLoanCalculatorFaqSection from "../components/tools/home-equity-loan-calculator/HomeEquityLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HomeEquityLoanCalculatorPage() {
  const tool = getToolById("home-equity-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Home Equity Loan Calculator - Payment, APR & How Much to Borrow"
      seoDescription="Calculate a home equity loan payment, total interest, cost and APR with closing costs and an amortization schedule, and estimate how much you can borrow from your home value, mortgage balance and LTV. Free, no signup."
      footer={<HomeEquityLoanCalculatorFaqSection />}
      wide
    >
      <HomeEquityLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
