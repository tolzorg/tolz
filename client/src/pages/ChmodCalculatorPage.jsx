import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ChmodCalculatorTool from "../components/tools/chmod-calculator/ChmodCalculatorTool";
import ChmodCalculatorFaqSection from "../components/tools/chmod-calculator/ChmodCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ChmodCalculatorPage() {
  const tool = getToolById("chmod-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Chmod Calculator - Linux File Permissions (755, 644, 4755)"
      seoDescription="Free chmod calculator: build the chmod command for read, write and execute permissions, or decode octal modes like 755, 644 and 4755 into symbolic form."
      footer={<ChmodCalculatorFaqSection />}
      wide
    >
      <ChmodCalculatorTool />
    </ToolPageWrapper>
  );
}
