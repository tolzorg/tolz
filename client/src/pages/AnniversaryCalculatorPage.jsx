import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnniversaryCalculatorTool from "../components/tools/anniversary-calculator/AnniversaryCalculatorTool";
import AnniversaryFaqSection from "../components/tools/anniversary-calculator/AnniversaryFaqSection";
import { getToolById } from "../utils/tools";

export default function AnniversaryCalculatorPage() {
  const tool = getToolById("anniversary-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Anniversary Calculator | Free Online Tool"
      seoDescription="Calculate years, months, and days since any anniversary instantly. Free, accurate, no signup needed, try Tolz's Anniversary Calculator now."
      footer={<AnniversaryFaqSection />}
    >
      <AnniversaryCalculatorTool />
    </ToolPageWrapper>
  );
}
