import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UrlShortenerTool from "../components/tools/url-shortener/UrlShortenerTool";
import UrlShortenerFaqSection from "../components/tools/url-shortener/UrlShortenerFaqSection";
import { getToolById } from "../utils/tools";

export default function UrlShortenerPage() {
  const tool = getToolById("url-shortener");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free URL Shortener Online | Shorten Links Instantly"
      seoDescription="Shorten long URLs into clean, shareable links in seconds. Free URL shortener with no signup, no watermark, and instant results. Try it now."
      footer={<UrlShortenerFaqSection />}
    >
      <UrlShortenerTool />
    </ToolPageWrapper>
  );
}
