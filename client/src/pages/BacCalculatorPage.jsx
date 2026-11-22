import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BacCalculatorTool from "../components/tools/bac-calculator/BacCalculatorTool";
import BacCalculatorFaqSection from "../components/tools/bac-calculator/BacCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BacCalculatorPage() {
  const tool = getToolById("bac-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BAC Calculator - Free Blood Alcohol Estimator"
      seoDescription="Estimate your blood alcohol concentration with our free BAC calculator. Enter drinks, weight, gender and time to see a BAC chart and hours until 0%."
      footer={<BacCalculatorFaqSection />}
      wide
    >
      <BacCalculatorTool />
    </ToolPageWrapper>
  );
}
