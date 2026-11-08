import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IdealWeightCalculatorTool from "../components/tools/ideal-weight-calculator/IdealWeightCalculatorTool";
import IdealWeightCalculatorFaqSection from "../components/tools/ideal-weight-calculator/IdealWeightCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function IdealWeightCalculatorPage() {
  const tool = getToolById("ideal-weight-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Ideal Weight Calculator: Devine, Hamwi & More"
      seoDescription="Free ideal weight calculator comparing Robinson, Miller, Devine and Hamwi formulas with your healthy BMI range. Works for adults and children aged 2–20."
      footer={<IdealWeightCalculatorFaqSection />}
      wide
    >
      <IdealWeightCalculatorTool />
    </ToolPageWrapper>
  );
}
