import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ImageCompressorTool from "../components/tools/image-compressor/ImageCompressorTool";
import ImageCompressorFaqSection from "../components/tools/image-compressor/ImageCompressorFaqSection";
import { getToolById } from "../utils/tools";

export default function ImageCompressorPage() {
  const tool = getToolById("image-compressor");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Image Compressor – Compress Images Online"
      seoDescription="Compress JPEG, PNG, and WebP images online for free with Tolz. Reduce image file size without losing quality, no signup, no watermarks, fast and easy."
      footer={<ImageCompressorFaqSection />}
    >
      <ImageCompressorTool />
    </ToolPageWrapper>
  );
}
