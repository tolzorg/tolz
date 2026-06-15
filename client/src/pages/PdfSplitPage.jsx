import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfSplitTool from "../components/tools/pdf-split/PdfSplitTool";
import { getToolById } from "../utils/tools";

export default function PdfSplitPage() {
  const tool = getToolById("pdf-split");
  return (
    <ToolPageWrapper tool={tool}>
      <PdfSplitTool />
    </ToolPageWrapper>
  );
}
