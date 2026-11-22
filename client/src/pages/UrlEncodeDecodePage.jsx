import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UrlEncodeDecodeTool from "../components/tools/url-encode-decode/UrlEncodeDecodeTool";
import UrlEncodeDecodeFaqSection from "../components/tools/url-encode-decode/UrlEncodeDecodeFaqSection";
import { getToolById } from "../utils/tools";

export default function UrlEncodeDecodePage() {
  const tool = getToolById("url-encode-decode");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="URL Encode Decode Online - Free Percent Encoder Tool"
      seoDescription="Free URL encode decode tool. Convert text to percent-encoded format or decode %XX back to readable text with full UTF-8 support. Runs in your browser."
      footer={<UrlEncodeDecodeFaqSection />}
      wide
    >
      <UrlEncodeDecodeTool />
    </ToolPageWrapper>
  );
}
