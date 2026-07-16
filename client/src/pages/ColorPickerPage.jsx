import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ColorPickerTool from "../components/tools/color-picker/ColorPickerTool";
import ColorPickerFaqSection from "../components/tools/color-picker/ColorPickerFaqSection";
import { getToolById } from "../utils/tools";

export default function ColorPickerPage() {
  const tool = getToolById("color-picker");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Online Color Picker Tool | Get HEX, RGB & HSL"
      seoDescription="Pick any color and instantly get HEX, RGB, and HSL codes with our free online color picker. No signup, no downloads, just accurate results."
      footer={<ColorPickerFaqSection />}
    >
      <ColorPickerTool />
    </ToolPageWrapper>
  );
}
