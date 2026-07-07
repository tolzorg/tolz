import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IdPhotoGeneratorTool from "../components/tools/id-photo-generator/IdPhotoGeneratorTool";
import { getToolById } from "../utils/tools";

export default function IdPhotoGeneratorPage() {
  const tool = getToolById("id-photo-generator");
  return (
    <ToolPageWrapper tool={tool}>
      <IdPhotoGeneratorTool />
    </ToolPageWrapper>
  );
}
