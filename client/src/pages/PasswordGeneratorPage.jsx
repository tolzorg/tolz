import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PasswordGeneratorTool from "../components/tools/password-generator/PasswordGeneratorTool";
import PasswordGeneratorFaqSection from "../components/tools/password-generator/PasswordGeneratorFaqSection";
import { getToolById } from "../utils/tools";

export default function PasswordGeneratorPage() {
  const tool = getToolById("password-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Free Password Generator - Strong Random Passwords"
      seoDescription="Use Tolz’s free password generator to create strong, random passwords with custom length, symbols, and entropy score. Generated privately in your browser."
      footer={<PasswordGeneratorFaqSection />}
      wide
    >
      <PasswordGeneratorTool />
    </ToolPageWrapper>
  );
}
