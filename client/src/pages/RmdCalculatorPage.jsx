import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import RmdCalculatorTool from "../components/tools/rmd-calculator/RmdCalculatorTool";
import RmdCalculatorFaqSection from "../components/tools/rmd-calculator/RmdCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function RmdCalculatorPage() {
  const tool = getToolById("rmd-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="RMD Calculator - Required Minimum Distribution by Age"
      seoDescription="Calculate your required minimum distribution with the IRS Uniform Lifetime and Joint Life tables (Publication 590-B), and project your RMDs and balance every year to age 120. Free, no signup."
      footer={<RmdCalculatorFaqSection />}
      wide
    >
      <RmdCalculatorTool />
    </ToolPageWrapper>
  );
}
