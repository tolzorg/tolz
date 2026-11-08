// CIDR Calculator engine — matches omnicalculator.com/other/cidr (its custom JS and table code were read from the
// page; see scripts/cidr-calculator.test.js).
//
// CIDR → IPv4 range: subnet mask = width ones then zeros; prefix = first IP (network address) = IP with the host bits
// cleared; last IP (broadcast) = host bits set; wildcard = inverted mask; range = 2^(32 − width); host addresses =
// range − 2 (0 for /31 and /32).
// IPv4 range → CIDR: the reference's greedy split of [first, last] into CIDR blocks (at most 100). A range that is one
// block is summarized like the other mode; otherwise a table lists each block (CIDR, range, number of addresses).
//
// Deviation (flagged to the user): for a single block the reference computes host addresses as range − 2 without the
// guard it uses in the other mode (a /32 shows −1); here it is 0 for /31 and /32 in both modes.

export const MODES = [
  { value: "cidr", label: "CIDR to IPv4 range" },
  { value: "range", label: "IPv4 range to CIDR" },
];
/** The reference's defaults for CIDR → range: 192.168.0.0/8. */
export const DEFAULT_CIDR = ["192", "168", "0", "0", "8"];

const OCTET_RANGE = "Each octet should be in the 0 to 255 range.";
const OCTET_INT = "Octet value must be an integer.";

const toInt = (ip) => ((ip[0] << 24) >>> 0) + (ip[1] << 16) + (ip[2] << 8) + ip[3];
const toIp = (n) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
export const ipString = (ip) => ip.join(".");
const maskInt = (width) => (width === 0 ? 0 : (0xffffffff << (32 - width)) >>> 0);
export const formatThousands = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

function parseOctets(texts, errors) {
  const out = [];
  for (const t of texts) {
    const s = String(t ?? "").trim();
    const x = Number(s);
    if (s === "" || !Number.isFinite(x)) { if (!errors.includes(OCTET_INT)) errors.push(OCTET_INT); out.push(0); continue; }
    if (x < 0 || x > 255) { if (!errors.includes(OCTET_RANGE)) errors.push(OCTET_RANGE); }
    else if (!Number.isInteger(x)) { if (!errors.includes(OCTET_INT)) errors.push(OCTET_INT); }
    out.push(x);
  }
  return out;
}

/** The summary of one CIDR block. */
function block(ip, width) {
  const mask = maskInt(width);
  const n = toInt(ip);
  const first = (n & mask) >>> 0;
  const last = (first | (~mask >>> 0)) >>> 0;
  const range = 2 ** (32 - width);
  return {
    ip: ipString(ip), width,
    subnetMask: ipString(toIp(mask)),
    prefix: ipString(toIp(first)),
    wildcard: ipString(toIp(~mask >>> 0)),
    firstIp: ipString(toIp(first)),
    lastIp: ipString(toIp(last)),
    range, hosts: range > 1 ? range - 2 : 0,
  };
}

/** The reference's greedy range → CIDR split (at most 100 blocks). */
export function rangeToCidrs(start, end) {
  const result = [];
  while (end >= start && result.length < 100) {
    let maxSize = 32;
    while (maxSize > 0) {
      const mask = Math.round(2 ** 32 - 2 ** (32 - (maxSize - 1)));
      if (Number(BigInt(start) & BigInt(mask)) !== start) break;
      maxSize--;
    }
    const maxDiff = 32 - Math.floor(Math.log(end - start + 1) / Math.log(2));
    if (maxSize < maxDiff) maxSize = maxDiff;
    result.push({ start, width: maxSize });
    start += 2 ** (32 - maxSize);
  }
  return result;
}

/**
 * @param {string[]} texts  [octet1..octet4, width]
 * @returns {{ missing: string[] } | { errors: string[] } | ReturnType<typeof block>}
 */
export function cidrToRange(texts) {
  const names = ["o1", "o2", "o3", "o4", "width"];
  const missing = names.filter((_, i) => String(texts[i] ?? "").trim() === "");
  if (missing.length) return { missing };
  const errors = [];
  const ip = parseOctets(texts.slice(0, 4), errors);
  const w = Number(String(texts[4]).trim());
  if (!Number.isFinite(w) || w < 0) errors.push("The subnet mask width must be 0 or greater.");
  else if (w > 32) errors.push("The subnet mask width must be 32 or smaller.");
  else if (!Number.isInteger(w)) errors.push("The subnet mask width must be an integer.");
  if (errors.length) return { errors };
  return block(ip, w);
}

/**
 * @param {string[]} firstTexts  four octets;  @param {string[]} lastTexts  four octets
 * @returns {{ missing: string[] } | { errors: string[] } | { single: ReturnType<typeof block> } | { blocks: { cidr, range, count }[] }}
 */
export function rangeToCidr(firstTexts, lastTexts) {
  const missing = [
    ...firstTexts.map((t, i) => (String(t ?? "").trim() === "" ? `f${i + 1}` : null)),
    ...lastTexts.map((t, i) => (String(t ?? "").trim() === "" ? `l${i + 1}` : null)),
  ].filter(Boolean);
  if (missing.length) return { missing };
  const errors = [];
  const first = parseOctets(firstTexts, errors);
  const last = parseOctets(lastTexts, errors);
  if (errors.length) return { errors };
  const start = toInt(first);
  const end = toInt(last);
  if (start > end) return { errors: ["The first IP in the block is bigger than the last IP."] };
  const cidrs = rangeToCidrs(start, end);
  if (cidrs.length === 1) return { single: { ...block(first, cidrs[0].width), firstIp: ipString(first), lastIp: ipString(last) } };
  return {
    blocks: cidrs.map(({ start: s, width }) => {
      const b = block(toIp(s), width);
      return { cidr: `${ipString(toIp(s))}/${width}`, range: `${b.firstIp} - ${b.lastIp}`, count: formatThousands(b.range) };
    }),
    capped: cidrs.length === 100 && cidrs[99].start + 2 ** (32 - cidrs[99].width) - 1 < end,
  };
}
