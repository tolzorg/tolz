import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfSplitTool from "../components/tools/pdf-split/PdfSplitTool";
import PdfSplitFaqSection from "../components/tools/pdf-split/PdfSplitFaqSection";
import { getToolById } from "../utils/tools";

export default function PdfSplitPage() {
  const tool = getToolById("pdf-split");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Split PDF Online Free | Separate & Extract PDF Pages"
      seoDescription="Split PDF files online for free. Separate, extract, or divide PDF pages into multiple files in seconds - no signup, no watermark, secure, and easy to use."
      footer={<PdfSplitFaqSection />}
    >
      <PdfSplitTool />
    </ToolPageWrapper>
  );
}
