// React 19 natively hoists <title>, <meta>, and <link> to <head> from anywhere in the tree.
// No library needed — these render correctly for Googlebot (which executes JS).

const SITE_NAME = "Tolz";
const SITE_URL  = "https://tolz.org";
const OG_IMAGE  = "https://tolz.org/og-image.png";

export default function SEO({
  title,
  description,
  path = "/",
  image,
  robots = "index, follow",
}) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Free Online Tools`;
  const canonicalUrl = `${SITE_URL}${path}`;
  const ogImage      = image || OG_IMAGE;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description"        content={description} />
      <meta name="robots"             content={robots} />
      <link rel="canonical"           href={canonicalUrl} />
      {/* Open Graph */}
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content={SITE_NAME} />
      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={ogImage} />
    </>
  );
}
