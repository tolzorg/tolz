import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CarbohydrateCalculatorTool from "../components/tools/carbohydrate-calculator/CarbohydrateCalculatorTool";
import CarbohydrateCalculatorFaqSection from "../components/tools/carbohydrate-calculator/CarbohydrateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CarbohydrateCalculatorPage() {
  const tool = getToolById("carbohydrate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Carbohydrate Calculator - Daily Carbs in Grams"
      seoDescription="Free carb calculator: find how many grams of carbohydrates to eat each day (40-75% of your Calories) to maintain, lose or gain weight, from your age, gender, height, weight and activity level."
      footer={<CarbohydrateCalculatorFaqSection />}
      wide
    >
      <CarbohydrateCalculatorTool />
    </ToolPageWrapper>
  );
}
