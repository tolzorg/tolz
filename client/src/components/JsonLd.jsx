// Renders a JSON-LD structured data block. React 19 hoists <script> tags to <head>.
export default function JsonLd({ data }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
