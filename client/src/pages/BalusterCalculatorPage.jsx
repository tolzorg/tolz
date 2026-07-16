import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import BalusterCalculatorTool from "../components/tools/baluster-calculator/BalusterCalculatorTool";
import BalusterCalculatorFaqSection from "../components/tools/baluster-calculator/BalusterCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function BalusterCalculatorPage() {
  const tool = getToolById("baluster-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Baluster Calculator | Free Spacing & Quantity Tool"
      seoDescription="Calculate exact baluster count and spacing for stairs or straight railings. Free, code-compliant tool with instant pricing. No signup needed."
      footer={<BalusterCalculatorFaqSection />}
    >
      <BalusterCalculatorTool />
    </ToolPageWrapper>
  );
}
