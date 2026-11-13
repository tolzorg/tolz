import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this passport photo maker really free to use?",
    a: "Yes. There are no charges for cropping your photo, generating a print sheet, or exporting it as a PDF, PNG, or JPEG.",
  },
  {
    q: "Do I need to create an account to use the ID photo generator?",
    a: "No signup is required. You can upload a photo, generate your print sheet, and download it immediately.",
  },
  {
    q: "What size is a standard US passport photo?",
    a: "A US passport or visa photo must be 2 x 2 inches (51 x 51 mm), with the head measuring between 1 inch and 1⅜ inches from chin to the top of the hair, on a plain white or off-white background.",
  },
  {
    q: "Can I use this tool for visa photos, not just passports?",
    a: "Yes. The tool includes visa-specific templates in addition to passport and national ID formats, since sizing requirements can differ between them.",
  },
  {
    q: "How many passport photos fit on one 4x6 print sheet?",
    a: "A standard 4x6 inch sheet comfortably fits four 2 x 2 inch passport photos, which is why it is the most common layout used by photo labs and home printers.",
  },
  {
    q: "What's the difference between the safe zone, cut line, and bleed line?",
    a: "The safe zone marks the area guaranteed to stay within the final photo after trimming, the cut line shows exactly where the photo will be cut, and the bleed line adds a small margin beyond that to account for minor printer or cutting shifts.",
  },
  {
    q: "Can I print the photo sheet at home instead of going to a photo counter?",
    a: "Yes. Exporting as a PDF preserves the correct print dimensions, so the sheet can be printed on a home printer or sent to any print shop. Print at actual size on photo paper.",
  },
  {
    q: "Will my photo be stored after I download it?",
    a: "The tool is built for a simple upload-crop-export workflow without requiring an account, so there is no need to keep a stored copy tied to your identity on the platform.",
  },
  {
    q: "Does the tool guarantee my passport photo will be accepted?",
    a: "The templates follow published official size and layout guidelines, but final approval always depends on the reviewing authority, such as a passport office or embassy, so double-check current requirements before submitting.",
  },
  {
    q: "Can I make ID photos for something other than a passport, like a school or work badge?",
    a: "Yes. A custom size option is available for studio, school, and employee ID photos that do not follow a government passport format.",
  },
  {
    q: "Can I use a selfie or a filtered photo for my passport?",
    a: "No. Selfies distort facial proportions, and beauty filters or AI-edited backgrounds can cause rejection. Have someone else take an unedited photo.",
  },
];

const STATE_DEPT_PHOTOS = "https://travel.state.gov/content/travel/en/passports/how-apply/photos.html";

function FaqRow({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, padding: "13px 2px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{
          fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)",
        }}>
          {item.q}
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }} aria-hidden="true">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

