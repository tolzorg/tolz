import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SquareFootageCalculatorTool from "../components/tools/square-footage-calculator/SquareFootageCalculatorTool";
import SquareFootageCalculatorFaqSection from "../components/tools/square-footage-calculator/SquareFootageCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SquareFootageCalculatorPage() {
  const tool = getToolById("square-footage-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Square Footage Calculator | Free Online Area Tool"
      seoDescription="Calculate square footage instantly for 10 shapes with our free square footage calculator. No signup, all units supported, accurate results."
      footer={<SquareFootageCalculatorFaqSection />}
    >
      <SquareFootageCalculatorTool />
    </ToolPageWrapper>
  );
}
