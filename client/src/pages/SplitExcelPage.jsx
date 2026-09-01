import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SplitExcelTool from "../components/tools/split-excel/SplitExcelTool";
import SplitExcelFaqSection from "../components/tools/split-excel/SplitExcelFaqSection";
import { getToolById } from "../utils/tools";

export default function SplitExcelPage() {
  const tool = getToolById("split-excel");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Split Excel File – Split XLS/XLSX by Row Count Free"
      seoDescription="Split a large Excel (XLS or XLSX) spreadsheet into several smaller XLSX files by row count. Free, no signup, runs entirely in your browser."
      footer={<SplitExcelFaqSection />}
    >
      <SplitExcelTool />
    </ToolPageWrapper>
  );
}
