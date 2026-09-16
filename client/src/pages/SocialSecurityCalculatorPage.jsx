import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SocialSecurityCalculatorTool from "../components/tools/social-security-calculator/SocialSecurityCalculatorTool";
import SocialSecurityCalculatorFaqSection from "../components/tools/social-security-calculator/SocialSecurityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SocialSecurityCalculatorPage() {
  const tool = getToolById("social-security-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Social Security Calculator - Ideal Application Age"
      seoDescription="Find the ideal age to apply for Social Security retirement benefits, or compare the financial difference between two application ages. Free, fast, and no signup required."
      footer={<SocialSecurityCalculatorFaqSection />}
      wide
    >
      <SocialSecurityCalculatorTool />
    </ToolPageWrapper>
  );
}
