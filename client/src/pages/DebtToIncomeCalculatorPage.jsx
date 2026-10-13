import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtToIncomeCalculatorTool from "../components/tools/debt-to-income-calculator/DebtToIncomeCalculatorTool";
import DebtToIncomeCalculatorFaqSection from "../components/tools/debt-to-income-calculator/DebtToIncomeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtToIncomeCalculatorPage() {
  const tool = getToolById("debt-to-income-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt-to-Income (DTI) Ratio Calculator - Front-End & Back-End DTI"
      seoDescription="Calculate your front-end and back-end debt-to-income ratio from monthly or yearly income and debts, see how healthy it is, and estimate how much house you can afford. Free, no signup."
      footer={<DebtToIncomeCalculatorFaqSection />}
      wide
    >
      <DebtToIncomeCalculatorTool />
    </ToolPageWrapper>
  );
}
