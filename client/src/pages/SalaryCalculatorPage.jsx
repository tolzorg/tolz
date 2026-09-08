import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SalaryCalculatorTool from "../components/tools/salary-calculator/SalaryCalculatorTool";
import SalaryCalculatorFaqSection from "../components/tools/salary-calculator/SalaryCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SalaryCalculatorPage() {
  const tool = getToolById("salary-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Salary Calculator - Free Hourly, Weekly, Monthly & Annual Pay Converter"
      seoDescription="Convert a salary between hourly, daily, weekly, biweekly, semi-monthly, monthly, quarterly, and annual pay, with figures both before and after holidays and vacation. Free and instant."
      footer={<SalaryCalculatorFaqSection />}
      wide
    >
      <SalaryCalculatorTool />
    </ToolPageWrapper>
  );
}
