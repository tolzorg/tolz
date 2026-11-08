import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import ContainerLoadingCalculatorTool from "../components/tools/container-loading-calculator/ContainerLoadingCalculatorTool";
import ContainerLoadingCalculatorFaqSection from "../components/tools/container-loading-calculator/ContainerLoadingCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function ContainerLoadingCalculatorPage() {
  const tool = getToolById("container-loading-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Container Loading Calculator - How Many Boxes Fit in a Container"
      seoDescription="Free container loading calculator: how many boxes fit in a 10ft, 20ft, 40ft, 45ft or custom container, with utilization, layers and arrangement instructions."
      footer={<ContainerLoadingCalculatorFaqSection />}
      wide
    >
      <ContainerLoadingCalculatorTool />
    </ToolPageWrapper>
  );
}
