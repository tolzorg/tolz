import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import WordCounterTool from "../components/tools/word-counter/WordCounterTool";
import WordCounterFaqSection from "../components/tools/word-counter/WordCounterFaqSection";
import { getToolById } from "../utils/tools";

export default function WordCounterPage() {
  const tool = getToolById("word-counter");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Word Counter Online | Count Words & Characters"
      seoDescription="Count words, characters, sentences & paragraphs instantly with Tolz's free Word Counter. No signup, no limits, 100% accurate results."
      footer={<WordCounterFaqSection />}
    >
      <WordCounterTool />
    </ToolPageWrapper>
  );
}
