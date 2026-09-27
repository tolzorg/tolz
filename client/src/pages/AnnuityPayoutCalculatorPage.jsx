import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import AnnuityPayoutCalculatorTool from "../components/tools/annuity-payout-calculator/AnnuityPayoutCalculatorTool";
import AnnuityPayoutCalculatorFaqSection from "../components/tools/annuity-payout-calculator/AnnuityPayoutCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function AnnuityPayoutCalculatorPage() {
  const tool = getToolById("annuity-payout-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Annuity Payout Calculator - Free Fixed Length & Fixed Payment"
      seoDescription="Calculate your annuity payout amount for a fixed length, or how long a fixed payment will last, with a full year-by-year balance schedule. Free, fast, and no signup required."
      footer={<AnnuityPayoutCalculatorFaqSection />}
      wide
    >
      <AnnuityPayoutCalculatorTool />
    </ToolPageWrapper>
  );
}
