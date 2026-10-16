import { lazy, Suspense, Component, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { Spinner } from "./components/ui";

// Lazy-loaded pages
const HomePage                = lazy(() => import("./pages/HomePage"));
const ImageCompressorPage     = lazy(() => import("./pages/ImageCompressorPage"));
const IdPhotoGeneratorPage    = lazy(() => import("./pages/IdPhotoGeneratorPage"));
const ImageConverterPage      = lazy(() => import("./pages/ImageConverterPage"));
const ImageConverterSubPage   = lazy(() => import("./pages/ImageConverterSubPage"));
const PdfMergePage            = lazy(() => import("./pages/PdfMergePage"));
const PdfCompressPage         = lazy(() => import("./pages/PdfCompressPage"));
const PdfSplitPage            = lazy(() => import("./pages/PdfSplitPage"));
const PdfToWordPage           = lazy(() => import("./pages/PdfToWordPage"));
const CalorieTrackerPage      = lazy(() => import("./pages/CalorieTrackerPage"));
const DestinyMatrixPage       = lazy(() => import("./pages/DestinyMatrixPage"));
const GrowAGardenCalculatorPage = lazy(() => import("./pages/GrowAGardenCalculatorPage"));
const SplitExcelPage          = lazy(() => import("./pages/SplitExcelPage"));
const MortgageCalculatorPage  = lazy(() => import("./pages/MortgageCalculatorPage"));
const LoanCalculatorPage      = lazy(() => import("./pages/LoanCalculatorPage"));
const AutoLoanCalculatorPage  = lazy(() => import("./pages/AutoLoanCalculatorPage"));
const InterestCalculatorPage  = lazy(() => import("./pages/InterestCalculatorPage"));
const PaymentCalculatorPage   = lazy(() => import("./pages/PaymentCalculatorPage"));
const RetirementCalculatorPage = lazy(() => import("./pages/RetirementCalculatorPage"));
const AmortizationCalculatorPage = lazy(() => import("./pages/AmortizationCalculatorPage"));
const InvestmentCalculatorPage = lazy(() => import("./pages/InvestmentCalculatorPage"));
const SavingsCalculatorPage = lazy(() => import("./pages/SavingsCalculatorPage"));
const AnnuityCalculatorPage = lazy(() => import("./pages/AnnuityCalculatorPage"));
const AnnuityPayoutCalculatorPage = lazy(() => import("./pages/AnnuityPayoutCalculatorPage"));
const CreditCardCalculatorPage = lazy(() => import("./pages/CreditCardCalculatorPage"));
const CreditCardPayoffCalculatorPage = lazy(() => import("./pages/CreditCardPayoffCalculatorPage"));
const DebtPayoffCalculatorPage = lazy(() => import("./pages/DebtPayoffCalculatorPage"));
const DebtConsolidationCalculatorPage = lazy(() => import("./pages/DebtConsolidationCalculatorPage"));
const RepaymentCalculatorPage = lazy(() => import("./pages/RepaymentCalculatorPage"));
const StudentLoanCalculatorPage = lazy(() => import("./pages/StudentLoanCalculatorPage"));
const CollegeCostCalculatorPage = lazy(() => import("./pages/CollegeCostCalculatorPage"));
const SimpleInterestCalculatorPage = lazy(() => import("./pages/SimpleInterestCalculatorPage"));
const CdCalculatorPage = lazy(() => import("./pages/CdCalculatorPage"));
const BondCalculatorPage = lazy(() => import("./pages/BondCalculatorPage"));
const MutualFundCalculatorPage = lazy(() => import("./pages/MutualFundCalculatorPage"));
const RothIraCalculatorPage = lazy(() => import("./pages/RothIraCalculatorPage"));
const IraCalculatorPage = lazy(() => import("./pages/IraCalculatorPage"));
const RmdCalculatorPage = lazy(() => import("./pages/RmdCalculatorPage"));
const VatCalculatorPage = lazy(() => import("./pages/VatCalculatorPage"));
const CashBackOrLowInterestCalculatorPage = lazy(() => import("./pages/CashBackOrLowInterestCalculatorPage"));
const AutoLeaseCalculatorPage = lazy(() => import("./pages/AutoLeaseCalculatorPage"));
const DepreciationCalculatorPage = lazy(() => import("./pages/DepreciationCalculatorPage"));
const AverageReturnCalculatorPage = lazy(() => import("./pages/AverageReturnCalculatorPage"));
const MarginCalculatorPage = lazy(() => import("./pages/MarginCalculatorPage"));
const DiscountCalculatorPage = lazy(() => import("./pages/DiscountCalculatorPage"));
const BusinessLoanCalculatorPage = lazy(() => import("./pages/BusinessLoanCalculatorPage"));
const DebtToIncomeCalculatorPage = lazy(() => import("./pages/DebtToIncomeCalculatorPage"));
const TakeHomePayCalculatorPage = lazy(() => import("./pages/TakeHomePayCalculatorPage"));
const PersonalLoanCalculatorPage = lazy(() => import("./pages/PersonalLoanCalculatorPage"));
const BoatLoanCalculatorPage = lazy(() => import("./pages/BoatLoanCalculatorPage"));
const LeaseCalculatorPage = lazy(() => import("./pages/LeaseCalculatorPage"));
const RefinanceCalculatorPage = lazy(() => import("./pages/RefinanceCalculatorPage"));
const BudgetCalculatorPage = lazy(() => import("./pages/BudgetCalculatorPage"));
const RentalPropertyCalculatorPage = lazy(() => import("./pages/RentalPropertyCalculatorPage"));
const IrrCalculatorPage = lazy(() => import("./pages/IrrCalculatorPage"));
const RoiCalculatorPage = lazy(() => import("./pages/RoiCalculatorPage"));
const AprCalculatorPage = lazy(() => import("./pages/AprCalculatorPage"));
const FhaLoanCalculatorPage = lazy(() => import("./pages/FhaLoanCalculatorPage"));
const VaMortgageCalculatorPage = lazy(() => import("./pages/VaMortgageCalculatorPage"));
const HomeEquityLoanCalculatorPage = lazy(() => import("./pages/HomeEquityLoanCalculatorPage"));
const HelocCalculatorPage = lazy(() => import("./pages/HelocCalculatorPage"));
const DownPaymentCalculatorPage = lazy(() => import("./pages/DownPaymentCalculatorPage"));
const RentVsBuyCalculatorPage = lazy(() => import("./pages/RentVsBuyCalculatorPage"));
const PaybackPeriodCalculatorPage = lazy(() => import("./pages/PaybackPeriodCalculatorPage"));
const PresentValueCalculatorPage = lazy(() => import("./pages/PresentValueCalculatorPage"));
const FutureValueCalculatorPage = lazy(() => import("./pages/FutureValueCalculatorPage"));
const CommissionCalculatorPage = lazy(() => import("./pages/CommissionCalculatorPage"));
const MortgageCalculatorUkPage = lazy(() => import("./pages/MortgageCalculatorUkPage"));
const CanadianMortgageCalculatorPage = lazy(() => import("./pages/CanadianMortgageCalculatorPage"));
const RentCalculatorPage = lazy(() => import("./pages/RentCalculatorPage"));
const MarriageTaxCalculatorPage = lazy(() => import("./pages/MarriageTaxCalculatorPage"));
const EstateTaxCalculatorPage = lazy(() => import("./pages/EstateTaxCalculatorPage"));
const PensionCalculatorPage = lazy(() => import("./pages/PensionCalculatorPage"));
const SocialSecurityCalculatorPage = lazy(() => import("./pages/SocialSecurityCalculatorPage"));
const CurrencyCalculatorPage = lazy(() => import("./pages/CurrencyCalculatorPage"));
const InflationCalculatorPage = lazy(() => import("./pages/InflationCalculatorPage"));
const FinanceCalculatorPage = lazy(() => import("./pages/FinanceCalculatorPage"));
const MortgagePayoffCalculatorPage = lazy(() => import("./pages/MortgagePayoffCalculatorPage"));
const CompoundInterestCalculatorPage = lazy(() => import("./pages/CompoundInterestCalculatorPage"));
const SalaryCalculatorPage = lazy(() => import("./pages/SalaryCalculatorPage"));
const Four01kCalculatorPage = lazy(() => import("./pages/Four01kCalculatorPage"));
const InterestRateCalculatorPage = lazy(() => import("./pages/InterestRateCalculatorPage"));
const SalesTaxCalculatorPage = lazy(() => import("./pages/SalesTaxCalculatorPage"));
const HouseAffordabilityCalculatorPage = lazy(() => import("./pages/HouseAffordabilityCalculatorPage"));
const SleepCalculatorPage     = lazy(() => import("./pages/SleepCalculatorPage"));
const UrlShortenerPage        = lazy(() => import("./pages/UrlShortenerPage"));
const WordCounterPage         = lazy(() => import("./pages/WordCounterPage"));
const SentenceCounterPage     = lazy(() => import("./pages/SentenceCounterPage"));
const WordFinderPage          = lazy(() => import("./pages/WordFinderPage"));
const CpsTesterPage           = lazy(() => import("./pages/CpsTesterPage"));
const JapaneseNameGeneratorPage = lazy(() => import("./pages/JapaneseNameGeneratorPage"));
const QrGeneratorPage         = lazy(() => import("./pages/QrGeneratorPage"));
const UnitConverterPage       = lazy(() => import("./pages/UnitConverterPage"));
const ColorPickerPage              = lazy(() => import("./pages/ColorPickerPage"));
const AnniversaryCalculatorPage   = lazy(() => import("./pages/AnniversaryCalculatorPage"));
const BoardFootCalculatorPage     = lazy(() => import("./pages/BoardFootCalculatorPage"));
const CubicYardCalculatorPage     = lazy(() => import("./pages/CubicYardCalculatorPage"));
const GallonsCalculatorPage       = lazy(() => import("./pages/GallonsCalculatorPage"));
const SizeToWeightCalculatorPage  = lazy(() => import("./pages/SizeToWeightCalculatorPage"));
const SqftToCubicYardsPage           = lazy(() => import("./pages/SqftToCubicYardsPage"));
const SquareFootageCalculatorPage    = lazy(() => import("./pages/SquareFootageCalculatorPage"));
const SquareYardsCalculatorPage      = lazy(() => import("./pages/SquareYardsCalculatorPage"));
const PrivacyPage                  = lazy(() => import("./pages/PrivacyPage"));
const TermsPage                    = lazy(() => import("./pages/TermsPage"));
const DisclaimerPage               = lazy(() => import("./pages/DisclaimerPage"));
const CopyrightPage                = lazy(() => import("./pages/CopyrightPage"));
const AboutPage                    = lazy(() => import("./pages/AboutPage"));
const ContactPage                  = lazy(() => import("./pages/ContactPage"));
const NotFoundPage                 = lazy(() => import("./pages/NotFoundPage"));
const CalculatorCategoryPage          = lazy(() => import("./pages/CalculatorCategoryPage"));
const CalculatorsHubPage              = lazy(() => import("./pages/CalculatorsHubPage"));
const ToolsCategoryPage               = lazy(() => import("./pages/ToolsCategoryPage"));
const AllCategoriesPage               = lazy(() => import("./pages/AllCategoriesPage"));
const AluminumWeightCalculatorPage    = lazy(() => import("./pages/AluminumWeightCalculatorPage"));
const RebarCalculatorPage             = lazy(() => import("./pages/RebarCalculatorPage"));
const RipRapCalculatorPage            = lazy(() => import("./pages/RipRapCalculatorPage"));
const BrickCalculatorPage             = lazy(() => import("./pages/BrickCalculatorPage"));
const RiverRockCalculatorPage         = lazy(() => import("./pages/RiverRockCalculatorPage"));
const BalusterCalculatorPage          = lazy(() => import("./pages/BalusterCalculatorPage"));
const RetainingWallCalculatorPage     = lazy(() => import("./pages/RetainingWallCalculatorPage"));
const BoardAndBattenCalculatorPage    = lazy(() => import("./components/tools/board-and-batten-calculator/BoardAndBattenCalculatorPage"));
const DeckingCalculatorPage           = lazy(() => import("./pages/DeckingCalculatorPage"));
const RollingOffsetCalculatorPage     = lazy(() => import("./pages/RollingOffsetCalculatorPage"));
const DiyShedCostCalculatorPage       = lazy(() => import("./pages/DiyShedCostCalculatorPage"));
const SagCalculatorPage               = lazy(() => import("./pages/SagCalculatorPage"));
const DrywallCalculatorPage           = lazy(() => import("./pages/DrywallCalculatorPage"));
const SandCalculatorPage              = lazy(() => import("./pages/SandCalculatorPage"));
const FireGlassCalculatorPage         = lazy(() => import("./pages/FireGlassCalculatorPage"));
const GlassWeightCalculatorPage       = lazy(() => import("./pages/GlassWeightCalculatorPage"));
const SealantCalculatorPage           = lazy(() => import("./pages/SealantCalculatorPage"));
const FramingCalculatorPage           = lazy(() => import("./pages/FramingCalculatorPage"));
const SonotubeCalculatorPage          = lazy(() => import("./pages/SonotubeCalculatorPage"));
const FrenchDrainCalculatorPage       = lazy(() => import("./pages/FrenchDrainCalculatorPage"));

// Page loader
function PageLoader() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Spinner size={24} />
    </div>
  );
}

