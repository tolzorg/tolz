import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import HashIdentifierCalculatorTool from "../components/tools/hash-identifier-calculator/HashIdentifierCalculatorTool";
import HashIdentifierCalculatorFaqSection from "../components/tools/hash-identifier-calculator/HashIdentifierCalculatorFaqSection";
import { getToolById } from "../utils/tools";

export default function HashIdentifierCalculatorPage() {
  const tool = getToolById("hash-identifier-calculator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Hash Identifier - Identify MD5, SHA-1, SHA-256 & More"
      seoDescription="Free hash identifier: paste a hash to see which hash functions could have produced it (MD5, SHA-1, SHA-256, SHA-512, RIPEMD, Tiger, CRC, FNV), by digest length."
      footer={<HashIdentifierCalculatorFaqSection />}
      wide
    >
      <HashIdentifierCalculatorTool />
    </ToolPageWrapper>
  );
}
