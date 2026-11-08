import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DebtToIncomeCalculatorTool from "../components/tools/debt-to-income-calculator/DebtToIncomeCalculatorTool";
import DebtToIncomeCalculatorFaqSection from "../components/tools/debt-to-income-calculator/DebtToIncomeCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function DebtToIncomeCalculatorPage() {
  const tool = getToolById("debt-to-income-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Debt-to-Income Ratio Calculator: Free DTI Check"
      seoDescription="Use this free debt-to-income ratio calculator to find your front-end and back-end DTI, see if it’s healthy, and estimate how much house you can afford."
      footer={<DebtToIncomeCalculatorFaqSection />}
      wide
    >
      <DebtToIncomeCalculatorTool />
    </ToolPageWrapper>
  );
}
