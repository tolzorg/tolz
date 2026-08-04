import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SentenceCounterTool from "../components/tools/sentence-counter/SentenceCounterTool";
import SentenceCounterFaqSection from "../components/tools/sentence-counter/SentenceCounterFaqSection";
import { getToolById } from "../utils/tools";

export default function SentenceCounterPage() {
  const tool = getToolById("sentence-counter");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Sentence Counter Online | Sentence & Readability Analysis"
      seoDescription="Count sentences, paragraphs, and words instantly with Tolz's free Sentence Counter. Get readability scores, sentence-length distribution, and writing insights. No signup."
      footer={<SentenceCounterFaqSection />}
    >
      <SentenceCounterTool />
    </ToolPageWrapper>
  );
}
