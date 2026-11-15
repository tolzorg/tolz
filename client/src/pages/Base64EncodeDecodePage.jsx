import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import Base64EncodeDecodeTool from "../components/tools/base64-encode-decode/Base64EncodeDecodeTool";
import Base64EncodeDecodeFaqSection from "../components/tools/base64-encode-decode/Base64EncodeDecodeFaqSection";
import { getToolById } from "../utils/tools";

export default function Base64EncodeDecodePage() {
  const tool = getToolById("base64-encode-decode");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Base64 Encoder & Decoder - Encode or Decode Text, Images & Files"
      seoDescription="Free Base64 encoder and decoder: convert text, images and files to and from Base64 in your browser, with 40 character sets, copy and download. Nothing is uploaded."
      footer={<Base64EncodeDecodeFaqSection />}
      wide
    >
      <Base64EncodeDecodeTool />
    </ToolPageWrapper>
  );
}
