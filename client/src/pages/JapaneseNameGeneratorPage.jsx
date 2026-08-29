import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import JapaneseNameGeneratorTool from "../components/tools/japanese-name-generator/JapaneseNameGeneratorTool";
import JapaneseNameFaqSection from "../components/tools/japanese-name-generator/JapaneseNameFaqSection";
import { getToolById } from "../utils/tools";

export default function JapaneseNameGeneratorPage() {
  const tool = getToolById("japanese-name-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Japanese Name Generator – Girl, Boy &amp; Surname Names with Kanji"
      seoDescription="Generate, search, and browse real Japanese girl names, boy names, and surnames A-Z with Kanji, Hiragana readings, and Hepburn romaji. Search by meaning, convert your name to Katakana, and save favorites. Free, no signup."
      footer={<JapaneseNameFaqSection />}
    >
      <JapaneseNameGeneratorTool />
    </ToolPageWrapper>
  );
}
