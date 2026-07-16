// Renders a JSON-LD structured data block. React 19 hoists <script> tags to <head>.
export default function JsonLd({ data }) {
  if (!data) return null;
  // Escape '<' so a value containing "</script>" can't break out of the tag.
  // < is decoded back to '<' by any JSON parser (browser, Google's rich
  // results parser, etc.), so the structured data itself is unchanged.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
