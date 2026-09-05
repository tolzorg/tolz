// Currency Calculator engine — matches calculator.net/currency-calculator.html.
//
// Two independent calculators on that page:
//   "With Live Exchange Rate" — Amount + From/To currency, converted using a
//     real-time market exchange rate.
//   "Customized Currency Exchange Rate" — a user-supplied A/B rate applied
//     to an amount, entirely offline (no live data involved at all).
//
// ─────────────────────────────────────────────────────────────────
// LIVE RATE DATA SOURCE (a deliberate, documented deviation from the
// reference): calculator.net sources its live rates from
// openexchangerates.org, a paid/licensed feed not available to this app.
// This engine instead calls https://open.er-api.com — a free, keyless,
// CORS-open FX-rate API (exchangerate-api.com's "open" tier) — directly
// from the browser. No API key is needed and none is embedded anywhere,
// consistent with this project's "never expose secrets in frontend code"
// rule: there IS no secret here, which is exactly why this source was
// chosen over any key-gated alternative. Rates are fetched ONCE per page
// load (not per calculation) and reused for every conversion afterward,
// both to avoid hammering a free public API and because the source
// itself only refreshes hourly anyway.
//
// CURRENCY COVERAGE: the reference offers 173 currencies (including
// Bitcoin and four precious metals as literal "currencies", plus a
// handful of long-discontinued ones like the pre-2018 São Tomé dobra or
// the old Venezuelan bolívar fuerte). This chosen data source covers 163
// of those 173 — every real, actively-traded fiat currency matches, with
// two categories excluded: Bitcoin/precious metals (XAU/XAG/XPD/XPT —
// specialty assets a plain FX-rate API doesn't carry) and a handful of
// currencies with no current market (KPW — North Korean won has no
// convertible market rate; CUC, STD pre-2018, SVC, VEF — all formally
// discontinued/replaced currencies calculator.net still lists for
// historical reference). This is a deliberate, verified scope decision,
// not an oversight — see currency-calculator-notes.md.
//
// ─────────────────────────────────────────────────────────────────
// RESULT FORMATTING — reverse-engineered by comparing ~10 live reference
// scenarios spanning tiny (IRR, VND), huge (IDR, BTC-as-USD), and
// "normal" (EUR, JPY, BHD) conversions. Every single one, on BOTH the
// forward and reverse line, is explained by exactly one rule: round to 5
// decimal places, then strip trailing zeros (and the decimal point
// itself if nothing survives after it), then comma-group the integer
// part. No other rule (e.g. "6 significant figures", "always 5 decimals
// on one line only") survived checking against all 10 scenarios — this
// single toFixed(5)-then-trim rule did. See formatCurrencyRate() below.

const RATES_URL = "https://open.er-api.com/v6/latest/USD";

