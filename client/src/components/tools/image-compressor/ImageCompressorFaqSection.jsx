import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do I compress an image to 100KB or less?",
    a: "Upload your image, set the quality slider to around 60–70%, and check the output size. If it's still above 100 KB, lower the quality in small steps until it fits. For very strict limits (20–50 KB), reducing the image's pixel dimensions before compressing makes hitting the target much easier.",
  },
  {
    q: "Does compressing an image reduce its quality?",
    a: "Lossy compression removes some image data, but at moderate settings (70–85% quality) the difference is invisible at normal viewing sizes. Quality loss only becomes noticeable at aggressive settings or after compressing the same file repeatedly.",
  },
  {
    q: "Is this image compressor really free?",
    a: "Yes. There are no charges, no premium tiers required to download your file, no watermarks, and no signup. You can compress as many images as you need.",
  },
  {
    q: "What image formats can I compress?",
    a: "The tool supports the most common formats: JPEG, PNG, and WebP. JPEGs offer the largest size reductions, PNGs compress more modestly because they're lossless, and WebP delivers the best size-to-quality balance for web use.",
  },
  {
    q: "Are my images stored on your servers?",
    a: "No. Files are used only to complete your compression and are not kept, catalogued, or shared. Uploads are removed automatically once processing is finished.",
  },
  {
    q: "What's the difference between compressing and resizing an image?",
    a: "Resizing changes the image's dimensions (its width and height in pixels), while compressing reduces the file size at the same dimensions by encoding the data more efficiently. For maximum savings, do both: resize to the dimensions you actually need, then compress.",
  },
  {
    q: "Why is my PNG still large after compression?",
    a: "PNG uses lossless compression, so savings are limited by how much redundancy the file contains. Photographic PNGs compress poorly by design, converting them to JPEG or WebP will shrink them far more effectively.",
  },
  {
    q: "Can I compress multiple images at once?",
    a: "You can process images back to back with no limits or waiting periods. There's no cap on how many files you compress in a session.",
  },
];

const BROWSER_CODE = `const img = new Image();
img.onload = () => {
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  canvas.getContext('2d').drawImage(img, 0, 0);
  canvas.toBlob(
    (blob) => console.log('Compressed size:', blob.size),
    'image/webp', // or 'image/jpeg'
    0.75          // quality from 0 to 1
  );
};
img.src = URL.createObjectURL(file);`;

const PILLOW_CODE = `from PIL import Image

img = Image.open('photo.jpg')
img.save('photo-small.jpg', quality=75, optimize=True)`;

const CLI_CODE = `#!/usr/bin/env python3
import argparse, os
from PIL import Image

parser = argparse.ArgumentParser(description='Simple image compressor')
parser.add_argument('input', help='Path to input image')
parser.add_argument('output', help='Path to output image')
parser.add_argument('-q', '--quality', type=int, default=75,
                    help='Quality from 1 to 95 (default 75)')
parser.add_argument('-w', '--width', type=int,
                    help='Optional max width in pixels')
args = parser.parse_args()

img = Image.open(args.input)
if args.width and img.width > args.width:
    ratio = args.width / img.width
    img = img.resize((args.width, int(img.height * ratio)))

img.save(args.output, quality=args.quality, optimize=True)
print(f'{os.path.getsize(args.input)//1024} KB -> '
      f'{os.path.getsize(args.output)//1024} KB')`;

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
const listStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const preStyle = {
  ...mono, fontSize: 12.5, lineHeight: 1.6, color: "var(--text-primary)", background: "var(--bg-muted)",
  border: "1px solid var(--border)", borderRadius: 8, padding: "12px 14px", margin: "0 0 10px", overflowX: "auto",
};
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;

