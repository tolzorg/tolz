import { randomBytes } from "crypto";

const CHARSET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const SLUG_LEN = 6;
// Largest multiple of CHARSET.length that fits in a byte; bytes >= this are discarded
// to eliminate modulo bias (256 % 62 = 8 biased values).
const MAX_VALID_BYTE = 256 - (256 % CHARSET.length); // 248

export function generateSlug() {
  let slug = "";
  while (slug.length < SLUG_LEN) {
    const bytes = randomBytes(SLUG_LEN * 3);
    for (let i = 0; i < bytes.length && slug.length < SLUG_LEN; i++) {
      if (bytes[i] < MAX_VALID_BYTE) {
        slug += CHARSET[bytes[i] % CHARSET.length];
      }
    }
  }
  return slug;
}
