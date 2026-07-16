import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UnitConverterTool from "../components/tools/unit-converter/UnitConverterTool";
import UnitConverterFaqSection from "../components/tools/unit-converter/UnitConverterFaqSection";
import { getToolById } from "../utils/tools";

export default function UnitConverterPage() {
  const tool = getToolById("unit-converter");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Unit Converter Online | Fast & Accurate"
      seoDescription="Convert length, weight, temperature, data, energy, pressure, and more with Tolz's free unit converter. 12 categories, no signup, instant accurate results."
      footer={<UnitConverterFaqSection />}
    >
      <UnitConverterTool />
    </ToolPageWrapper>
  );
}
