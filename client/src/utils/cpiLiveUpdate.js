// Live update fetch for the Inflation Calculator's CPI dataset.
//
// cpiData.js ships a STATIC snapshot (1913 through whatever month it was
// last regenerated) — accurate, but two things make it drift from BLS's
// own live data over time: (1) a brand new month is published roughly
// every two weeks after that month ends, and (2) BLS occasionally
// revises a recently-published figure, and this dataset's one SYNTHETIC
// value (October 2025, interpolated to fill a real gap left by the 2025
// government shutdown — see cpiData.js's header) should be replaced by
// a real figure the moment BLS ever publishes one.
//
// Re-embedding the whole 1913+ dataset on every page load isn't
// necessary (that deep history essentially never changes) or even
// possible without a server proxy (BLS's API caps a single request to a
// 10-year span without a registration key, and the CSV mirror this
// dataset was built from — FRED's fredgraph.csv — has NO CORS headers
// at all, so a browser can't fetch it directly no matter how it's
// called). Instead, this re-checks a small RECENT rolling window
// (RECHECK_YEARS_BACK years) against BLS's OFFICIAL public API — which,
// unlike the CSV mirror, IS fully CORS-open and needs no key at all —
// every page load. Whatever BLS returns for that window is treated as
// authoritative and allowed to override the static snapshot for those
// specific months, which naturally covers both a brand new month
// arriving AND a revision to (or real replacement of) a recent one,
// with one mechanism. Falling back to the static baseline alone
// (silently, no error shown) is always safe: it's a complete, correct
// dataset on its own, just potentially a little behind.
//
// This deliberately does NOT reach deeper than RECHECK_YEARS_BACK years
// back — BLS revisions to CPI-U (NSA) more than a couple of years old
// are vanishingly rare in practice, and checking the FULL 113-year
// history live on every page load would mean many chunked 10-year
// requests (slow, and needless load on a free public API) for a
// near-zero chance of finding anything. A deep, one-time historical
// re-verification is still a manual "regenerate cpiData.js from FRED"
// job, not something worth doing on every page view.
//
// Series ID CUUR0000SA0 = "CPI-U, U.S. city average, All items, NOT
// seasonally adjusted" — the exact same series cpiData.js was built
// from (confirmed: overlapping months match to the thousandth).

const BLS_SERIES_ID = "CUUR0000SA0";
const BLS_URL = `https://api.bls.gov/publicAPI/v2/timeseries/data/${BLS_SERIES_ID}`;
const RECHECK_YEARS_BACK = 3;

/** Fetches BLS's own current figures for the last RECHECK_YEARS_BACK
 * years (comfortably within BLS's 10-year no-key limit). Returns an
 * ascending array of { year, month, value } for every month BLS has
 * data for in that window — covering both genuinely new months AND any
 * revision to (or real replacement of a synthetic estimate for) a
 * recent one — or [] if the fetch/parse fails for any reason. This
 * never throws: a failed check should silently leave the existing data
 * in place, not break the calculator. */
export async function fetchRecentCpiWindow() {
  try {
    const currentYear = new Date().getUTCFullYear();
    const startYear = currentYear - RECHECK_YEARS_BACK;
    const res = await fetch(`${BLS_URL}?startyear=${startYear}&endyear=${currentYear}`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "REQUEST_SUCCEEDED") return [];
    const series = data.Results?.series?.[0]?.data;
    if (!Array.isArray(series)) return [];

    const months = [];
    for (const row of series) {
      const year = Number(row.year);
      const monthMatch = /^M(\d{2})$/.exec(row.period);
      if (!monthMatch) continue; // skip BLS's own "M13" annual-average rows — this engine computes averages itself
      const month = Number(monthMatch[1]);
      const value = Number(row.value);
      if (!Number.isFinite(value)) continue;
      months.push({ year, month, value });
    }
    months.sort((a, b) => (a.year - b.year) || (a.month - b.month));
    return months;
  } catch {
    return [];
  }
}
