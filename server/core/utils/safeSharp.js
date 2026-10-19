import sharp from "sharp";

// "Decompression bomb" guard: a small upload (e.g. a 1 MB PNG) can declare
// enormous dimensions and expand to gigabytes of pixels when decoded. sharp's
// own default limit (~268 MP) is still far more memory than this server has,
// so every image the tools open goes through this wrapper with a stricter
// cap. 100 MP still covers every phone and DSLR camera (most are 12-50 MP).
export const MAX_INPUT_PIXELS = 100_000_000;

/** Drop-in replacement for sharp(input, options) with the pixel cap applied. */
export default function safeSharp(input, options = {}) {
  return sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, ...options });
}
