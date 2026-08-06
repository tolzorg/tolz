import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import SentenceCounterTool from "../components/tools/sentence-counter/SentenceCounterTool";
import SentenceCounterFaqSection from "../components/tools/sentence-counter/SentenceCounterFaqSection";
import { getToolById } from "../utils/tools";

export default function SentenceCounterPage() {
  const tool = getToolById("sentence-counter");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Sentence Counter & Readability Checker Online"
      seoDescription="Count sentences and paragraphs instantly and check Flesch, Fog, and SMOG readability scores free online. No signup needed. Try Tolz Sentence Counter now."
      footer={<SentenceCounterFaqSection />}
    >
      <SentenceCounterTool />
    </ToolPageWrapper>
  );
}
