import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CarbohydrateCalculatorTool from "../components/tools/carbohydrate-calculator/CarbohydrateCalculatorTool";
import CarbohydrateCalculatorFaqSection from "../components/tools/carbohydrate-calculator/CarbohydrateCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function CarbohydrateCalculatorPage() {
  const tool = getToolById("carbohydrate-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Carbohydrate Calculator: Daily Carbs for Your Goal"
      seoDescription="Use our free carbohydrate calculator to find your daily carbs in grams at 40%, 55%, 65% and 75% of calories to lose, maintain or gain weight."
      footer={<CarbohydrateCalculatorFaqSection />}
      wide
    >
      <CarbohydrateCalculatorTool />
    </ToolPageWrapper>
  );
}
