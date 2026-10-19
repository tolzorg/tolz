// pdf-lib's embedJpg/embedPng read `imageData.buffer` from position 0 and
// ignore the Buffer's byteOffset. Node keeps small Buffers (< 4 KB) inside a
// shared memory pool at a non-zero offset, so pdf-lib would sometimes read
// another buffer's bytes ("SOI not found in JPEG"). A Uint8Array copy owns
// its memory from offset 0, which pdf-lib reads correctly.
export const ownBytes = (buf) => new Uint8Array(buf);
