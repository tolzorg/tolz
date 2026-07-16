import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfCompressTool from "../components/tools/pdf-compress/PdfCompressTool";
import PdfCompressFaqSection from "../components/tools/pdf-compress/PdfCompressFaqSection";
import { getToolById } from "../utils/tools";

export default function PdfCompressPage() {
  const tool = getToolById("pdf-compress");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Compress PDF Online Free - Reduce PDF Size"
      seoDescription="Compress PDF files online for free with Tolz. Shrink large PDFs fast without losing quality, no signup, no watermark, and secure in-browser processing."
      footer={<PdfCompressFaqSection />}
    >
      <PdfCompressTool />
    </ToolPageWrapper>
  );
}
