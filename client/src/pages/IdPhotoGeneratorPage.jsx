import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import IdPhotoGeneratorTool from "../components/tools/id-photo-generator/IdPhotoGeneratorTool";
import IdPhotoGeneratorFaqSection from "../components/tools/id-photo-generator/IdPhotoGeneratorFaqSection";
import { getToolById } from "../utils/tools";

export default function IdPhotoGeneratorPage() {
  const tool = getToolById("id-photo-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Passport Photo Maker Online | Free ID Photo Generator"
      seoDescription="Make compliant passport, visa & ID photos at home. Crop to size, build 4x6 print sheets with bleed guides, export PDF or JPEG. Free, no signup."
      footer={<IdPhotoGeneratorFaqSection />}
    >
      <IdPhotoGeneratorTool />
    </ToolPageWrapper>
  );
}
