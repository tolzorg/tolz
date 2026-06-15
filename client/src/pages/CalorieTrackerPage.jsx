import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import CalorieTrackerTool from "../components/tools/calorie-tracker/CalorieTrackerTool";
import { getToolById } from "../utils/tools";

export default function CalorieTrackerPage() {
  const tool = getToolById("calorie-tracker");
  return (
    <ToolPageWrapper tool={tool}>
      <CalorieTrackerTool />
    </ToolPageWrapper>
  );
}