// [code, name] — the 163-currency intersection described above, in the
// same order calculator.net's own dropdown uses (alphabetical by code).
export const CURRENCY_LIST = [
  ["AED", "United Arab Emirates Dirham"],
  ["AFN", "Afghan Afghani"],
  ["ALL", "Albanian Lek"],
  ["AMD", "Armenian Dram"],
  ["ANG", "Netherlands Antillean Guilder"],
  ["AOA", "Angolan Kwanza"],
  ["ARS", "Argentine Peso"],
  ["AUD", "Australian Dollar"],
  ["AWG", "Aruban Florin"],
  ["AZN", "Azerbaijani Manat"],
  ["BAM", "Bosnia-Herzegovina Convertible Mark"],
  ["BBD", "Barbadian Dollar"],
  ["BDT", "Bangladeshi Taka"],
  ["BGN", "Bulgarian Lev"],
  ["BHD", "Bahraini Dinar"],
  ["BIF", "Burundian Franc"],
  ["BMD", "Bermudan Dollar"],
  ["BND", "Brunei Dollar"],
  ["BOB", "Bolivian Boliviano"],
  ["BRL", "Brazilian Real"],
  ["BSD", "Bahamian Dollar"],
  ["BTN", "Bhutanese Ngultrum"],
  ["BWP", "Botswanan Pula"],
  ["BYN", "Belarusian Ruble"],
  ["BZD", "Belize Dollar"],
  ["CAD", "Canadian Dollar"],
  ["CDF", "Congolese Franc"],
  ["CHF", "Swiss Franc"],
  ["CLF", "Chilean Unit of Account (UF)"],
  ["CLP", "Chilean Peso"],
  ["CNH", "Chinese Yuan (Offshore)"],
  ["CNY", "Chinese Yuan"],
  ["COP", "Colombian Peso"],
  ["CRC", "Costa Rican Colón"],
  ["CUP", "Cuban Peso"],
  ["CVE", "Cape Verdean Escudo"],
  ["CZK", "Czech Republic Koruna"],
  ["DJF", "Djiboutian Franc"],
  ["DKK", "Danish Krone"],
  ["DOP", "Dominican Peso"],
  ["DZD", "Algerian Dinar"],
  ["EGP", "Egyptian Pound"],
  ["ERN", "Eritrean Nakfa"],
  ["ETB", "Ethiopian Birr"],
  ["EUR", "Euro"],
  ["FJD", "Fijian Dollar"],
  ["FKP", "Falkland Islands Pound"],
  ["GBP", "British Pound Sterling"],
  ["GEL", "Georgian Lari"],
  ["GGP", "Guernsey Pound"],
  ["GHS", "Ghanaian Cedi"],
  ["GIP", "Gibraltar Pound"],
  ["GMD", "Gambian Dalasi"],
  ["GNF", "Guinean Franc"],
  ["GTQ", "Guatemalan Quetzal"],
  ["GYD", "Guyanaese Dollar"],
  ["HKD", "Hong Kong Dollar"],
  ["HNL", "Honduran Lempira"],
  ["HRK", "Croatian Kuna"],
  ["HTG", "Haitian Gourde"],
  ["HUF", "Hungarian Forint"],
  ["IDR", "Indonesian Rupiah"],
  ["ILS", "Israeli New Sheqel"],
  ["IMP", "Manx Pound"],
  ["INR", "Indian Rupee"],
  ["IQD", "Iraqi Dinar"],
  ["IRR", "Iranian Rial"],
  ["ISK", "Icelandic Króna"],
  ["JEP", "Jersey Pound"],
  ["JMD", "Jamaican Dollar"],
  ["JOD", "Jordanian Dinar"],
  ["JPY", "Japanese Yen"],
  ["KES", "Kenyan Shilling"],
  ["KGS", "Kyrgystani Som"],
  ["KHR", "Cambodian Riel"],
  ["KMF", "Comorian Franc"],
  ["KRW", "South Korean Won"],
  ["KWD", "Kuwaiti Dinar"],
  ["KYD", "Cayman Islands Dollar"],
  ["KZT", "Kazakhstani Tenge"],
  ["LAK", "Laotian Kip"],
  ["LBP", "Lebanese Pound"],
  ["LKR", "Sri Lankan Rupee"],
  ["LRD", "Liberian Dollar"],
  ["LSL", "Lesotho Loti"],
  ["LYD", "Libyan Dinar"],
  ["MAD", "Moroccan Dirham"],
  ["MDL", "Moldovan Leu"],
  ["MGA", "Malagasy Ariary"],
  ["MKD", "Macedonian Denar"],
  ["MMK", "Myanma Kyat"],
  ["MNT", "Mongolian Tugrik"],
  ["MOP", "Macanese Pataca"],
  ["MRU", "Mauritanian Ouguiya"],
  ["MUR", "Mauritian Rupee"],
  ["MVR", "Maldivian Rufiyaa"],
  ["MWK", "Malawian Kwacha"],
  ["MXN", "Mexican Peso"],
  ["MYR", "Malaysian Ringgit"],
  ["MZN", "Mozambican Metical"],
  ["NAD", "Namibian Dollar"],
  ["NGN", "Nigerian Naira"],
  ["NIO", "Nicaraguan Córdoba"],
  ["NOK", "Norwegian Krone"],
  ["NPR", "Nepalese Rupee"],
  ["NZD", "New Zealand Dollar"],
  ["OMR", "Omani Rial"],
  ["PAB", "Panamanian Balboa"],
  ["PEN", "Peruvian Nuevo Sol"],
  ["PGK", "Papua New Guinean Kina"],
  ["PHP", "Philippine Peso"],
  ["PKR", "Pakistani Rupee"],
  ["PLN", "Polish Zloty"],
  ["PYG", "Paraguayan Guarani"],
  ["QAR", "Qatari Rial"],
  ["RON", "Romanian Leu"],
  ["RSD", "Serbian Dinar"],
  ["RUB", "Russian Ruble"],
  ["RWF", "Rwandan Franc"],
  ["SAR", "Saudi Riyal"],
  ["SBD", "Solomon Islands Dollar"],
  ["SCR", "Seychellois Rupee"],
  ["SDG", "Sudanese Pound"],
  ["SEK", "Swedish Krona"],
  ["SGD", "Singapore Dollar"],
  ["SHP", "Saint Helena Pound"],
  ["SLE", "Sierra Leonean Leone"],
  ["SLL", "Sierra Leonean Leone (Old)"],
  ["SOS", "Somali Shilling"],
  ["SRD", "Surinamese Dollar"],
  ["SSP", "South Sudanese Pound"],
  ["STN", "São Tomé and Príncipe Dobra"],
  ["SYP", "Syrian Pound"],
  ["SZL", "Swazi Lilangeni"],
  ["THB", "Thai Baht"],
  ["TJS", "Tajikistani Somoni"],
  ["TMT", "Turkmenistani Manat"],
  ["TND", "Tunisian Dinar"],
  ["TOP", "Tongan Pa'anga"],
  ["TRY", "Turkish Lira"],
  ["TTD", "Trinidad and Tobago Dollar"],
  ["TWD", "New Taiwan Dollar"],
  ["TZS", "Tanzanian Shilling"],
  ["UAH", "Ukrainian Hryvnia"],
  ["UGX", "Ugandan Shilling"],
  ["USD", "United States Dollar"],
  ["UYU", "Uruguayan Peso"],
  ["UZS", "Uzbekistan Som"],
  ["VES", "Venezuelan Bolívar Soberano"],
  ["VND", "Vietnamese Dong"],
  ["VUV", "Vanuatu Vatu"],
  ["WST", "Samoan Tala"],
  ["XAF", "CFA Franc BEAC"],
  ["XCD", "East Caribbean Dollar"],
  ["XCG", "Caribbean Guilder"],
  ["XDR", "Special Drawing Rights"],
  ["XOF", "CFA Franc BCEAO"],
  ["XPF", "CFP Franc"],
  ["YER", "Yemeni Rial"],
  ["ZAR", "South African Rand"],
  ["ZMW", "Zambian Kwacha"],
  ["ZWG", "Zimbabwean ZiG"],
  ["ZWL", "Zimbabwean Dollar"],
];

