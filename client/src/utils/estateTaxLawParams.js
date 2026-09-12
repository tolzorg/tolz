// Pure tax-law data for the Estate Tax Calculator, matching
// calculator.net/estate-tax-calculator.html.
//
// VERIFIED EXACT against the live reference (plain GET requests — this
// page, unlike the Marriage Tax / Income Tax calculators, DOES have a
// working query-string interface):
//  - 2026 federal lifetime exemption = $15,000,000 (confirmed by
//    bisecting the exact dollar boundary live: $15,000,000 = $0 tax,
//    $15,000,001 = the "taxable after exemption" sentence appears).
//  - The federal estate tax rate is a FLAT 40% on the entire amount
//    over the exemption — NOT the real, graduated 18%-40% federal
//    estate/gift tax bracket schedule. Confirmed by testing several
//    excess amounts (e.g. exactly $100,000 over the exemption produces
//    exactly $40,000 tax = 100,000 × 0.40, not the ~$23,800 a graduated
//    18%→40% schedule would produce). This is the reference's own
//    simplification, replicated here for exact parity.
//  - The reference always also shows a secondary "If it was {prior
//    year}, ..." sentence using the SAME flat 40% rate but the PRIOR
//    year's exemption — confirmed the 2025 exemption is $13,990,000 by
//    solving backward from a live result. This sentence only appears
//    when the CURRENT year's calculation is itself over the exemption
//    (never shown in the "within the exemption" branch, even when the
//    estate would have exceeded the prior year's smaller exemption).
//
// Historical exemption/rate table (2001-2026) reproduced from the
// reference's own "U.S. Estate and Gift Tax Exemptions and Tax Rates"
// info table, for the FAQ section — not used by the calculator logic
// itself except for CURRENT_YEAR and PRIOR_YEAR below.
export const EXEMPTION_HISTORY = [
  { year: 2001, exemption: "$675,000", rate: "55%" },
  { year: 2002, exemption: "$1 million", rate: "50%" },
  { year: 2003, exemption: "$1 million", rate: "49%" },
  { year: 2004, exemption: "$1.5 million", rate: "48%" },
  { year: 2005, exemption: "$1.5 million", rate: "47%" },
  { year: 2006, exemption: "$2 million", rate: "46%" },
  { year: 2007, exemption: "$2 million", rate: "45%" },
  { year: 2008, exemption: "$2 million", rate: "45%" },
  { year: 2009, exemption: "$3.5 million", rate: "45%" },
  { year: 2010, exemption: "Repealed", rate: "0%" },
  { year: 2011, exemption: "$5 million", rate: "35%" },
  { year: 2012, exemption: "$5.12 million", rate: "35%" },
  { year: 2013, exemption: "$5.25 million", rate: "40%" },
  { year: 2014, exemption: "$5.34 million", rate: "40%" },
  { year: 2015, exemption: "$5.43 million", rate: "40%" },
  { year: 2016, exemption: "$5.45 million", rate: "40%" },
  { year: 2017, exemption: "$5.49 million", rate: "40%" },
  { year: 2018, exemption: "$11.18 million", rate: "40%" },
  { year: 2019, exemption: "$11.4 million", rate: "40%" },
  { year: 2020, exemption: "$11.58 million", rate: "40%" },
  { year: 2021, exemption: "$11.7 million", rate: "40%" },
  { year: 2022, exemption: "$12.06 million", rate: "40%" },
  { year: 2023, exemption: "$12.92 million", rate: "40%" },
  { year: 2024, exemption: "$13.61 million", rate: "40%" },
  { year: 2025, exemption: "$13.99 million", rate: "40%" },
  { year: 2026, exemption: "$15 million", rate: "40%" },
];

// Exact exemption amounts (not the rounded display strings above),
// keyed by year, used by the calculator engine.
export const EXEMPTION_BY_YEAR = {
  2025: 13990000,
  2026: 15000000,
};

export const FLAT_ESTATE_TAX_RATE = 0.40;
export const ANNUAL_GIFT_TAX_EXCLUSION_2026 = 19000;

export const CURRENT_YEAR = 2026;
export const PRIOR_YEAR = 2025;
