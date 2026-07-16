import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfMergeTool from "../components/tools/pdf-merge/PdfMergeTool";
import PdfMergeFaqSection from "../components/tools/pdf-merge/PdfMergeFaqSection";
import { getToolById } from "../utils/tools";

export default function PdfMergePage() {
  const tool = getToolById("pdf-merge");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Merge PDF - Combine PDF Files Free Online"
      seoDescription="Merge PDF files into one document online for free. Combine multiple PDFs fast with no signup, no watermark, and secure processing. Try the Tolz merger now."
      footer={<PdfMergeFaqSection />}
    >
      <PdfMergeTool />
    </ToolPageWrapper>
  );
}
