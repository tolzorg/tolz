import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnnuityPayoutCalculatorTool from "../components/tools/annuity-payout-calculator/AnnuityPayoutCalculatorTool";
import AnnuityPayoutCalculatorFaqSection from "../components/tools/annuity-payout-calculator/AnnuityPayoutCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AnnuityPayoutCalculatorPage() {
  const tool = getToolById("annuity-payout-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Annuity Payout Calculator – Free Online Tool"
      seoDescription="Free annuity payout calculator: find your payment for a fixed length or see how long a set payment lasts, with a year-by-year schedule. No signup needed."
      footer={<AnnuityPayoutCalculatorFaqSection />}
      wide
    >
      <AnnuityPayoutCalculatorTool />
    </ToolPageWrapper>
  );
}
