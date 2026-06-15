import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfToWordTool from "../components/tools/pdf-to-word/PdfToWordTool";
import { getToolById } from "../utils/tools";

export default function PdfToWordPage() {
  const tool = getToolById("pdf-to-word");
  return (
    <ToolPageWrapper tool={tool}>
      <PdfToWordTool />
    </ToolPageWrapper>
  );
}
