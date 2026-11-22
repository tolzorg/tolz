import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ChmodCalculatorTool from "../components/tools/chmod-calculator/ChmodCalculatorTool";
import ChmodCalculatorFaqSection from "../components/tools/chmod-calculator/ChmodCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ChmodCalculatorPage() {
  const tool = getToolById("chmod-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Chmod Calculator - Free Online Linux Permissions Tool"
      seoDescription="Use this free chmod calculator to build chmod commands, decode octal modes like 755 or 4755, and set setuid, setgid and sticky bit with confidence."
      footer={<ChmodCalculatorFaqSection />}
      wide
    >
      <ChmodCalculatorTool />
    </ToolPageWrapper>
  );
}
