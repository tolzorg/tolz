import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RmdCalculatorTool from "../components/tools/rmd-calculator/RmdCalculatorTool";
import RmdCalculatorFaqSection from "../components/tools/rmd-calculator/RmdCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RmdCalculatorPage() {
  const tool = getToolById("rmd-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="RMD Calculator - Free Required Minimum Distribution Tool"
      seoDescription="Free RMD calculator using the IRS Uniform Lifetime and Joint Life tables. Get your required minimum distribution and see RMDs projected to age 120."
      footer={<RmdCalculatorFaqSection />}
      wide
    >
      <RmdCalculatorTool />
    </ToolPageWrapper>
  );
}
