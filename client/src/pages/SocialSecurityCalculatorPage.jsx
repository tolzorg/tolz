import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SocialSecurityCalculatorTool from "../components/tools/social-security-calculator/SocialSecurityCalculatorTool";
import SocialSecurityCalculatorFaqSection from "../components/tools/social-security-calculator/SocialSecurityCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function SocialSecurityCalculatorPage() {
  const tool = getToolById("social-security-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Social Security Calculator - Best Age to Claim Benefits"
      seoDescription="Free Social Security calculator to find your best age to claim retirement benefits or compare two claiming ages side by side. No signup, instant results."
      footer={<SocialSecurityCalculatorFaqSection />}
      wide
    >
      <SocialSecurityCalculatorTool />
    </ToolPageWrapper>
  );
}
