import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UnitConverterTool from "../components/tools/unit-converter/UnitConverterTool";
import { getToolById } from "../utils/tools";

export default function UnitConverterPage() {
  const tool = getToolById("unit-converter");
  return (
    <ToolPageWrapper tool={tool}>
      <UnitConverterTool />
    </ToolPageWrapper>
  );
}
