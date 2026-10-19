import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BmiCalculatorTool from "../components/tools/bmi-calculator/BmiCalculatorTool";
import BmiCalculatorFaqSection from "../components/tools/bmi-calculator/BmiCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BmiCalculatorPage() {
  const tool = getToolById("bmi-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BMI Calculator - Body Mass Index for Adults & Children"
      seoDescription="Free BMI calculator: find your Body Mass Index and weight category for adults (WHO) and children aged 2-20 (CDC percentiles), plus healthy weight, BMI Prime and Ponderal Index."
      footer={<BmiCalculatorFaqSection />}
      wide
    >
      <BmiCalculatorTool />
    </ToolPageWrapper>
  );
}
