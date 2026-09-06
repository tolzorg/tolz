import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SplitExcelTool from "../components/tools/split-excel/SplitExcelTool";
import SplitExcelFaqSection from "../components/tools/split-excel/SplitExcelFaqSection";
import { getToolById } from "../utils/tools";

export default function SplitExcelPage() {
  const tool = getToolById("split-excel");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Split Excel Files by Row Count - Free Online Tool"
      seoDescription="Split large Excel (XLS or XLSX) files into smaller files by row count. Free, no signup, no upload — everything runs in your browser."
      footer={<SplitExcelFaqSection />}
    >
      <SplitExcelTool />
    </ToolPageWrapper>
  );
}
