import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import WordFinderTool from "../components/tools/word-finder/WordFinderTool";
import WordFinderFaqSection from "../components/tools/word-finder/WordFinderFaqSection";
import { getToolById } from "../utils/tools";

export default function WordFinderPage() {
  const tool = getToolById("word-finder");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Word Finder – Unscramble Letters &amp; Solve Word Games"
      seoDescription="Find words by starting letters, ending letters, included letters, or a fill-in-the-blanks pattern. Free word finder for Scrabble, Words With Friends, crosswords, and Wordle. No signup."
      footer={<WordFinderFaqSection />}
    >
      <WordFinderTool />
    </ToolPageWrapper>
  );
}
