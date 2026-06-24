import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SqftToCubicYardsTool from "../components/tools/sqft-to-cubic-yards/SqftToCubicYardsTool";
import { getToolById } from "../utils/tools";

export default function SqftToCubicYardsPage() {
  const tool = getToolById("sqft-to-cubic-yards");
  return (
    <ToolPageWrapper tool={tool}>
      <SqftToCubicYardsTool />
    </ToolPageWrapper>
  );
}
