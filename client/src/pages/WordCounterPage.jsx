import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import WordCounterTool from "../components/tools/word-counter/WordCounterTool";
import { getToolById } from "../utils/tools";

export default function WordCounterPage() {
  const tool = getToolById("word-counter");
  return (
    <ToolPageWrapper tool={tool}>
      <WordCounterTool />
    </ToolPageWrapper>
  );
}
