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
      seoDescription="Create compliant passport, visa & ID photos in seconds. Crop to size, add print sheets with bleed guides, and export PDF or JPEG, free, no signup."
      footer={<IdPhotoGeneratorFaqSection />}
    >
      <IdPhotoGeneratorTool />
    </ToolPageWrapper>
  );
}
