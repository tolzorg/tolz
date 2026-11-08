import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HomeEquityLoanCalculatorTool from "../components/tools/home-equity-loan-calculator/HomeEquityLoanCalculatorTool";
import HomeEquityLoanCalculatorFaqSection from "../components/tools/home-equity-loan-calculator/HomeEquityLoanCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HomeEquityLoanCalculatorPage() {
  const tool = getToolById("home-equity-loan-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Home Equity Loan Calculator: Payment, APR & Max Loan"
      seoDescription="Free home equity loan calculator: estimate your monthly payment, total interest, APR with closing costs, amortization schedule and how much you can borrow."
      footer={<HomeEquityLoanCalculatorFaqSection />}
      wide
    >
      <HomeEquityLoanCalculatorTool />
    </ToolPageWrapper>
  );
}
