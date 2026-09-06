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
const CurrencyCalculatorPage = lazy(() => import("./pages/CurrencyCalculatorPage"));
const InflationCalculatorPage = lazy(() => import("./pages/InflationCalculatorPage"));
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
                <Route path="/tools/currency-calculator"           element={<CurrencyCalculatorPage />} />
                <Route path="/tools/inflation-calculator"          element={<InflationCalculatorPage />} />
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
                <Route path="/calculators/financial/currency-calculator"           element={<CurrencyCalculatorPage />} />
                <Route path="/calculators/financial/inflation-calculator"          element={<InflationCalculatorPage />} />
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
