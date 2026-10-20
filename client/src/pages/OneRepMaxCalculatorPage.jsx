import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import OneRepMaxCalculatorTool from "../components/tools/one-rep-max-calculator/OneRepMaxCalculatorTool";
import OneRepMaxCalculatorFaqSection from "../components/tools/one-rep-max-calculator/OneRepMaxCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function OneRepMaxCalculatorPage() {
  const tool = getToolById("one-rep-max-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="One Rep Max Calculator - 1RM with Epley, Brzycki & Lombardi"
      seoDescription="Free one rep max calculator: estimate your 1RM from the weight and reps you can lift, with the Epley, Brzycki or Lombardi formula, plus weights for 1-20 reps and 50-100% of your 1RM, in kg or lb."
      footer={<OneRepMaxCalculatorFaqSection />}
      wide
    >
      <OneRepMaxCalculatorTool />
    </ToolPageWrapper>
  );
}
