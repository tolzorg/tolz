import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ColorPickerTool from "../components/tools/color-picker/ColorPickerTool";
import { getToolById } from "../utils/tools";

export default function ColorPickerPage() {
  const tool = getToolById("color-picker");
  return (
    <ToolPageWrapper tool={tool}>
      <ColorPickerTool />
    </ToolPageWrapper>
  );
}
