import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SqftToCubicYardsTool from "../components/tools/sqft-to-cubic-yards/SqftToCubicYardsTool";
import SqftToCubicYardsFaqSection from "../components/tools/sqft-to-cubic-yards/SqftToCubicYardsFaqSection";
import { getToolById } from "../utils/tools";

export default function SqftToCubicYardsPage() {
  const tool = getToolById("sqft-to-cubic-yards");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Sq Ft to Cubic Yards Calculator | Free & Instant"
      seoDescription="Convert square feet to cubic yards instantly. Enter area or length×width, pick a material, and get accurate volume and weight. Free, no signup."
      footer={<SqftToCubicYardsFaqSection />}
    >
      <SqftToCubicYardsTool />
    </ToolPageWrapper>
  );
}
