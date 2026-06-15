import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ImageCompressorTool from "../components/tools/image-compressor/ImageCompressorTool";
import { getToolById } from "../utils/tools";

export default function ImageCompressorPage() {
  const tool = getToolById("image-compressor");
  return (
    <ToolPageWrapper tool={tool}>
      <ImageCompressorTool />
    </ToolPageWrapper>
  );
}
