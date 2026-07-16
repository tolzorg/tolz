import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfToWordTool from "../components/tools/pdf-to-word/PdfToWordTool";
import PdfToWordFaqSection from "../components/tools/pdf-to-word/PdfToWordFaqSection";
import { getToolById } from "../utils/tools";

export default function PdfToWordPage() {
  const tool = getToolById("pdf-to-word");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free PDF to Word Converter | Convert PDF to DOCX Online"
      seoDescription="Convert PDF to Word online for free with Tolz. Turn any PDF into an editable DOCX in seconds - no signup, no watermark, and your files stay private."
      footer={<PdfToWordFaqSection />}
    >
      <PdfToWordTool />
    </ToolPageWrapper>
  );
}
