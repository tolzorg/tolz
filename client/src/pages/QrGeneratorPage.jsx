import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import QrGeneratorTool from "../components/tools/qr-generator/QrGeneratorTool";
import QrGeneratorFaqSection from "../components/tools/qr-generator/QrGeneratorFaqSection";
import { getToolById } from "../utils/tools";

export default function QrGeneratorPage() {
  const tool = getToolById("qr-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free QR Code Generator Online | No Signup"
      seoDescription="Create custom QR codes instantly with Tolz's free QR code generator. No signup, no watermark, download high-quality codes for URLs, text, WiFi & more."
      footer={<QrGeneratorFaqSection />}
    >
      <QrGeneratorTool />
    </ToolPageWrapper>
  );
}
