import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BmiCalculatorTool from "../components/tools/bmi-calculator/BmiCalculatorTool";
import BmiCalculatorFaqSection from "../components/tools/bmi-calculator/BmiCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BmiCalculatorPage() {
  const tool = getToolById("bmi-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BMI Calculator - Free Adult & Kids BMI Check"
      seoDescription="Check your BMI free with Tolz. Get your weight category, healthy range, BMI Prime and Ponderal Index for adults and kids, plus what your number really means."
      footer={<BmiCalculatorFaqSection />}
      wide
    >
      <BmiCalculatorTool />
    </ToolPageWrapper>
  );
}
