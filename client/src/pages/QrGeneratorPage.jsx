import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import QrGeneratorTool from "../components/tools/qr-generator/QrGeneratorTool";
import { getToolById } from "../utils/tools";

export default function QrGeneratorPage() {
  const tool = getToolById("qr-generator");
  return (
    <ToolPageWrapper tool={tool}>
      <QrGeneratorTool />
    </ToolPageWrapper>
  );
}