export default function ImageCompressorFaqSection() {
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

      {/* How compressors work */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do Image Compressors Work?</h2>
        <p style={pStyle}>
          An image compressor takes the pixel data of a picture and re-encodes it in a way that needs fewer bytes to
          store. Every digital image is, at its core, a grid of pixels, and each pixel holds color values. A raw
          12-megapixel photo contains 12 million of those pixels, which is why an uncompressed file can reach 30 to 36
          MB. Compression exploits the fact that this data is full of redundancy and detail that humans barely notice.
        </p>
        <p style={pStyle}>Most compressors follow the same basic pipeline:</p>
        <ol style={listStyle}>
          <li style={liStyle}>
            <strong>Color-space conversion.</strong> The image is converted from RGB into a format such as YCbCr, which
            separates brightness (luma) from color (chroma). Our eyes are far more sensitive to brightness than to
            color, so this split lets the encoder treat them differently.
          </li>
          <li style={liStyle}>
            <strong>Chroma subsampling.</strong> Color information is stored at a lower resolution than brightness.
            This alone can cut a large share of the data with almost no visible change.
          </li>
          <li style={liStyle}>
            <strong>Transform.</strong> The image is divided into small blocks and converted into frequency data (JPEG
            uses the Discrete Cosine Transform; newer formats use more advanced transforms and prediction). Smooth
            areas become simple, fine texture becomes detailed.
          </li>
          <li style={liStyle}>
            <strong>Quantization.</strong> This is the lossy step. High-frequency detail that the eye is least
            sensitive to is rounded off or dropped. The quality slider on this tool controls how aggressive this step
            is.
          </li>
          <li>
            <strong>Entropy coding.</strong> The remaining data is packed using techniques such as Huffman or
            arithmetic coding, which give shorter codes to common patterns. This step is lossless.
          </li>
        </ol>
        <p style={pStyle}>
          Lossless formats like PNG skip quantization entirely and rely on prediction filters plus DEFLATE
          compression, so the decoded image is identical to the original. For a deeper technical overview, see the
          general explanation of{" "}
          <Ext href="https://en.wikipedia.org/wiki/Image_compression">image compression on Wikipedia</Ext> and
          the <Ext href="https://jpeg.org/jpeg/index.html">JPEG standard overview from the Joint Photographic Experts Group</Ext>.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Lossy vs lossless in practice.</strong> Lossy compression (JPEG, lossy WebP) can shrink a photo by
          60–90% at roughly 70–85% quality with no visible difference at normal viewing sizes. Lossless compression
          (PNG) repacks the data without discarding anything, so savings are smaller, usually 10–40%, but the output
          is pixel-identical to the original. The quality slider on this tool controls how aggressive the lossy stage
          is: a lower setting means a smaller file and more visible artifacts, a higher one means better fidelity and
          a larger file. For most photos, around 75% is where the biggest practical savings live.
        </p>
      </div>

      {/* Making a compressor */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do You Make an Image Compressor?</h2>
        <p style={pStyle}>
          Building a basic image compressor is easier than most people expect, because you rarely need to write a
          codec from scratch. Modern browsers and programming languages already ship with well-tested encoders. A
          practical compressor needs four parts: an input (file upload), a decoder (to read pixels), an encoder with
          adjustable quality, and an output (download).
        </p>
        <p style={pStyle}>
          <strong>In the browser (JavaScript).</strong> Load the file, draw it on an HTML canvas, and export it with a
          chosen quality value:
        </p>
        <pre style={preStyle}><code>{BROWSER_CODE}</code></pre>
        <p style={pStyle}>
          The <code style={mono}>canvas.toBlob()</code> method is documented on{" "}
          <Ext href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob">MDN Web Docs</Ext>.
        </p>
        <p style={pStyle}>
          <strong>On a server (Python).</strong> The <Ext href="https://pillow.readthedocs.io/">Pillow library</Ext> can
          open nearly any image and save it with optimized settings:
        </p>
        <pre style={preStyle}><code>{PILLOW_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For production use, you would also add file-type validation, a maximum upload size, metadata handling
          (stripping EXIF data saves bytes and protects privacy), resizing options, and a way to hit a target file
          size by testing several quality levels automatically. If you only need the result and not the engineering,
          the Tolz compressor on this page does all of that for you.
        </p>
      </div>

      {/* Best compressors */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Are the Best Image Compressors on the Internet?</h2>
        <p style={pStyle}>
          The "best" compressor depends on what you need: speed, privacy, format support, batch processing, or exact
          file-size control. These are among the most widely used options heading into 2027:
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Tolz Image Compressor</strong> – a free, no-signup tool for JPEG, PNG, and WebP with an adjustable
            quality slider and size preview. It adds no watermarks and is built for quick everyday jobs such as form
            uploads, email attachments, and website images.
          </li>
          <li style={liStyle}>
            <strong>Squoosh</strong> – Google's open-source web app, excellent for comparing formats (MozJPEG, WebP,
            AVIF) side by side with fine manual control.
          </li>
          <li style={liStyle}>
            <strong>TinyPNG / TinyJPG</strong> – a popular smart-lossy compressor, especially for PNG and WebP, with
            plugins for common CMS platforms.
          </li>
          <li style={liStyle}>
            <strong>ImageOptim</strong> – a free desktop app for macOS that optimizes images in bulk without an
            upload.
          </li>
          <li>
            <strong>ShortPixel</strong> – an optimization service with a WordPress plugin for sites that want
            automated compression.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you want a fast, simple tool that works on any device without an account, start with Tolz. If you need
          advanced codec experiments, Squoosh is a strong second tool to keep bookmarked.
        </p>
      </div>

      {/* What happens */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens When You Compress an Image?</h2>
        <p style={pStyle}>
          When you compress an image, the encoder rewrites the file so that the same picture is described with fewer
          bytes. What exactly changes depends on whether the method is lossy or lossless.
        </p>
        <p style={pStyle}>
          With <strong>lossy compression</strong> (JPEG, WebP lossy, AVIF), some information is permanently
          discarded. Fine texture, tiny color differences, and subtle gradients are simplified. At moderate quality
          the change is invisible; at low quality you may see blocky patches, blurred edges, "mosquito noise" around
          text, or banding in skies and gradients.
        </p>
        <p style={pStyle}>
          With <strong>lossless compression</strong> (PNG, lossless WebP), nothing is thrown away. The data is simply
          stored more efficiently, so the decompressed image is pixel-identical to the original.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other things can change too: metadata such as camera model, GPS location, and color profiles may be removed,
          which reduces file size further. The pixel dimensions normally stay the same unless you also resize. The
          result is always a new file, so your original stays safe on your device.
        </p>
      </div>

      {/* Compression vs editing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between Image Compression and Image Editing?</h2>
        <p style={pStyle}>
          Image compression changes how the image is stored, not what the image shows. The goal is a smaller file that
          looks the same to the viewer. Image editing, on the other hand, changes the content or appearance of the
          picture itself: cropping, retouching, adjusting brightness or color, adding text, removing backgrounds, or
          applying filters.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th></th><th>Image compression</th><th>Image editing</th></tr></thead>
            <tbody>
              <tr><th scope="row">Purpose</th><td>Reduce file size</td><td>Change how the image looks</td></tr>
              <tr><th scope="row">Visible Change</th><td>Ideally none</td><td>Intentional and obvious</td></tr>
              <tr><th scope="row">Typical tools</th><td>Compressors, encoders</td><td>Photoshop, GIMP, Canva</td></tr>
              <tr><th scope="row">Example</th><td>4 MB photo to 400 KB</td><td>Cropping a face, brightening shadows</td></tr>
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          In practice the two work together: you edit first, then compress as the final export step.
        </p>
      </div>

      {/* Processing vs compression */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Explain the Difference Between Image Processing and Image Compression?</h2>
        <p style={pStyle}>
          Image processing is the broad field of analyzing or transforming images with algorithms. It includes
          sharpening, noise reduction, edge detection, object recognition, color correction, medical-image
          enhancement, and much more. Image compression is one specialized branch of image processing whose single
          goal is to represent an image using less data.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A useful way to remember it: image processing asks, "What can I do to or learn from this image?" while image
          compression asks, "How can I store this image in the fewest bytes?" Every compressor uses image-processing
          techniques internally (color conversion, transforms, filtering), but not every image-processing task
          involves compression. You can read more in the overview of{" "}
          <Ext href="https://en.wikipedia.org/wiki/Digital_image_processing">digital image processing</Ext>.
        </p>
      </div>

      {/* Compression vs resizing */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Difference Between Compression and Resizing an Image?</h2>
        <p style={pStyle}>Compression and resizing both make files smaller, but they do it in different ways.</p>
        <p style={pStyle}>
          <strong>Resizing</strong> changes the dimensions of the image. A 4000 × 3000 photo resized to 1000 × 750
          contains 16 times fewer pixels, so the file becomes much smaller, but the image is also physically smaller.
        </p>
        <p style={pStyle}>
          <strong>Compression</strong> keeps the same dimensions and stores the pixels more efficiently. The image
          appears the same size, but the file is lighter.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the biggest savings, combine them: resize the image to the dimensions you actually need (for example,
          1200 pixels wide for a blog post), then compress it. This is also the most reliable way to reach very small
          targets like 20 KB or 50 KB.
        </p>
      </div>

      {/* Specific KB size */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Best Tool to Reduce Image Size to a Specific File Size in KB Without Losing Quality?</h2>
        <p style={pStyle}>
          No tool can shrink an image to an exact size with literally zero quality loss, because a tight size target
          forces the encoder to discard some data. The goal is to choose a tool that gives you control and a live size
          preview, so you lose only what nobody can see.
        </p>
        <p style={pStyle}>
          The Tolz image compressor is built for exactly this: set the quality slider, watch the estimated output
          size, and adjust in small steps until the file lands just under your limit (for example 100 KB or 200 KB).
          For advanced users, Squoosh offers manual codec tuning, and command-line tools like ImageMagick can automate
          target-size compression.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the exact steps, see the sections below on reducing an image without changing its dimensions and on
          going from 250 KB to 20 KB.
        </p>
      </div>

      {/* TIFF without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Reduce the File Size of a TIFF Without Losing Quality?</h2>
        <p style={pStyle}>
          TIFF supports several lossless compression options, so you can usually make a TIFF much smaller without any
          change to the pixels.
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Re-save with LZW or ZIP (Deflate) compression.</strong> Most editors (Photoshop, GIMP, Affinity)
            offer this when you export or save as TIFF. ZIP often performs better on images with large flat areas; LZW
            is the most widely compatible.
          </li>
          <li style={liStyle}>
            <strong>Convert to PNG.</strong> PNG is also lossless and widely supported, and it is often smaller than an
            uncompressed TIFF.
          </li>
          <li style={liStyle}>
            <strong>Remove extras.</strong> Flatten layers, delete extra alpha channels, and discard embedded
            thumbnails.
          </li>
          <li>
            <strong>Use a command-line tool.</strong> With ImageMagick:{" "}
            <code style={mono}>magick input.tif -compress zip output.tif</code>
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If lossless savings are not enough and the image is a photograph, convert it to JPEG or WebP at high quality
          (85 to 90%). Our tool accepts JPEG, PNG, and WebP, so convert your TIFF to one of those formats first, then
          compress. Keep your original TIFF as an archive master.
        </p>
      </div>

      {/* Without changing dimensions */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Reduce My Image Size in KB Without Changing the Dimensions?</h2>
        <p style={pStyle}>
          To reduce the file size while keeping the width and height identical, you only need to change the
          compression settings, not the pixel count.
        </p>
        <ol style={listStyle}>
          <li style={liStyle}>Upload your image to the Tolz Image Compressor.</li>
          <li style={liStyle}>Lower the quality slider gradually (start near 80%).</li>
          <li style={liStyle}>Check the estimated size and preview.</li>
          <li>Download the result. The pixel dimensions stay exactly the same.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other ways to shrink the file without touching dimensions: convert PNG photographs to JPEG or WebP, strip
          metadata (EXIF, GPS, thumbnails), and use an encoder with better efficiency such as WebP or AVIF.
        </p>
      </div>

      {/* 250 KB to 20 KB */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Can I Reduce the File Size of an Image, Say From 250KB to 20KB?</h2>
        <p style={pStyle}>
          Going from 250 KB to 20 KB means cutting roughly 92% of the file. That is achievable, but usually needs more
          than one step:
        </p>
        <ol style={listStyle}>
          <li style={liStyle}>
            <strong>Resize first.</strong> Reduce the dimensions to what the form or website actually needs. Many
            portals only need around 200 × 230 pixels for a passport-style photo. This is the single most effective
            step.
          </li>
          <li style={liStyle}>
            <strong>Then compress at roughly 40–60% quality.</strong> Use the Tolz slider and check the size after each
            change. If the image is a PNG photograph, switch it to JPEG or WebP, and strip metadata for a few more
            kilobytes.
          </li>
          <li>
            <strong>Verify legibility.</strong> For documents, signatures, or IDs, zoom in to ensure text and faces are
            still clear.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the file is still too big, shrink the dimensions a little more rather than dropping quality to the
          minimum. A smaller, cleaner image almost always looks better than a large, heavily artifacted one.
        </p>
      </div>

      {/* Why TIFFs are big */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Are TIFF Files So Big? Can We Reduce the Size of a TIFF File Without Losing Quality?</h2>
        <p style={pStyle}>
          TIFF files are big because the format was designed for maximum quality and flexibility, used in printing,
          scanning, photography, and archiving. Common reasons for large TIFFs:
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Often uncompressed.</strong> Many scanners and cameras save TIFFs with no compression at all.
          </li>
          <li style={liStyle}>
            <strong>High bit depth.</strong> 16 bits per channel doubles the data compared with the standard 8 bits.
          </li>
          <li style={liStyle}>
            <strong>Multiple layers, pages, or channels.</strong> TIFF can store layers, many pages, and extra alpha
            channels.
          </li>
          <li>
            <strong>High resolution.</strong> Scans at 600 dpi or more produce enormous pixel counts.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Yes. The exact lossless methods (LZW or ZIP compression, converting to PNG, flattening layers) are covered in
          "How Do I Reduce the File Size of a TIFF Without Losing Quality?" above. For more background, see{" "}
          <Ext href="https://www.adobe.io/open/standards/TIFF.html">Adobe's TIFF resources</Ext> and the{" "}
          <Ext href="https://www.loc.gov/preservation/digital/formats/fdd/fdd000022.shtml">Library of Congress format description</Ext>.
        </p>
      </div>

      {/* Quality effect */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Does Compressing Images Affect Quality?</h2>
        <p style={pStyle}>
          It depends on the method. Lossless compression never affects quality. Lossy compression always removes some
          data, but at sensible settings the loss is invisible.
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>85 to 100% quality:</strong> nearly indistinguishable from the original; best for portfolios and
            print.
          </li>
          <li style={liStyle}>
            <strong>70 to 85%:</strong> the sweet spot for most websites and emails, with big savings and no visible
            difference at normal size.
          </li>
          <li style={liStyle}>
            <strong>50 to 70%:</strong> good for thumbnails and strict upload limits; slight softness may appear on
            close inspection.
          </li>
          <li>
            <strong>Below 50%:</strong> artifacts become noticeable, especially around text and sharp edges.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The biggest quality risk is repeated recompression. For habits that keep quality high, see "Reducing File
          Size Without Losing Quality" below.
        </p>
      </div>

      {/* Purpose */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Purpose of Compressing an Image? What Changes Occur When an Image Is Compressed?</h2>
        <p style={pStyle}>
          The purpose of image compression is to make files smaller so they are cheaper and faster to store, send, and
          load. In 2027, with image-heavy websites, social platforms, and mobile-first audiences, that matters more
          than ever. Key benefits:
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Faster websites.</strong> Smaller images improve loading speed and help your Core Web Vitals,
            particularly Largest Contentful Paint.
          </li>
          <li style={liStyle}>
            <strong>Meeting upload limits.</strong> Many portals cap files at 100 KB, 200 KB, or 1 MB.
          </li>
          <li style={liStyle}>
            <strong>Lower storage and bandwidth costs.</strong> Hosting and cloud bills shrink with lighter images.
          </li>
          <li style={liStyle}>
            <strong>Faster sharing.</strong> Emails and messages send and open faster.
          </li>
          <li>
            <strong>Better mobile experience.</strong> Less data use for people on slow or metered connections.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>What changes:</strong> the file size drops, the encoding is rewritten, some fine detail may be
          discarded (in lossy mode), and metadata may be stripped. <strong>What stays the same:</strong> the pixel
          dimensions (unless you resize) and the overall look of the image at normal viewing size.
        </p>
      </div>

      {/* CLI */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Create an Image Compressor Command Line Interface?</h2>
        <p style={pStyle}>
          A command line interface (CLI) is useful for batch jobs and automation. Here is a simple Python CLI using
          Pillow:
        </p>
        <pre style={preStyle}><code>{CLI_CODE}</code></pre>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Run it with: <code style={mono}>python compress.py photo.jpg small.jpg -q 70 -w 1200</code>
        </p>
      </div>

      {/* Choosing a method */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Do I Choose the Right Image Compression Method?</h2>
        <p style={pStyle}>
          Choose the method by asking three questions: what is the image, where will it be used, and how strict is the
          size limit?
        </p>
        <ul style={listStyle}>
          <li style={liStyle}>
            <strong>Photograph for a website, email, or form:</strong> use lossy compression (JPEG or WebP) at 70 to
            85% quality.
          </li>
          <li style={liStyle}>
            <strong>Logo, icon, screenshot, or graphic with transparency:</strong> use lossless PNG, or lossless WebP.
          </li>
          <li style={liStyle}>
            <strong>Archive, print master, or medical/scientific image:</strong> use lossless compression only (PNG, or
            TIFF with LZW/ZIP) and keep the original.
          </li>
          <li style={liStyle}>
            <strong>Very strict size limit (20 to 100 KB):</strong> resize first, then use lossy compression at 50 to
            70%.
          </li>
          <li>
            <strong>Maximum web efficiency:</strong> WebP is the safest modern choice in 2027, and AVIF can be smaller
            still where your audience's browsers and tools support it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When unsure, start with WebP or JPEG at 75% in the Tolz Image Compressor, compare the preview against the
          original, and adjust. That simple workflow covers most real-world needs.
        </p>
      </div>

      {/* What does this tool do */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Does This Image Compressor Do?</h2>
        <p style={pStyle}>
          This image compressor reduces the file size of your pictures while keeping them sharp enough for websites,
          emails, documents, and online forms. Upload a JPEG, PNG, or WebP file, choose how much compression you want,
          and download a smaller version in seconds, no account, no watermark, and no cost. It is one of the free
          utilities on Tolz, a collection of online tools built to handle everyday file and conversion tasks directly
          in your browser.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A typical photo straight from a phone camera weighs anywhere from 3 MB to 12 MB. That size is unnecessary for
          most purposes: a website hero image rarely needs to exceed 300 KB, an email attachment loads faster under 1
          MB, and many government or job-application portals cap uploads at 100 KB or even 20 KB. This tool closes
          that gap. It re-encodes your image using efficient compression algorithms, discarding data your eyes can't
          meaningfully perceive while preserving the details that matter, edges, faces, text, and color balance.
        </p>
      </div>

      {/* Who it's for */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who This Tool Is For</h2>
        <p style={pStyle}>
          An online image compressor is useful to almost anyone who moves pictures around the internet, but a few
          groups rely on it constantly.
        </p>
        <p style={pStyle}>
          <strong>Website owners and bloggers</strong> compress images because page weight directly affects loading
          speed, and loading speed affects both visitor experience and search rankings. Oversized images are the
          single most common cause of poor Core Web Vitals scores, particularly Largest Contentful Paint. Shrinking a
          4 MB banner to 250 KB can cut seconds off a page load.
        </p>
        <p style={pStyle}>
          <strong>Students and job applicants</strong> run into strict upload limits everywhere: scholarship portals,
          university applications, visa forms, and job boards frequently reject files over 100 KB or 200 KB. A
          compressor turns an unusable phone photo of a document or ID into an accepted upload.
        </p>
        <p style={pStyle}>
          <strong>Ecommerce sellers</strong> need product photos that look crisp but load instantly across dozens or
          hundreds of listings. Marketplaces like Amazon, Etsy, and Daraz also impose their own file size ceilings.
        </p>
        <p style={pStyle}>
          <strong>Office workers and freelancers</strong> compress images before emailing them, embedding them in
          reports, or adding them to presentations, keeping attachments deliverable and documents from ballooning to
          unmanageable sizes.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Developers and designers</strong> use compression as a final export step so assets ship at
          production-ready sizes without opening heavyweight editing software.
        </p>
      </div>

      {/* When you need it */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You Actually Need to Compress an Image</h2>
        <p style={pStyle}>A few concrete situations come up again and again:</p>
        <p style={pStyle}>
          <strong>Email attachment limits.</strong> Gmail and Outlook cap messages around 20–25 MB, but large
          attachments are slow to send and slow for recipients to open. Compressing photos before attaching them keeps
          emails fast and prevents bounce-backs.
        </p>
        <p style={pStyle}>
          <strong>Form and portal uploads.</strong> Passport applications, exam registrations, tax portals, and HR
          systems commonly require images under a fixed size, often 100 KB, sometimes as low as 20 KB. This is the most
          unforgiving scenario, and the exact reason a quality slider matters: you can tune the output until it fits.
        </p>
        <p style={pStyle}>
          <strong>Faster websites and better SEO.</strong> Google's page experience signals reward fast-loading pages.
          Since images typically account for half or more of a page's total weight, compressing them is the
          highest-impact optimization most site owners can make without touching code.
        </p>
        <p style={pStyle}>
          <strong>Saving storage and bandwidth.</strong> Compressed images take up less space on your phone, cloud
          drive, or server, and they consume less mobile data for anyone viewing them, a real consideration for
          audiences on slower connections.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Messaging and social platforms.</strong> Some platforms recompress large uploads with harsh settings
          of their own. Compressing carefully yourself first often produces a better-looking result than letting the
          platform do it aggressively.
        </p>
      </div>

      {/* Format breakdown */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Compressing JPEG, PNG, and WebP Files</h2>
        <p style={pStyle}>
          Each format behaves differently under compression, and knowing which you're working with helps you get the
          best result.
        </p>
        <p style={pStyle}>
          <strong>JPEG (.jpg)</strong> is the standard for photographs and responds extremely well to compression.
          Because JPEG is inherently lossy, there is huge room to reduce size. Most photos can lose 70–90% of their
          weight before quality visibly degrades. If your goal is the smallest possible photo, JPEG is usually the
          right output.
        </p>
        <p style={pStyle}>
          <strong>PNG (.png)</strong> is designed for graphics with sharp edges and flat colors, logos, screenshots,
          icons, and images that need transparency. PNG compression is lossless by nature, so savings are more modest.
          If a PNG photograph is far too large, converting it to JPEG or WebP during compression typically achieves a
          much bigger reduction than optimizing the PNG itself.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>WebP (.webp)</strong> is a modern format developed by Google that compresses roughly 25–35% smaller
          than equivalent-quality JPEGs and also supports transparency. It's now supported by every major browser,
          which makes it the strongest choice for web publishing. If you're compressing images for your own website,
          exporting to WebP gives you the best size-to-quality ratio available.
        </p>
      </div>

      {/* Without losing quality */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reducing File Size Without Losing Quality</h2>
        <p style={pStyle}>
          "Without losing quality" is the phrase everyone searches for, so it deserves an honest answer: lossy
          compression always discards some data. The real goal is discarding data no one can see. A few habits make
          that reliably achievable.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Compress from the original file whenever possible. Recompressing an already-compressed JPEG stacks artifacts
          on top of artifacts, and quality degrades quickly with each generation. Then match the quality setting to the
          destination: a full-screen portfolio image justifies 85% quality, while a thumbnail or form upload looks
          perfectly fine at 50–60%. Resizing before you compress multiplies the savings, as explained in the
          compression-vs-resizing section above. Used this way, compression is effectively invisible, the file shrinks
          dramatically and viewers never know the difference.
        </p>
      </div>

      {/* Privacy */}
      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Your Privacy and File Security</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          File safety is a fair concern whenever you upload anything to an online tool, especially personal photos or
          scanned documents. This compressor is built with that in mind. Your images are used solely to perform the
          compression you requested, they are not stored permanently, added to any library, or shared with third
          parties, and processed files are removed automatically after your session. The tool is completely free, with
          no hidden charges, no watermarks stamped onto your output, and no signup or email address required to
          download your result. What you upload stays yours, and what you download is a clean, full-quality compressed
          file with no strings attached.
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
