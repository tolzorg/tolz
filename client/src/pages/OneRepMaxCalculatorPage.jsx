import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import OneRepMaxCalculatorTool from "../components/tools/one-rep-max-calculator/OneRepMaxCalculatorTool";
import OneRepMaxCalculatorFaqSection from "../components/tools/one-rep-max-calculator/OneRepMaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function OneRepMaxCalculatorPage() {
  const tool = getToolById("one-rep-max-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="One Rep Max Calculator - Free 1RM Calculator & Chart"
      seoDescription="Free one rep max calculator. Estimate your 1RM with Epley, Brzycki or Lombardi and get weights for 1-20 reps and 50-100% of your max. No signup needed."
      footer={<OneRepMaxCalculatorFaqSection />}
      wide
    >
      <OneRepMaxCalculatorTool />
    </ToolPageWrapper>
  );
}
