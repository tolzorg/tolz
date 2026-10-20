import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BacCalculatorTool from "../components/tools/bac-calculator/BacCalculatorTool";
import BacCalculatorFaqSection from "../components/tools/bac-calculator/BacCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BacCalculatorPage() {
  const tool = getToolById("bac-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="BAC Calculator - Blood Alcohol Concentration"
      seoDescription="Free blood alcohol concentration (BAC) calculator: estimate your BAC from beer, wine, liquor or any drink, your weight, gender and time since your first drink, with a chart of BAC over time and the hours until 0%."
      footer={<BacCalculatorFaqSection />}
      wide
    >
      <BacCalculatorTool />
    </ToolPageWrapper>
  );
}
