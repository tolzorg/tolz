import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ProteinCalculatorTool from "../components/tools/protein-calculator/ProteinCalculatorTool";
import ProteinCalculatorFaqSection from "../components/tools/protein-calculator/ProteinCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ProteinCalculatorPage() {
  const tool = getToolById("protein-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Protein Calculator - How Much Protein Do I Need?"
      seoDescription="Free protein calculator: find how many grams of protein you need each day by the American Dietetic Association, CDC (10-35% of Calories) and WHO guidelines, from your age, gender, height, weight and activity level."
      footer={<ProteinCalculatorFaqSection />}
      wide
    >
      <ProteinCalculatorTool />
    </ToolPageWrapper>
  );
}
