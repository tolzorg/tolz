import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import WordCounterTool from "../components/tools/word-counter/WordCounterTool";
import WordCounterFaqSection from "../components/tools/word-counter/WordCounterFaqSection";
import { getToolById } from "../utils/tools";

export default function WordCounterPage() {
  const tool = getToolById("word-counter");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Word Counter: Count Words & Characters Online"
      seoDescription="Count words, characters, sentences, and paragraphs instantly with the free Tolz Word Counter. No signup, no limits, and your text stays private."
      footer={<WordCounterFaqSection />}
    >
      <WordCounterTool />
    </ToolPageWrapper>
  );
}
