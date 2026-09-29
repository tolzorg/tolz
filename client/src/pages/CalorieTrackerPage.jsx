import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CalorieTrackerTool from "../components/tools/calorie-tracker/CalorieTrackerTool";
import CalorieTrackerFaqSection from "../components/tools/calorie-tracker/CalorieTrackerFaqSection";
import { getToolById } from "../utils/tools";

export default function CalorieTrackerPage() {
  const tool = getToolById("calorie-tracker");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Calorie Calculator Online | BMI, TDEE & Macros"
      seoDescription="Calculate your BMI, daily calorie needs (TDEE), macros, and water intake for free. Get personalized meal suggestions instantly, no signup required."
      footer={<CalorieTrackerFaqSection />}
      wide
    >
      <CalorieTrackerTool />
    </ToolPageWrapper>
  );
}