// The reference's own "most popular" subset (verified from its embedded
// `majorCurrencies` JS string), minus BTC — not part of this engine's
// currency coverage (see file header).
export const MAJOR_CURRENCY_CODES = new Set([
  "USD", "ZAR", "AUD", "CAD", "CHF", "GBP", "JPY", "EUR",
  "CNY", "INR", "BRL", "RUB", "HKD", "MXN", "KRW", "SGD",
]);

export const DEFAULT_FROM = "USD";
export const DEFAULT_TO = "EUR";

/** Fetches live USD-based rates once. Returns { rates, updatedAt } where
 * `rates[code]` is "how many units of `code` equal 1 USD" — the same
 * convention the API itself uses, letting any A→B rate be derived as
 * `rates[B] / rates[A]` without a separate request per currency pair. */
export async function fetchLiveRates() {
  const res = await fetch(RATES_URL);
  if (!res.ok) throw new Error(`Rate service returned ${res.status}`);
  const data = await res.json();
  if (data.result !== "success" || !data.rates) throw new Error("Rate service returned an unexpected response");
  return { rates: data.rates, updatedAt: data.time_last_update_utc || null };
}

/** A→B rate derived from USD-based rates (see fetchLiveRates). */
export function crossRate(rates, from, to) {
  const a = rates[from];
  const b = rates[to];
  if (!a || !b) return null;
  return b / a;
}

/** Converts `amount` from `from` to `to` using live `rates`. Returns both
 * directions, matching the reference's own two-line result (both lines
 * scale with the entered amount — verified live with a non-100 amount). */
export function convertLive(amount, from, to, rates) {
  const rate = crossRate(rates, from, to);
  if (rate == null) return null;
  const amt = Number(amount) || 0;
  return {
    rate,
    forward: amt * rate,
    reverse: amt / rate,
  };
}

/** The offline "Customized Currency Exchange Rate" calculator: given
 * "1 unit of A = `rate` units of B" and an `amount` to exchange, returns
 * both directions — amount treated as units of A (forward) and, on the
 * same line convention as the reference, also as units of B (reverse). */
export function convertCustomRate(rate, amount) {
  const r = Number(rate) || 0;
  const amt = Number(amount) || 0;
  return {
    aToB: amt * r,
    bToA: r !== 0 ? amt / r : 0,
  };
}

/** Reverse-engineered exactly from the live reference (see file header):
 * round to 5 decimal places, strip trailing zeros (and a bare trailing
 * decimal point), then comma-group the integer part. Verified against
 * 10 scenarios spanning IRR/VND (tiny), IDR/BTC-equivalent (huge), and
 * ordinary (EUR/JPY/BHD) conversions — this single rule reproduced every
 * one of them exactly, including two that looked like exceptions to
 * every simpler "N significant figures" or "always N decimals" rule. */
export function formatCurrencyRate(value) {
  if (!Number.isFinite(value)) return "0";
  const negative = value < 0;
  let s = Math.abs(value).toFixed(5);
  if (s.includes(".")) s = s.replace(/0+$/, "").replace(/\.$/, "");
  const [intPart, decPart] = s.split(".");
  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return (negative ? "-" : "") + withCommas + (decPart ? `.${decPart}` : "");
}

/** Formats a UTC timestamp string (e.g. "Fri, 05 Sep 2026 00:02:32 +0000",
 * the format open.er-api.com returns) the way the reference phrases its
 * own rate-source credit line. Falls back gracefully if unparseable. */
export function formatRateTimestamp(updatedAt) {
  if (!updatedAt) return null;
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return null;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${months[d.getUTCMonth()]}. ${d.getUTCDate()}, ${d.getUTCFullYear()}, ${hh}:${mm} UTC`;
}
