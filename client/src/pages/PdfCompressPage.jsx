import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PdfCompressTool from "../components/tools/pdf-compress/PdfCompressTool";
import { getToolById } from "../utils/tools";

export default function PdfCompressPage() {
  const tool = getToolById("pdf-compress");
  return (
    <ToolPageWrapper tool={tool}>
      <PdfCompressTool />
    </ToolPageWrapper>
  );
}
