import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import UrlShortenerTool from "../components/tools/url-shortener/UrlShortenerTool";
import { getToolById } from "../utils/tools";

export default function UrlShortenerPage() {
  const tool = getToolById("url-shortener");
  return (
    <ToolPageWrapper tool={tool}>
      <UrlShortenerTool />
    </ToolPageWrapper>
  );
}
