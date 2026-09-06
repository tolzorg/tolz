import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import WordFinderTool from "../components/tools/word-finder/WordFinderTool";
import WordFinderFaqSection from "../components/tools/word-finder/WordFinderFaqSection";
import { getToolById } from "../utils/tools";

export default function WordFinderPage() {
  const tool = getToolById("word-finder");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Word Finder - Find Words by Letters Free"
      seoDescription="Find words by starting letters, ending letters, or pattern instantly. Free word finder for Scrabble, Words With Friends & Wordle. No signup."
      footer={<WordFinderFaqSection />}
    >
      <WordFinderTool />
    </ToolPageWrapper>
  );
}
