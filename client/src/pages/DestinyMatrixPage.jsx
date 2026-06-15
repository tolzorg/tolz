import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DestinyMatrixTool from "../components/tools/destiny-matrix/DestinyMatrixTool";
import { getToolById } from "../utils/tools";

export default function DestinyMatrixPage() {
  const tool = getToolById("destiny-matrix");
  return (
    <ToolPageWrapper tool={tool}>
      <DestinyMatrixTool />
    </ToolPageWrapper>
  );
}
