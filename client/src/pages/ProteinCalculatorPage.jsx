import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ProteinCalculatorTool from "../components/tools/protein-calculator/ProteinCalculatorTool";
import ProteinCalculatorFaqSection from "../components/tools/protein-calculator/ProteinCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ProteinCalculatorPage() {
  const tool = getToolById("protein-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Protein Calculator – Daily Protein Intake in Grams"
      seoDescription="Free protein calculator to find how many grams of protein you need daily. Based on ADA, CDC and WHO guidelines, using your age, weight, height and activity."
      footer={<ProteinCalculatorFaqSection />}
      wide
    >
      <ProteinCalculatorTool />
    </ToolPageWrapper>
  );
}
