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
      seoDescription="Free Destiny Matrix calculator. Enter your birth date to get your chart, karmic tail, love line, money line, and life purpose. No signup needed."
      footer={<DestinyMatrixFaqSection />}
    >
      <DestinyMatrixTool />
    </ToolPageWrapper>
  );
}