export default function IdPhotoGeneratorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      {/* Easiest way */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What's the easiest way to get a passport photo?</h2>
        <p style={pStyle}>
          For most people, the easiest route is to take the photo at home and let a template-based tool handle the
          sizing. The traditional options (a pharmacy counter, a post office, or a photo studio) work, but they cost
          money per visit, need travel, and give you a limited number of retakes. A home workflow takes a few minutes:
          have someone photograph you against a plain wall, upload the picture here, pick your document template, and
          export.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The approach that causes the fewest rejections is to separate the two jobs. First, take a good source photo
          (even lighting, front-facing, plain background). Second, let a tool lock the crop to the exact template
          dimensions rather than eyeballing it. That is exactly what this ID photo generator does, and it is why it is
          faster than a manual crop in a general-purpose editor.
        </p>
      </div>

      {/* Own photo */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can you take your own passport photo?</h2>
        <p style={pStyle}>
          Yes. Government agencies, including the U.S. Department of State, allow you to supply your own photo as long
          as it meets the published requirements. You do not need a professional photographer. What you cannot do is
          take it as a selfie, because arm's-length selfies distort facial proportions and are not accepted. Ask a
          friend or family member to take it, or place your phone on a stable surface and use a timer.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The photo must also be recent (taken within the last six months), show your current appearance, and be
          unedited. Since the U.S. tightened its rules on digitally altered images, beauty filters, skin smoothing, and
          AI-generated or AI-replaced backgrounds can lead to rejection. Basic cropping, resizing, and a clean white
          background are acceptable; cosmetic retouching is not.
        </p>
      </div>

      {/* At home */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How can I make my own passport photo at home?</h2>
        <p style={pStyle}>
          A reliable home setup needs only four things: daylight, a plain light wall, a second person, and a phone or
          camera.
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            <strong>Find the light.</strong> Stand facing a window so daylight falls evenly on your face. Avoid direct
            sun and overhead lights that cast shadows under the eyes or nose.
          </li>
          <li style={liStyle}>
            <strong>Use a plain background.</strong> A white or off-white wall works best. Stand a short distance away
            from it so you do not cast a shadow behind you.
          </li>
          <li style={liStyle}>
            <strong>Frame it properly.</strong> Have your helper stand about 1.5 metres (roughly 5 feet) away, with the
            camera at eye level. Your head and the top of your shoulders should be visible, face straight to the
            camera, both eyes open.
          </li>
          <li style={liStyle}>
            <strong>Keep it natural.</strong> Take your glasses off, keep hair away from the face, and avoid hats or
            head coverings unless worn daily for religious or medical reasons (with a signed statement where
            required).
          </li>
          <li>
            Take several shots and choose the sharpest, then upload it to the tool and select your template.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool then applies the correct crop, head-position guide, and print layout so you do not have to
          calculate millimetres yourself.
        </p>
      </div>

      {/* Phone */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can you take a passport picture using your phone?</h2>
        <p style={pStyle}>
          Yes, a modern smartphone camera is more than good enough for passport photos. Authorities care about
          sharpness, lighting, framing, and compliance, not about the camera brand. The key is how you use it:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Use the rear camera, which is sharper than the front camera.</li>
          <li style={liStyle}>
            Keep the phone at eye level and avoid close-up shots. Shooting from too near distorts the nose and
            forehead.
          </li>
          <li style={liStyle}>Turn off beauty modes, portrait-lighting effects, and filters.</li>
          <li style={liStyle}>Shoot at the highest resolution, so the crop still has plenty of pixels.</li>
          <li>Check the result on a full screen, not the preview, to confirm there is no blur or shadow.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you need a file for online submission, remember the digital specification for U.S. applications: a
          square JPEG between 600 x 600 and 1200 x 1200 pixels, in colour, and under the file-size limit stated on the
          official site.
        </p>
      </div>

      {/* iPhone */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can I take a passport photo using my iPhone?</h2>
        <p style={pStyle}>
          Yes. iPhones are well suited to this because of their consistent colour and sharp rear cameras. A few
          iPhone-specific tips help:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Turn off Portrait mode and Live Photo.</strong> Portrait mode blurs and re-lights the background,
            which can trigger a rejection for altered images.
          </li>
          <li style={liStyle}>
            <strong>Use the self-timer</strong> (3 or 10 seconds) and prop the phone on a stack of books if no one is
            available to help, or have someone else hold it.
          </li>
          <li style={liStyle}>
            <strong>Enable the grid</strong> in Settings &gt; Camera so you can keep the head centred and level.
          </li>
          <li style={liStyle}>
            <strong>Switch the format to Most Compatible</strong> (Settings &gt; Camera &gt; Formats) so photos save as
            JPEG rather than HEIC. If you already have HEIC files, you can upload them and export a JPEG from the tool.
          </li>
          <li>
            <strong>Lock exposure</strong> by tapping and holding on your face, then sliding down slightly if the white
            wall looks grey or up if your face looks dark.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The same advice applies to Android phones: rear camera, no filters, even light, and no selfies.
        </p>
      </div>

      {/* Best app */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is there any best app available to take passport size photos for passport applications?</h2>
        <p style={pStyle}>
          There is no single "best" app for every country, because the right choice depends on the document and the
          rules of the issuing authority. What matters is that the app or website uses an official template for your
          country, does not apply cosmetic filters, and exports at the correct size and resolution. Be cautious with
          apps that promise to "fix" lighting or backgrounds using AI, since heavy editing is what causes rejections.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A browser-based tool like this ID photo generator has two practical advantages: nothing to install, and it
          works the same on any phone, tablet, or computer. For extra assurance, run your finished photo through the
          U.S. State Department's <Ext href={STATE_DEPT_PHOTOS}>online photo tool</Ext>, which checks basic technical
          quality for digital uploads, or the equivalent checker from your own country's passport office, such as the
          UK's <Ext href={STATE_DEPT_PHOTOS}>photos for passports guidance</Ext>.
        </p>
      </div>

      {/* Digital photo */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where can we get a digital passport photo?</h2>
        <p style={pStyle}>
          A digital passport photo is simply a compliant image file you can upload with an online application. You can
          get one in three ways:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Make it yourself</strong> with a template-based tool like this one, then export as JPEG at the
            required pixel size.
          </li>
          <li style={liStyle}>
            <strong>Ask a retail photo service</strong> (many pharmacies and print shops offer a digital copy,
            sometimes by email or QR code) when you have your picture taken.
          </li>
          <li>
            <strong>Use a professional studio</strong>, which can supply both prints and a digital file.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For U.S. online passport renewal and for the visa application form DS-160, a digital file is required. Make
          sure it meets the official pixel range, format, and size limit before uploading, since upload systems reject
          photos automatically if the technical specification is wrong.
        </p>
      </div>

      {/* Official requirements website */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is there any website that meets the official passport photo requirements?</h2>
        <p style={pStyle}>
          Yes, but "meets the requirements" has two meanings. The first is technical: correct dimensions, resolution,
          and head size. A template-based site can deliver that reliably. The second is visual compliance: no shadows,
          no glare, correct expression, and no prohibited accessories. That depends on your source photo, not on the
          website.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool addresses the first part by working from real document templates (US passport, visa, national ID,
          and custom sizes) with head-position guides built in. For the second part, follow the lighting and posture
          steps above and compare your result with the official examples on the{" "}
          <Ext href={STATE_DEPT_PHOTOS}>State Department photo page</Ext>. The international basis for most national
          rules is the ICAO standard for machine-readable travel documents,{" "}
          <Ext href="https://www.icao.int/sites/default/files/publications/DocSeries/9303_p1_cons_en.pdf">Doc 9303</Ext>,
          which is why requirements look similar across countries even when sizes differ.
        </p>
      </div>

      {/* Online photo website */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is there any website offering an online photo for a passport?</h2>
        <p style={pStyle}>
          Yes. Many sites let you upload a picture and download a passport-ready image, and several are free. Look for
          these signs of a trustworthy one: it states the exact size it produces, it lets you choose your country and
          document type, it does not require payment before showing a preview, and it explains its limits honestly,
          because no website can guarantee acceptance on behalf of a government.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Tolz offers this as a free, no-signup tool. You can crop to the correct template, export a single photo for
          online upload, or build a print sheet for printing. There is no charge for downloading.
        </p>
      </div>

      {/* Print own */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How can I print my own passport photo?</h2>
        <p style={pStyle}>Printing at home or at a local print shop is straightforward when the sheet is built correctly:</p>
        <ol style={ulStyle}>
          <li style={liStyle}>Export your photo sheet as a PDF, which preserves exact measurements.</li>
          <li style={liStyle}>
            Print at 100% scale (choose "Actual size", not "Fit to page"), otherwise the photos shrink and fail the size
            rule.
          </li>
          <li style={liStyle}>
            Use glossy or matte photographic paper. Plain office paper is not accepted for U.S. passport applications.
          </li>
          <li style={liStyle}>
            Use the highest print-quality setting and a printer with good colour accuracy, since skin tones matter.
          </li>
          <li>
            Cut along the cut lines with a paper trimmer or sharp scissors, and check that each photo measures exactly
            2 x 2 inches for U.S. applications.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you do not own a suitable printer, upload the PDF to a photo lab or kiosk service and print on 4x6 paper.
          The cost is typically a small fraction of a studio fee.
        </p>
      </div>

      {/* Print at home */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can you print passport photos at home?</h2>
        <p style={pStyle}>
          Yes, as long as your printer and paper meet the standard. Many home inkjet printers produce acceptable
          results on proper photo paper. Problems come from three things: wrong scaling, thin plain paper, and uneven
          colour or banding. Before printing a full set, do a test print and measure the photo with a ruler. Then
          compare skin tone and background against the screen.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the test looks blotchy, tinted, or the white background has a visible colour cast, use a lab instead. Most
          photo counters will print a 4x6 sheet for a small fee if you bring a file on a USB stick or send it online.
        </p>
      </div>

      {/* 4x6 */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How do I print passport photos on 4x6 paper?</h2>
        <p style={pStyle}>
          4x6 inches is the most common photo paper size, and it fits four 2 x 2 inch passport photos in a 2 x 2 grid.
          With the Print Studio layout, you:
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>Select your document template (for example, US passport 2 x 2 inch).</li>
          <li style={liStyle}>Choose 4x6 inch as the paper size and set the number of copies.</li>
          <li style={liStyle}>Check the safe zone, cut line, and bleed guide on the preview.</li>
          <li style={liStyle}>
            Export the sheet as PDF, then print at actual size on 4x6 photo paper (or upload it to a photo lab).
          </li>
          <li>Trim along the cut lines.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you need only two photos (many U.S. applications need just one), leave the extra slots empty or use them
          for a second document size, such as a 35 x 45 mm photo for another country's form.
        </p>
      </div>

      {/* Baby */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How do you print a baby's passport photo?</h2>
        <p style={pStyle}>
          Babies follow the same printing rules as adults: the photo must be the correct size, printed on photographic
          paper, and free of marks. What differs is how you capture the image, and the U.S. rules allow slightly more
          flexibility for infants, such as a baby who does not look directly at the camera.
        </p>
        <ol style={ulStyle}>
          <li style={liStyle}>
            Lay the baby on their back on a plain white or off-white sheet or blanket, and shoot from above. This also
            keeps the background even and removes the need for a standing baby.
          </li>
          <li style={liStyle}>
            No one else should be visible, so keep hands, toys, pacifiers, and the blanket's edges out of the frame.
          </li>
          <li style={liStyle}>
            Take many shots and pick the best one, because babies move quickly. Open eyes are ideal, and a calm or
            relaxed expression is fine for infants.
          </li>
          <li style={liStyle}>
            Choose the US passport 2 x 2 inch template in the tool, crop so the head is within the guide, and export
            the PDF.
          </li>
          <li>Print at actual size on photo paper and trim along the cut line.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because infant photos are often the hardest to get right, it helps to print the full 4x6 sheet and use the
          extra copies if one is rejected or lost.
        </p>
      </div>

      {/* No smile */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why are we told not to smile for passport photos?</h2>
        <p style={pStyle}>
          The advice comes from biometrics. Passport photos are used by facial-recognition systems at borders, and a
          relaxed, neutral face gives algorithms a consistent baseline for measuring distances between features such
          as the eyes, nose, and mouth. A broad smile changes those distances, raises the cheeks, and can partly close
          the eyes, making comparison less reliable. International standards from ICAO, which most countries follow,
          therefore recommend a neutral expression.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The nuance is that rules differ by country. The U.S. Department of State currently allows either a neutral
          expression or a natural, slight smile, as long as both eyes are open and the face is clearly visible. Other
          countries, including the UK, ask for a neutral expression with the mouth closed. The safest approach is a
          relaxed face with a closed mouth, and to check your own country's guidance before taking the photo.
        </p>
      </div>

      {/* Visa online */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How can I get a visa photo online?</h2>
        <p style={pStyle}>
          To get a visa photo online, you take or choose a picture, select the correct visa template, and download a
          file in the format the application requires. For U.S. visa applications such as the DS-160, the photo must
          be a digital image with the following characteristics: square, 600 x 600 to 1200 x 1200 pixels, JPEG format,
          in colour, with a plain white or off-white background, and a file size within the limit shown on the
          application. Many other embassies use different sizes, so choose your template based on the country you are
          applying to, not your country of residence.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          After exporting the JPEG, upload it directly to the application, or print it if you need a physical photo at
          your appointment. Keep the original file in case the system asks for a re-upload.
        </p>
      </div>

      {/* Visa official */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How can I get a visa photo with official requirements?</h2>
        <p style={pStyle}>
          The most reliable method is to start from the issuing authority's own page and then use a tool to meet it.
          For the U.S., see the State Department's{" "}
          <Ext href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/photos.html">visa photo requirements</Ext>.
          For other countries, check the website of the embassy or consulate you are applying through. Then follow
          this checklist:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Choose the visa template that matches the stated dimensions.</li>
          <li style={liStyle}>Take a recent, unedited, front-facing photo with a plain background.</li>
          <li style={liStyle}>Remove glasses and avoid shadows or glare.</li>
          <li style={liStyle}>Export at the required pixel size and file format.</li>
          <li>
            Review the finished image at 100% zoom to check that the face is sharp and the head size fits the guide.
          </li>
        </ul>
        <p style={pStyle}>
          Remember that visa photo rules can differ from passport photo rules for the same country, which is why
          selecting the right template matters.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The answers above explain how to take, print, and submit a compliant photo. The rest of this page explains
          how the Tolz tool itself puts that into practice, from templates and print sheets to export formats.
        </p>
      </div>

      {/* What it does */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Passport Photo Maker Actually Does</h2>
        <p style={pStyle}>
          Most people searching for a passport photo maker online are not looking for a photo editor with a hundred
          filters. They need one specific outcome: a photo that meets a government or institution's exact size and
          layout rules. This ID photo generator handles that by working from real document templates rather than
          generic crop ratios. You upload a photo, choose the document type (US passport, visa, national ID, or a
          custom studio size), and the tool automatically applies the correct dimensions, head-positioning guide, and
          background requirements for that template. From there, it arranges multiple copies of your photo on a single
          print sheet with the margins a photo lab or home printer actually needs, and exports the result as a
          print-ready PDF, PNG, or JPEG.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This matters because the single biggest reason passport and visa photos get rejected is incorrect sizing. A
          photo that is a few millimetres off, or a head positioned slightly too high or low in the frame, is enough
          for an application to be flagged and returned. A dedicated passport photo generator removes that guesswork
          by locking the crop to the template's exact specifications instead of leaving it to manual trial and error.
        </p>
      </div>

      {/* Size requirements */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Passport, Visa, and ID Size Requirements This Tool Covers</h2>
        <p style={pStyle}>
          Photo size rules vary more than most people expect, and getting familiar with them explains why a
          purpose-built ID photo generator is worth using instead of a manual crop.
        </p>
        <p style={pStyle}>
          In the United States, passport and visa photos must be 2 x 2 inches (51 x 51 mm), with the head measuring
          between 1 inch and 1⅜ inches from the chin to the top of the hair, and the eyes positioned roughly 1⅛ to 1⅜
          inches from the bottom edge of the photo. For digital submissions, such as the DS-160 visa application, the
          accepted pixel dimensions fall between 600 x 600 and 1200 x 1200 pixels, with a plain white or off-white
          background and no shadows.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other countries use different formats entirely. Many use a 35 x 45 mm photo, while some ID cards and visa
          categories call for 50 x 70 mm or other regional sizes. Because there is no single global standard, a tool
          that lets you select the correct document template (rather than guessing at a generic square crop) is the
          difference between a photo that gets accepted and one that gets sent back. This ID photo generator includes
          commonly requested passport, visa, and national ID templates, along with a custom size option for studio
          photos, employee badges, school IDs, and similar documents that do not follow a standard government format.
        </p>
      </div>

      {/* Print sheets */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Print Sheets, Safe Zones, and Bleed Guides Explained</h2>
        <p style={pStyle}>
          The printing steps above depend on a properly built sheet, so here is what the Print Studio layout adds.
        </p>
        <p style={pStyle}>
          This is where the "Print Studio" side of the tool comes in. Rather than exporting a single cropped image, it
          lays out multiple copies of your photo using three reference lines that professional print shops rely on:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Safe zone</strong> – the area guaranteed to stay inside the final trimmed photo, keeping your head
            and shoulders away from any risk of being cut off.
          </li>
          <li style={liStyle}>
            <strong>Cut line</strong> – the exact line the photo will be trimmed along, matching the document's
            required dimensions.
          </li>
          <li>
            <strong>Bleed line</strong> – a small margin beyond the cut line that accounts for minor shifts in home or
            commercial printers, preventing thin white edges after trimming.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Without these guides, home-printed passport photos often come out misaligned, with visible white borders or
          photos trimmed too close to the head. Building the sheet with proper bleed and cut margins means the output
          is ready for scissors, a paper cutter, or a photo kiosk without additional adjustment.
        </p>
      </div>

      {/* Scenarios */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Need This Tool</h2>
        <p style={pStyle}>
          A passport photo maker is useful well beyond first-time passport applications. Common situations include:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={liStyle}>
            <strong>Passport renewals and first-time applications.</strong> Both require a recent photo meeting with
            strict size and background rules. This tool produces a compliant crop for direct upload or printing.
          </li>
          <li style={liStyle}>
            <strong>Visa applications.</strong> Tourist, work, and student visas almost always require their own photo,
            often with slightly different rules from a passport photo. Selecting the correct visa template avoids a
            mismatch that could delay processing.
          </li>
          <li style={liStyle}>
            <strong>National ID cards and residency documents.</strong> Many countries issue ID cards or residency
            permits that require a photo in a specific, non-passport format. The custom size option covers these
            cases.
          </li>
          <li style={liStyle}>
            <strong>School and employee ID badges.</strong> Institutions issuing physical ID badges often need a
            consistent photo size across many people. Producing a correctly sized, print-ready sheet in batches saves a
            trip to a studio.
          </li>
          <li style={liStyle}>
            <strong>Replacing a lost or expired document photo.</strong> If an ID photo is needed again but there is no
            time or budget for a studio visit, this tool produces a compliant replacement from an existing photo in a
            few minutes.
          </li>
          <li>
            <strong>Printing at home instead of paying a photo counter.</strong> A pharmacy or photo counter typically
            charges a flat fee regardless of how many copies you need. Generating your own sheet and printing it at
            home or at any photo service is significantly cheaper for multiple copies.
          </li>
        </ul>
      </div>

      {/* Output formats */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Output Formats: PDF, PNG, and JPEG</h2>
        <p style={pStyle}>Different situations call for different file types, so the tool supports exporting in three formats:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>PDF</strong> is best when sending the print sheet to a professional photo lab or printing service,
            since it preserves exact measurements and print quality without compression artifacts.
          </li>
          <li style={liStyle}>
            <strong>JPEG</strong> is typically what is required for online applications, such as digital visa or
            passport submissions, where file size limits and specific pixel dimensions apply.
          </li>
          <li>
            <strong>PNG</strong> is useful when the photo needs to be inserted into another document or form, such as a
            resume, ID card template, or application form, where a lossless format keeps image quality intact.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Having all three options from a single upload means you do not need to run the same photo through multiple
          tools depending on whether you are printing or submitting digitally.
        </p>
      </div>

      {/* How to use */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Passport Photo Maker</h2>
        <ol style={ulStyle}>
          <li style={liStyle}>Upload a clear, front-facing photo, ideally against a plain background.</li>
          <li style={liStyle}>
            Select the document type: US passport, visa, national ID, or a custom size for studio and badge photos.
          </li>
          <li style={liStyle}>Adjust the crop so the head fits within the guide provided for that template.</li>
          <li style={liStyle}>
            Choose how many copies to lay out on the print sheet, along with the paper size (commonly 4x6 inches).
          </li>
          <li style={liStyle}>Review the safe zone, cut line, and bleed guide on the generated sheet.</li>
          <li>Export as PDF for printing, or JPEG/PNG for digital upload.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The entire process is designed to take a couple of minutes from upload to export, without needing any photo
          editing background.
        </p>
      </div>

      {/* Privacy / accuracy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Accuracy, and Cost</h2>
        <p style={pStyle}>
          Uploading a personal photo, especially one intended for an official document, naturally raises privacy
          questions, so it is worth being direct about how this tool handles that. No account or signup is required,
          so there is no personal information tied to an account. The tool is free, with no hidden charges for
          exporting your print sheet or downloading your file in any supported format.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, the templates for passport, visa, and ID sizing are built to match official published
          dimensions, including head-size ratios and background expectations. Requirements can be updated by
          government agencies, so confirm the current rules for your country and document type before submitting. This
          tool is built to get sizing and layout right, but final acceptance is always determined by the receiving
          authority.
        </p>
      </div>

      {/* FAQ */}
      <div className="card" style={cardStyle}>
        <h2 style={{ ...h2Style, marginBottom: 6 }}>Frequently Asked Questions</h2>
        <div>
          {FAQ_ITEMS.map((item, i) => (
            <FaqRow
              key={item.q}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
