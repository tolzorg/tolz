import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CalorieTrackerTool from "../components/tools/calorie-tracker/CalorieTrackerTool";
import CalorieTrackerFaqSection from "../components/tools/calorie-tracker/CalorieTrackerFaqSection";
import { getToolById } from "../utils/tools";

export default function CalorieTrackerPage() {
  const tool = getToolById("calorie-tracker");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Calorie Tracker & Calculator Online"
      seoDescription="Calculate daily calories, BMR & TDEE instantly with Tolz's free calorie tracker. No signup, no charges, just accurate results in seconds."
      footer={<CalorieTrackerFaqSection />}
    >
      <CalorieTrackerTool />
    </ToolPageWrapper>
  );
}
