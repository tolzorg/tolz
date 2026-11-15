import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UrlEncodeDecodeTool from "../components/tools/url-encode-decode/UrlEncodeDecodeTool";
import UrlEncodeDecodeFaqSection from "../components/tools/url-encode-decode/UrlEncodeDecodeFaqSection";
import { getToolById } from "../utils/tools";

export default function UrlEncodeDecodePage() {
  const tool = getToolById("url-encode-decode");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="URL Encode / Decode - Percent-Encode or Decode Text Online"
      seoDescription="Free URL encoder and decoder: percent-encode text for safe use in a URL or decode %XX sequences back to text, with UTF-8 support. Runs in your browser; nothing is uploaded."
      footer={<UrlEncodeDecodeFaqSection />}
      wide
    >
      <UrlEncodeDecodeTool />
    </ToolPageWrapper>
  );
}
