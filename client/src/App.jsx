import { lazy, Suspense, Component, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { Spinner } from "./components/ui";

// Lazy-loaded pages
const HomePage                = lazy(() => import("./pages/HomePage"));
const ImageCompressorPage     = lazy(() => import("./pages/ImageCompressorPage"));
const ImageConverterPage      = lazy(() => import("./pages/ImageConverterPage"));
const ImageConverterSubPage   = lazy(() => import("./pages/ImageConverterSubPage"));
const PdfMergePage            = lazy(() => import("./pages/PdfMergePage"));
const PdfCompressPage         = lazy(() => import("./pages/PdfCompressPage"));
const PdfSplitPage            = lazy(() => import("./pages/PdfSplitPage"));
const PdfToWordPage           = lazy(() => import("./pages/PdfToWordPage"));
const CalorieTrackerPage      = lazy(() => import("./pages/CalorieTrackerPage"));
const DestinyMatrixPage       = lazy(() => import("./pages/DestinyMatrixPage"));
const SleepCalculatorPage     = lazy(() => import("./pages/SleepCalculatorPage"));
const UrlShortenerPage        = lazy(() => import("./pages/UrlShortenerPage"));
const WordCounterPage         = lazy(() => import("./pages/WordCounterPage"));
const QrGeneratorPage         = lazy(() => import("./pages/QrGeneratorPage"));
const UnitConverterPage       = lazy(() => import("./pages/UnitConverterPage"));
const ColorPickerPage              = lazy(() => import("./pages/ColorPickerPage"));
const AnniversaryCalculatorPage   = lazy(() => import("./pages/AnniversaryCalculatorPage"));
const PrivacyPage                  = lazy(() => import("./pages/PrivacyPage"));
const TermsPage                    = lazy(() => import("./pages/TermsPage"));
const AboutPage                    = lazy(() => import("./pages/AboutPage"));
const ContactPage                  = lazy(() => import("./pages/ContactPage"));
const NotFoundPage                 = lazy(() => import("./pages/NotFoundPage"));

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
      <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/"                                        element={<HomePage />} />
                <Route path="/tools/image-compressor"              element={<ImageCompressorPage />} />
                <Route path="/tools/image-converter"               element={<ImageConverterPage />} />
                <Route path="/tools/image-converter/:toolId"       element={<ImageConverterSubPage />} />
                <Route path="/tools/pdf-merge"                     element={<PdfMergePage />} />
                <Route path="/tools/pdf-compress"                  element={<PdfCompressPage />} />
                <Route path="/tools/pdf-split"                     element={<PdfSplitPage />} />
                <Route path="/tools/pdf-to-word"                   element={<PdfToWordPage />} />
                <Route path="/tools/calorie-tracker"               element={<CalorieTrackerPage />} />
                <Route path="/tools/destiny-matrix"               element={<DestinyMatrixPage />} />
                <Route path="/tools/sleep-calculator"              element={<SleepCalculatorPage />} />
                <Route path="/tools/url-shortener"                 element={<UrlShortenerPage />} />
                <Route path="/tools/word-counter"                  element={<WordCounterPage />} />
                <Route path="/tools/qr-generator"                  element={<QrGeneratorPage />} />
                <Route path="/tools/unit-converter"                element={<UnitConverterPage />} />
                <Route path="/tools/color-picker"                  element={<ColorPickerPage />} />
                <Route path="/tools/anniversary-calculator"        element={<AnniversaryCalculatorPage />} />
                <Route path="/privacy"                             element={<PrivacyPage />} />
                <Route path="/terms"                               element={<TermsPage />} />
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
