import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnniversaryCalculatorTool from "../components/tools/anniversary-calculator/AnniversaryCalculatorTool";
import AnniversaryFaqSection from "../components/tools/anniversary-calculator/AnniversaryFaqSection";
import { getToolById } from "../utils/tools";

export default function AnniversaryCalculatorPage() {
  const tool = getToolById("anniversary-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Anniversary Calculator - Count Years, Months & Days"
      seoDescription="Find out exactly how long it's been since your wedding, first date, or any milestone. Free anniversary calculator with a countdown to your next one."
      footer={<AnniversaryFaqSection />}
      wide
    >
      <AnniversaryCalculatorTool />
    </ToolPageWrapper>
  );
}