// Error boundary
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            textAlign: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 32 }}>⚠️</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--text-primary)" }}>
            Something went wrong
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            Please refresh the page to try again.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (!apiUrl) return;
    const id = setInterval(() => {
      fetch(`${apiUrl}/health`, { mode: "no-cors" }).catch(() => {});
    }, 10 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"                                        element={<HomePage />} />
                <Route path="/browse-all-tools"                         element={<AllCategoriesPage />} />
                <Route path="/browsealltools"                          element={<Navigate to="/browse-all-tools" replace />} />
                <Route path="/tools/image-compressor"              element={<ImageCompressorPage />} />
                <Route path="/tools/id-photo-generator"             element={<IdPhotoGeneratorPage />} />
                <Route path="/tools/image-converter"               element={<ImageConverterPage />} />
                <Route path="/tools/image-converter/:toolId"       element={<ImageConverterSubPage />} />
                <Route path="/tools/pdf-merge"                     element={<PdfMergePage />} />
                <Route path="/tools/pdf-compress"                  element={<PdfCompressPage />} />
                <Route path="/tools/pdf-split"                     element={<PdfSplitPage />} />
                <Route path="/tools/pdf-to-word"                   element={<PdfToWordPage />} />
                <Route path="/tools/calorie-tracker"               element={<CalorieTrackerPage />} />
                <Route path="/tools/destiny-matrix"               element={<DestinyMatrixPage />} />
                <Route path="/tools/grow-a-garden-calculator"      element={<GrowAGardenCalculatorPage />} />
                <Route path="/tools/split-excel"                   element={<SplitExcelPage />} />
                <Route path="/tools/mortgage-calculator"           element={<MortgageCalculatorPage />} />
                <Route path="/tools/loan-calculator"               element={<LoanCalculatorPage />} />
                <Route path="/tools/auto-loan-calculator"          element={<AutoLoanCalculatorPage />} />
                <Route path="/tools/interest-calculator"           element={<InterestCalculatorPage />} />
                <Route path="/tools/payment-calculator"            element={<PaymentCalculatorPage />} />
                <Route path="/tools/retirement-calculator"         element={<RetirementCalculatorPage />} />
                <Route path="/tools/amortization-calculator"       element={<AmortizationCalculatorPage />} />
                <Route path="/tools/investment-calculator"         element={<InvestmentCalculatorPage />} />
                <Route path="/tools/savings-calculator"             element={<SavingsCalculatorPage />} />
                <Route path="/tools/annuity-calculator"             element={<AnnuityCalculatorPage />} />
                <Route path="/tools/annuity-payout-calculator"      element={<AnnuityPayoutCalculatorPage />} />
                <Route path="/tools/credit-card-calculator"         element={<CreditCardCalculatorPage />} />
                <Route path="/tools/credit-card-payoff-calculator"  element={<CreditCardPayoffCalculatorPage />} />
                <Route path="/tools/debt-payoff-calculator"         element={<DebtPayoffCalculatorPage />} />
                <Route path="/tools/debt-consolidation-calculator"  element={<DebtConsolidationCalculatorPage />} />
                <Route path="/tools/repayment-calculator"           element={<RepaymentCalculatorPage />} />
                <Route path="/tools/student-loan-calculator"        element={<StudentLoanCalculatorPage />} />
                <Route path="/tools/college-cost-calculator"        element={<CollegeCostCalculatorPage />} />
                <Route path="/tools/simple-interest-calculator"     element={<SimpleInterestCalculatorPage />} />
                <Route path="/tools/cd-calculator"                  element={<CdCalculatorPage />} />
                <Route path="/tools/bond-calculator"                element={<BondCalculatorPage />} />
                <Route path="/tools/mutual-fund-calculator"         element={<MutualFundCalculatorPage />} />
                <Route path="/tools/roth-ira-calculator"            element={<RothIraCalculatorPage />} />
                <Route path="/tools/ira-calculator"                 element={<IraCalculatorPage />} />
                <Route path="/tools/rmd-calculator"                 element={<RmdCalculatorPage />} />
                <Route path="/tools/vat-calculator"                 element={<VatCalculatorPage />} />
                <Route path="/tools/cash-back-or-low-interest-calculator" element={<CashBackOrLowInterestCalculatorPage />} />
                <Route path="/tools/auto-lease-calculator" element={<AutoLeaseCalculatorPage />} />
                <Route path="/tools/depreciation-calculator" element={<DepreciationCalculatorPage />} />
                <Route path="/tools/average-return-calculator" element={<AverageReturnCalculatorPage />} />
                <Route path="/tools/margin-calculator" element={<MarginCalculatorPage />} />
                <Route path="/tools/discount-calculator" element={<DiscountCalculatorPage />} />
                <Route path="/tools/business-loan-calculator" element={<BusinessLoanCalculatorPage />} />
                <Route path="/tools/debt-to-income-calculator" element={<DebtToIncomeCalculatorPage />} />
                <Route path="/tools/take-home-pay-calculator" element={<TakeHomePayCalculatorPage />} />
                <Route path="/tools/personal-loan-calculator" element={<PersonalLoanCalculatorPage />} />
                <Route path="/tools/boat-loan-calculator" element={<BoatLoanCalculatorPage />} />
                <Route path="/tools/lease-calculator" element={<LeaseCalculatorPage />} />
                <Route path="/tools/refinance-calculator" element={<RefinanceCalculatorPage />} />
                <Route path="/tools/budget-calculator" element={<BudgetCalculatorPage />} />
                <Route path="/tools/rental-property-calculator" element={<RentalPropertyCalculatorPage />} />
                <Route path="/tools/irr-calculator" element={<IrrCalculatorPage />} />
                <Route path="/tools/roi-calculator" element={<RoiCalculatorPage />} />
                <Route path="/tools/apr-calculator" element={<AprCalculatorPage />} />
                <Route path="/tools/fha-loan-calculator" element={<FhaLoanCalculatorPage />} />
                <Route path="/tools/va-mortgage-calculator" element={<VaMortgageCalculatorPage />} />
                <Route path="/tools/home-equity-loan-calculator" element={<HomeEquityLoanCalculatorPage />} />
                <Route path="/tools/heloc-calculator" element={<HelocCalculatorPage />} />
                <Route path="/tools/down-payment-calculator" element={<DownPaymentCalculatorPage />} />
                <Route path="/tools/rent-vs-buy-calculator" element={<RentVsBuyCalculatorPage />} />
                <Route path="/tools/payback-period-calculator" element={<PaybackPeriodCalculatorPage />} />
                <Route path="/tools/present-value-calculator" element={<PresentValueCalculatorPage />} />
                <Route path="/tools/future-value-calculator" element={<FutureValueCalculatorPage />} />
                <Route path="/tools/commission-calculator" element={<CommissionCalculatorPage />} />
                <Route path="/tools/mortgage-calculator-uk" element={<MortgageCalculatorUkPage />} />
                <Route path="/tools/canadian-mortgage-calculator" element={<CanadianMortgageCalculatorPage />} />
                <Route path="/tools/rent-calculator"                 element={<RentCalculatorPage />} />
                <Route path="/tools/marriage-tax-calculator"         element={<MarriageTaxCalculatorPage />} />
                <Route path="/tools/estate-tax-calculator"           element={<EstateTaxCalculatorPage />} />
                <Route path="/tools/pension-calculator"              element={<PensionCalculatorPage />} />
                <Route path="/tools/social-security-calculator"      element={<SocialSecurityCalculatorPage />} />
                <Route path="/tools/currency-calculator"           element={<CurrencyCalculatorPage />} />
                <Route path="/tools/inflation-calculator"          element={<InflationCalculatorPage />} />
                <Route path="/tools/finance-calculator"            element={<FinanceCalculatorPage />} />
                <Route path="/tools/mortgage-payoff-calculator"    element={<MortgagePayoffCalculatorPage />} />
                <Route path="/tools/compound-interest-calculator"  element={<CompoundInterestCalculatorPage />} />
                <Route path="/tools/salary-calculator"             element={<SalaryCalculatorPage />} />
                <Route path="/tools/401k-calculator"               element={<Four01kCalculatorPage />} />
                <Route path="/tools/interest-rate-calculator"      element={<InterestRateCalculatorPage />} />
                <Route path="/tools/sales-tax-calculator"          element={<SalesTaxCalculatorPage />} />
                <Route path="/tools/house-affordability-calculator" element={<HouseAffordabilityCalculatorPage />} />
                <Route path="/tools/sleep-calculator"              element={<SleepCalculatorPage />} />
                <Route path="/tools/url-shortener"                 element={<UrlShortenerPage />} />
                <Route path="/tools/word-counter"                  element={<WordCounterPage />} />
                <Route path="/tools/sentence-counter"              element={<SentenceCounterPage />} />
                <Route path="/tools/word-finder"                   element={<WordFinderPage />} />
                <Route path="/tools/cps-tester"                    element={<CpsTesterPage />} />
                <Route path="/tools/japanese-name-generator"       element={<JapaneseNameGeneratorPage />} />
                <Route path="/tools/qr-generator"                  element={<QrGeneratorPage />} />
                <Route path="/tools/unit-converter"                element={<UnitConverterPage />} />
                <Route path="/tools/color-picker"                  element={<ColorPickerPage />} />
                <Route path="/tools/anniversary-calculator"        element={<AnniversaryCalculatorPage />} />
                <Route path="/tools/board-foot-calculator"         element={<BoardFootCalculatorPage />} />
                <Route path="/tools/cubic-yard-calculator"         element={<CubicYardCalculatorPage />} />
                <Route path="/tools/gallons-calculator"            element={<GallonsCalculatorPage />} />
                <Route path="/tools/size-to-weight-calculator"    element={<SizeToWeightCalculatorPage />} />
                <Route path="/tools/sqft-to-cubic-yards"          element={<SqftToCubicYardsPage />} />
                <Route path="/tools/square-footage-calculator"    element={<SquareFootageCalculatorPage />} />
                <Route path="/tools/square-yards-calculator"      element={<SquareYardsCalculatorPage />} />
                <Route path="/tools/aluminum-weight-calculator"   element={<AluminumWeightCalculatorPage />} />
                {/* ── Tool category landing pages (Image, PDF, Converters, URL, Text, Design) ── */}
                <Route path="/tools/:categorySlug"                 element={<ToolsCategoryPage />} />

                {/* ── Calculators hub + category pages ──────────────────── */}
                <Route path="/calculators"                                         element={<CalculatorsHubPage />} />
                <Route path="/calculators/:categorySlug"                           element={<CalculatorCategoryPage />} />

                {/* ── Individual calculator pages (new canonical URLs) ───── */}
                <Route path="/calculators/health/calorie-tracker"                  element={<CalorieTrackerPage />} />
                <Route path="/calculators/health/sleep-calculator"                 element={<SleepCalculatorPage />} />
                <Route path="/calculators/everyday-life/anniversary"               element={<AnniversaryCalculatorPage />} />
                <Route path="/calculators/everyday-life/destiny-matrix"            element={<DestinyMatrixPage />} />
                <Route path="/calculators/garden/grow-a-garden-calculator"          element={<GrowAGardenCalculatorPage />} />
                <Route path="/calculators/financial/mortgage-calculator"           element={<MortgageCalculatorPage />} />
                <Route path="/calculators/financial/loan-calculator"               element={<LoanCalculatorPage />} />
                <Route path="/calculators/financial/auto-loan-calculator"          element={<AutoLoanCalculatorPage />} />
                <Route path="/calculators/financial/interest-calculator"           element={<InterestCalculatorPage />} />
                <Route path="/calculators/financial/payment-calculator"            element={<PaymentCalculatorPage />} />
                <Route path="/calculators/financial/retirement-calculator"         element={<RetirementCalculatorPage />} />
                <Route path="/calculators/financial/amortization-calculator"       element={<AmortizationCalculatorPage />} />
                <Route path="/calculators/financial/investment-calculator"         element={<InvestmentCalculatorPage />} />
                <Route path="/calculators/financial/savings-calculator"             element={<SavingsCalculatorPage />} />
                <Route path="/calculators/financial/annuity-calculator"             element={<AnnuityCalculatorPage />} />
                <Route path="/calculators/financial/annuity-payout-calculator"      element={<AnnuityPayoutCalculatorPage />} />
                <Route path="/calculators/financial/credit-card-calculator"         element={<CreditCardCalculatorPage />} />
                <Route path="/calculators/financial/credit-card-payoff-calculator"  element={<CreditCardPayoffCalculatorPage />} />
                <Route path="/calculators/financial/debt-payoff-calculator"         element={<DebtPayoffCalculatorPage />} />
                <Route path="/calculators/financial/debt-consolidation-calculator"  element={<DebtConsolidationCalculatorPage />} />
                <Route path="/calculators/financial/repayment-calculator"           element={<RepaymentCalculatorPage />} />
                <Route path="/calculators/financial/student-loan-calculator"        element={<StudentLoanCalculatorPage />} />
                <Route path="/calculators/financial/college-cost-calculator"        element={<CollegeCostCalculatorPage />} />
                <Route path="/calculators/financial/simple-interest-calculator"     element={<SimpleInterestCalculatorPage />} />
                <Route path="/calculators/financial/cd-calculator"                  element={<CdCalculatorPage />} />
                <Route path="/calculators/financial/bond-calculator"                element={<BondCalculatorPage />} />
                <Route path="/calculators/financial/mutual-fund-calculator"         element={<MutualFundCalculatorPage />} />
                <Route path="/calculators/financial/roth-ira-calculator"            element={<RothIraCalculatorPage />} />
                <Route path="/calculators/financial/ira-calculator"                 element={<IraCalculatorPage />} />
                <Route path="/calculators/financial/rmd-calculator"                 element={<RmdCalculatorPage />} />
                <Route path="/calculators/financial/vat-calculator"                 element={<VatCalculatorPage />} />
                <Route path="/calculators/financial/cash-back-or-low-interest-calculator" element={<CashBackOrLowInterestCalculatorPage />} />
                <Route path="/calculators/financial/auto-lease-calculator" element={<AutoLeaseCalculatorPage />} />
                <Route path="/calculators/financial/depreciation-calculator" element={<DepreciationCalculatorPage />} />
                <Route path="/calculators/financial/average-return-calculator" element={<AverageReturnCalculatorPage />} />
                <Route path="/calculators/financial/margin-calculator" element={<MarginCalculatorPage />} />
                <Route path="/calculators/financial/discount-calculator" element={<DiscountCalculatorPage />} />
                <Route path="/calculators/financial/business-loan-calculator" element={<BusinessLoanCalculatorPage />} />
                <Route path="/calculators/financial/debt-to-income-calculator" element={<DebtToIncomeCalculatorPage />} />
                <Route path="/calculators/financial/take-home-pay-calculator" element={<TakeHomePayCalculatorPage />} />
                <Route path="/calculators/financial/personal-loan-calculator" element={<PersonalLoanCalculatorPage />} />
                <Route path="/calculators/financial/boat-loan-calculator" element={<BoatLoanCalculatorPage />} />
                <Route path="/calculators/financial/lease-calculator" element={<LeaseCalculatorPage />} />
                <Route path="/calculators/financial/refinance-calculator" element={<RefinanceCalculatorPage />} />
                <Route path="/calculators/financial/budget-calculator" element={<BudgetCalculatorPage />} />
                <Route path="/calculators/financial/rental-property-calculator" element={<RentalPropertyCalculatorPage />} />
                <Route path="/calculators/financial/irr-calculator" element={<IrrCalculatorPage />} />
                <Route path="/calculators/financial/roi-calculator" element={<RoiCalculatorPage />} />
                <Route path="/calculators/financial/apr-calculator" element={<AprCalculatorPage />} />
                <Route path="/calculators/financial/fha-loan-calculator" element={<FhaLoanCalculatorPage />} />
                <Route path="/calculators/financial/va-mortgage-calculator" element={<VaMortgageCalculatorPage />} />
                <Route path="/calculators/financial/home-equity-loan-calculator" element={<HomeEquityLoanCalculatorPage />} />
                <Route path="/calculators/financial/heloc-calculator" element={<HelocCalculatorPage />} />
                <Route path="/calculators/financial/down-payment-calculator" element={<DownPaymentCalculatorPage />} />
                <Route path="/calculators/financial/rent-vs-buy-calculator" element={<RentVsBuyCalculatorPage />} />
                <Route path="/calculators/financial/payback-period-calculator" element={<PaybackPeriodCalculatorPage />} />
                <Route path="/calculators/financial/present-value-calculator" element={<PresentValueCalculatorPage />} />
                <Route path="/calculators/financial/future-value-calculator" element={<FutureValueCalculatorPage />} />
                <Route path="/calculators/financial/commission-calculator" element={<CommissionCalculatorPage />} />
                <Route path="/calculators/financial/mortgage-calculator-uk" element={<MortgageCalculatorUkPage />} />
                <Route path="/calculators/financial/canadian-mortgage-calculator" element={<CanadianMortgageCalculatorPage />} />
                <Route path="/calculators/financial/rent-calculator"                 element={<RentCalculatorPage />} />
                <Route path="/calculators/financial/marriage-tax-calculator"         element={<MarriageTaxCalculatorPage />} />
                <Route path="/calculators/financial/estate-tax-calculator"           element={<EstateTaxCalculatorPage />} />
                <Route path="/calculators/financial/pension-calculator"              element={<PensionCalculatorPage />} />
                <Route path="/calculators/financial/social-security-calculator"      element={<SocialSecurityCalculatorPage />} />
                <Route path="/calculators/financial/currency-calculator"           element={<CurrencyCalculatorPage />} />
                <Route path="/calculators/financial/inflation-calculator"          element={<InflationCalculatorPage />} />
                <Route path="/calculators/financial/finance-calculator"            element={<FinanceCalculatorPage />} />
                <Route path="/calculators/financial/mortgage-payoff-calculator"    element={<MortgagePayoffCalculatorPage />} />
                <Route path="/calculators/financial/compound-interest-calculator"  element={<CompoundInterestCalculatorPage />} />
                <Route path="/calculators/financial/salary-calculator"             element={<SalaryCalculatorPage />} />
                <Route path="/calculators/financial/401k-calculator"               element={<Four01kCalculatorPage />} />
                <Route path="/calculators/financial/interest-rate-calculator"      element={<InterestRateCalculatorPage />} />
                <Route path="/calculators/financial/sales-tax-calculator"          element={<SalesTaxCalculatorPage />} />
                <Route path="/calculators/financial/house-affordability-calculator" element={<HouseAffordabilityCalculatorPage />} />
                <Route path="/calculators/construction/square-footage"             element={<SquareFootageCalculatorPage />} />
                <Route path="/calculators/construction/square-yards"               element={<SquareYardsCalculatorPage />} />
                <Route path="/calculators/construction/cubic-yard"                 element={<CubicYardCalculatorPage />} />
                <Route path="/calculators/construction/sqft-to-cubic-yards"        element={<SqftToCubicYardsPage />} />
                <Route path="/calculators/construction/gallons"                    element={<GallonsCalculatorPage />} />
                <Route path="/calculators/construction/board-foot"                 element={<BoardFootCalculatorPage />} />
                <Route path="/calculators/construction/size-to-weight"             element={<SizeToWeightCalculatorPage />} />
                <Route path="/calculators/construction/aluminum-weight"            element={<AluminumWeightCalculatorPage />} />
                <Route path="/calculators/construction-materials/aluminum-weight"  element={<AluminumWeightCalculatorPage />} />
                <Route path="/calculators/construction/rebar"                      element={<RebarCalculatorPage />} />
                <Route path="/calculators/construction/rip-rap"                   element={<RipRapCalculatorPage />} />
                <Route path="/calculators/construction/brick"                     element={<BrickCalculatorPage />} />
                <Route path="/calculators/construction/river-rock"               element={<RiverRockCalculatorPage />} />
                <Route path="/calculators/construction/baluster"                   element={<BalusterCalculatorPage />} />
                <Route path="/calculators/construction/retaining-wall"            element={<RetainingWallCalculatorPage />} />
                <Route path="/calculators/construction/board-and-batten"         element={<BoardAndBattenCalculatorPage />} />
                <Route path="/calculators/construction/decking"                   element={<DeckingCalculatorPage />} />
                <Route path="/calculators/construction/rolling-offset"           element={<RollingOffsetCalculatorPage />} />
                <Route path="/calculators/construction/diy-shed-cost"            element={<DiyShedCostCalculatorPage />} />
                <Route path="/calculators/construction/sag"                      element={<SagCalculatorPage />} />
                <Route path="/calculators/construction/drywall"                  element={<DrywallCalculatorPage />} />
                <Route path="/calculators/construction/sand"                     element={<SandCalculatorPage />} />
                <Route path="/calculators/construction/fire-glass"               element={<FireGlassCalculatorPage />} />
                <Route path="/calculators/construction/glass-weight"             element={<GlassWeightCalculatorPage />} />
                <Route path="/calculators/construction/sealant"                  element={<SealantCalculatorPage />} />
                <Route path="/calculators/construction/framing"                  element={<FramingCalculatorPage />} />
                <Route path="/calculators/construction/sonotube"                 element={<SonotubeCalculatorPage />} />
                <Route path="/calculators/construction/french-drain"             element={<FrenchDrainCalculatorPage />} />

                <Route path="/privacy"                             element={<PrivacyPage />} />
                <Route path="/terms"                               element={<TermsPage />} />
                <Route path="/disclaimer"                          element={<DisclaimerPage />} />
                <Route path="/copyright"                           element={<CopyrightPage />} />
                <Route path="/about"                               element={<AboutPage />} />
                <Route path="/contact"                             element={<ContactPage />} />
                <Route path="*"                                    element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
