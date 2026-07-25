import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FireGlassCalculatorTool from "../components/tools/fire-glass-calculator/FireGlassCalculatorTool";
import FireGlassCalculatorFaqSection from "../components/tools/fire-glass-calculator/FireGlassCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FireGlassCalculatorPage() {
  const tool = getToolById("fire-glass-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Fire Glass Calculator: How Much Fire Glass You Need"
      seoDescription="Free Fire Glass Calculator for round, square, rectangular, triangular, and trapezoidal fire pits. Get exact fire glass quantity by weight instantly."
      footer={<FireGlassCalculatorFaqSection />}
    >
      <FireGlassCalculatorTool />
    </ToolPageWrapper>
  );
}
