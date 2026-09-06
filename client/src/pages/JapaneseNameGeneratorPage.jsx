import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import JapaneseNameGeneratorTool from "../components/tools/japanese-name-generator/JapaneseNameGeneratorTool";
import JapaneseNameFaqSection from "../components/tools/japanese-name-generator/JapaneseNameFaqSection";
import { getToolById } from "../utils/tools";

export default function JapaneseNameGeneratorPage() {
  const tool = getToolById("japanese-name-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Japanese Name Generator | Free Names with Kanji & Meaning"
      seoDescription="Generate real Japanese names with Kanji, Hiragana, and Hepburn romaji. Search by meaning, convert to Katakana, compare names, free, no signup."
      footer={<JapaneseNameFaqSection />}
    >
      <JapaneseNameGeneratorTool />
    </ToolPageWrapper>
  );
}
