import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import Base64EncodeDecodeTool from "../components/tools/base64-encode-decode/Base64EncodeDecodeTool";
import Base64EncodeDecodeFaqSection from "../components/tools/base64-encode-decode/Base64EncodeDecodeFaqSection";
import { getToolById } from "../utils/tools";

export default function Base64EncodeDecodePage() {
  const tool = getToolById("base64-encode-decode");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Base64 Encoder & Decoder - Free Online Tool"
      seoDescription="Free Base64 encoder and decoder. Convert text in 40 character sets, plus images and files up to 25 MB. Run in your browser, nothing is uploaded."
      footer={<Base64EncodeDecodeFaqSection />}
      wide
    >
      <Base64EncodeDecodeTool />
    </ToolPageWrapper>
  );
}
