import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HashIdentifierCalculatorTool from "../components/tools/hash-identifier-calculator/HashIdentifierCalculatorTool";
import HashIdentifierCalculatorFaqSection from "../components/tools/hash-identifier-calculator/HashIdentifierCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HashIdentifierCalculatorPage() {
  const tool = getToolById("hash-identifier-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Hash Identifier: Identify Hash Type Online Free"
      seoDescription="Use our free hash identifier to find which algorithm made a hash. Paste an MD5, SHA-1, SHA-256, SHA-512, RIPEMD, Tiger, CRC or FNV digest and see matches."
      footer={<HashIdentifierCalculatorFaqSection />}
      wide
    >
      <HashIdentifierCalculatorTool />
    </ToolPageWrapper>
  );
}
