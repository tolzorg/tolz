import ToolPageWrapper from "../components/tools/ToolPageWrapper";
import PasswordGeneratorTool from "../components/tools/password-generator/PasswordGeneratorTool";
import PasswordGeneratorFaqSection from "../components/tools/password-generator/PasswordGeneratorFaqSection";
import { getToolById } from "../utils/tools";

export default function PasswordGeneratorPage() {
  const tool = getToolById("password-generator");
  return (
    <ToolPageWrapper
      tool={tool}
      seoTitle="Password Generator - Strong Random Passwords with Entropy"
      seoDescription="Free random password generator: create strong, secure passwords with lower case, upper case, numbers and symbols, exclude ambiguous characters, and see strength and entropy. Generated in your browser."
      footer={<PasswordGeneratorFaqSection />}
      wide
    >
      <PasswordGeneratorTool />
    </ToolPageWrapper>
  );
}
