import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import FramingCalculatorTool from "../components/tools/framing-calculator/FramingCalculatorTool";
import FramingCalculatorFaqSection from "../components/tools/framing-calculator/FramingCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function FramingCalculatorPage() {
  const tool = getToolById("framing-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Framing Calculator | Free Wall Stud & Spacing Tool"
      seoDescription="Calculate exact wall studs, OC spacing, waste, and lumber cost with our free framing calculator. No signup, instant results for any wall length."
      footer={<FramingCalculatorFaqSection />}
    >
      <FramingCalculatorTool />
    </ToolPageWrapper>
  );
}
