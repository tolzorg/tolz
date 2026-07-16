import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import DestinyMatrixTool from "../components/tools/destiny-matrix/DestinyMatrixTool";
import DestinyMatrixFaqSection from "../components/tools/destiny-matrix/DestinyMatrixFaqSection";
import { getToolById } from "../utils/tools";

export default function DestinyMatrixPage() {
  const tool = getToolById("destiny-matrix");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Destiny Matrix Calculator | Chart by Birth Date"
      seoDescription="Generate your free Destiny Matrix chart by date of birth. No signup, no cost. Discover your karmic tail, love line, money line, and life purpose."
      footer={<DestinyMatrixFaqSection />}
    >
      <DestinyMatrixTool />
    </ToolPageWrapper>
  );
}
