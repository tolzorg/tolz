// SEO content + metadata for the top-level tool category landing pages
// (Image, PDF, Converters, URL, Text, Design). The "Calculators" category
// has its own hub page (CalculatorsHubPage) since it links to the three
// existing calculator category pages instead of individual tools.

export const TOOL_CATEGORY_PAGES = [
  {
    slug: "image",
    categoryId: "image",
    path: "/tools/image",
    name: "Image Tools",
    tagline: "Compress, convert, and prepare images for the web, print, or official documents.",
    icon: "🖼",
    iconBg: "#f3f0ff",
    iconColor: "#8b5cf6",
    seoTitle: "Free Image Tools – Compress, Convert & ID Photos",
    seoDescription:
      "Free online image tools: compress JPEG/PNG/WebP, convert between formats, and create passport & ID photos. No signup, no watermarks, fast and easy.",
    introHeading: "Everything You Need to Edit and Optimize Images",
    introParagraphs: [
      "Images are the heaviest part of most websites, forms, and photo libraries, and getting them into the right format, size, or shape usually means downloading software you'll use once and forget about. Tolz's image tools handle the most common image tasks entirely in your browser: shrinking file size without losing visible quality, converting between formats like JPEG, PNG, HEIC, and PDF, and cropping photos to exact passport, visa, or ID specifications ready for printing.",
      "Each tool runs instantly, keeps your files private, and never asks for an account, a payment, or a watermark on your download.",
    ],
    benefitsHeading: "Why Use Tolz's Image Tools",
    benefits: [
      { title: "Faster websites", text: "Compressed, correctly-sized images cut page load times and improve Core Web Vitals." },
      { title: "Accepted uploads", text: "Meet strict file size and dimension requirements for forms, portals, and marketplaces." },
      { title: "No software needed", text: "Everything runs in your browser — no installs, no plugins, no learning curve." },
      { title: "Private by design", text: "Files are processed for your session only and are never stored or shared." },
    ],
  },
  {
    slug: "pdf",
    categoryId: "pdf",
    path: "/tools/pdf",
    name: "PDF Tools",
    tagline: "Merge, compress, split, and convert PDFs — free, fast, and entirely in your browser.",
    icon: "📄",
    iconBg: "#eff6ff",
    iconColor: "#3b7bfc",
    seoTitle: "Free PDF Tools – Merge, Compress, Split & Convert",
    seoDescription:
      "Free online PDF tools: merge multiple PDFs, compress file size, split pages, and convert PDF to Word. No signup, no watermarks, works in your browser.",
    introHeading: "Handle Any PDF Task Without Installing Software",
    introParagraphs: [
      "PDFs are the standard for sharing documents, but editing them usually means Adobe Acrobat or a paid subscription. Tolz's PDF tools cover the tasks people need most often: combining multiple files into one document, shrinking oversized PDFs for email or upload limits, pulling out or separating specific pages, and converting PDFs into editable Word documents.",
      "Every tool works directly in your browser, keeps your original files untouched, and never adds a watermark to your output.",
    ],
    benefitsHeading: "Why Use Tolz's PDF Tools",
    benefits: [
      { title: "No file size surprises", text: "Compress PDFs before they hit email or portal upload limits." },
      { title: "Keep formatting intact", text: "Convert PDF to Word while preserving text, structure, and layout." },
      { title: "Full control over pages", text: "Reorder, merge, or split documents exactly the way you need them." },
      { title: "Nothing to install", text: "Every tool runs online — works on any device, any operating system." },
    ],
  },
  {
    slug: "converters",
    categoryId: "converter",
    path: "/tools/converters",
    name: "Converters",
    tagline: "Convert between units instantly — accurate, free, no signup.",
    icon: "⚖️",
    iconBg: "#fff7ed",
    iconColor: "#f59e0b",
    seoTitle: "Free Unit Converter Online – 12 Categories",
    seoDescription:
      "Convert length, weight, temperature, area, volume, data and more instantly. Free real-time unit converter with 12 categories. No signup required.",
    introHeading: "Convert Anything, Instantly",
    introParagraphs: [
      "Whether you're converting a recipe's measurements, checking a temperature, or figuring out data storage sizes, unit conversion should be instant, not a search-and-scroll exercise. Tolz's Unit Converter handles 12 categories — length, weight, temperature, area, volume, speed, time, data, energy, pressure, angle, and frequency — in one real-time, bidirectional tool.",
      "Type a value and see it converted the moment you stop typing — no calculate button, no ads interrupting the result. Looking to convert file formats instead of measurement units? Try the Image Converter or PDF to Word tool.",
    ],
    benefitsHeading: "Why Use Tolz's Converters",
    benefits: [
      { title: "All-in-one", text: "12 unit categories in a single tool instead of hunting for separate calculators." },
      { title: "Real-time results", text: "Bidirectional conversion updates instantly as you type — no calculate button." },
      { title: "Accurate and free", text: "No signup, no limits, and no charge for using the tool as often as you like." },
    ],
  },
  {
    slug: "url-tools",
    categoryId: "url-tools",
    path: "/tools/url-tools",
    name: "URL Tools",
    tagline: "Shorten links and generate QR codes instantly — free, no signup.",
    icon: "🔗",
    iconBg: "#f0fdf4",
    iconColor: "#22c55e",
    seoTitle: "Free URL Shortener & QR Code Generator",
    seoDescription:
      "Shorten long links and generate QR codes for URLs, text, WiFi, email, and phone numbers — free, instant, no signup required.",
    introHeading: "Shorten, Share, and Scan Your Links",
    introParagraphs: [
      "Long, messy URLs are hard to share and easy to mistype. Tolz's URL tools let you turn any link into a short, clean, shareable one in seconds, and generate scannable QR codes for URLs, plain text, WiFi credentials, email addresses, or phone numbers.",
      "Both tools are free, work instantly, and don't require an account to create or share your results.",
    ],
    benefitsHeading: "Why Use Tolz's URL Tools",
    benefits: [
      { title: "Cleaner links", text: "Turn long URLs into short, professional links for social media, print, or email." },
      { title: "Instant QR codes", text: "Generate scannable codes for URLs, WiFi, contact info, and more in one click." },
      { title: "No signup required", text: "Create and share links or QR codes without creating an account." },
    ],
  },
  {
    slug: "text-tools",
    categoryId: "text-tools",
    path: "/tools/text-tools",
    name: "Text Tools",
    tagline: "Count words, sentences, and reading time instantly — free, no signup.",
    icon: "📝",
    iconBg: "#fefce8",
    iconColor: "#ca8a04",
    seoTitle: "Free Word & Sentence Counter Online – Text Analysis Tools",
    seoDescription:
      "Count words, characters, sentences, and reading time instantly. Get readability scores and writing insights. Upload .txt files. Free, no signup required.",
    introHeading: "Analyze Your Text in Seconds",
    introParagraphs: [
      "Whether you're hitting a word count requirement for an essay, checking a social media caption's character limit, or estimating how long an article takes to read, Tolz's Word Counter and Sentence Counter give you the numbers instantly. Paste text directly or upload a .txt (or .md, for Word Counter) file to get word, character, sentence, and paragraph counts, estimated reading time, and — with the Sentence Counter — full readability analysis.",
      "Everything is calculated in your browser, with nothing uploaded to a server.",
    ],
    benefitsHeading: "Why Use Tolz's Text Tools",
    benefits: [
      { title: "Meet exact limits", text: "Track word, character, and sentence counts for essays, ads, captions, and forms." },
      { title: "Readability insights", text: "See Flesch, Fog, SMOG and other scores to gauge how easy your text is to read." },
      { title: "Instant and private", text: "Text is processed in your browser and never stored or sent anywhere." },
    ],
  },
  {
    slug: "design-tools",
    categoryId: "design-tools",
    path: "/tools/design-tools",
    name: "Design Tools",
    tagline: "Pick, convert, and check colors — free, accurate, no signup.",
    icon: "🎨",
    iconBg: "#f3f0ff",
    iconColor: "#7c3aed",
    seoTitle: "Free Color Picker Online – HEX, RGB, HSL & Contrast",
    seoDescription:
      "Pick colors visually, convert between HEX, RGB and HSL, generate palettes, and check WCAG contrast ratios. Free online color picker, no signup.",
    introHeading: "Color Tools for Designers and Developers",
    introParagraphs: [
      "Picking the right color is only half the job — you also need it in the right format and need to confirm it's accessible. Tolz's Color Picker lets you pick colors visually, convert instantly between HEX, RGB, and HSL, generate complementary palettes, and check WCAG contrast ratios for accessibility compliance.",
      "All of this happens without leaving your browser or uploading anything.",
    ],
    benefitsHeading: "Why Use Tolz's Design Tools",
    benefits: [
      { title: "Every format you need", text: "Convert between HEX, RGB, and HSL without a lookup table." },
      { title: "Accessibility built in", text: "Check WCAG contrast ratios directly against your chosen colors." },
      { title: "Palette generation", text: "Generate complementary color palettes from any base color instantly." },
    ],
  },
];

export function getToolCategoryBySlug(slug) {
  return TOOL_CATEGORY_PAGES.find((c) => c.slug === slug) || null;
}
