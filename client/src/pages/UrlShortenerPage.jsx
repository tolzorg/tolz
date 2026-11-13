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
      seoDescription="Shorten long links in seconds with Tolz’s free URL shortener. No signup needed. Paste your link, get a short URL, and share it anywhere."
      footer={<UrlShortenerFaqSection />}
    >
      <UrlShortenerTool />
    </ToolPageWrapper>
  );
}
