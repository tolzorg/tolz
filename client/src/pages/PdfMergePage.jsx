import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfMergeTool from "../components/tools/pdf-merge/PdfMergeTool";
import { getToolById } from "../utils/tools";

export default function PdfMergePage() {
  const tool = getToolById("pdf-merge");
  return (
    <ToolPageWrapper tool={tool}>
      <PdfMergeTool />
    </ToolPageWrapper>
  );
}
