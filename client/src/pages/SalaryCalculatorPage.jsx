import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SalaryCalculatorTool from "../components/tools/salary-calculator/SalaryCalculatorTool";
import SalaryCalculatorFaqSection from "../components/tools/salary-calculator/SalaryCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SalaryCalculatorPage() {
  const tool = getToolById("salary-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Salary Calculator: Hourly to Annual Pay Converter"
      seoDescription="Free salary calculator to convert hourly, daily, weekly, biweekly, monthly or annual pay, with figures before and after holidays and vacation. No signup."
      footer={<SalaryCalculatorFaqSection />}
      wide
    >
      <SalaryCalculatorTool />
    </ToolPageWrapper>
  );
}
