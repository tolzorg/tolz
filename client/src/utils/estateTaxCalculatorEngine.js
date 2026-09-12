// Estate Tax Calculator engine — matches calculator.net's
// estate-tax-calculator.html exactly. Unlike the Marriage Tax / Income
// Tax calculators, this reference page DOES have a working GET
// query-string interface, so every figure below was verified via plain
// curl requests against the live site (residence=32&stock=5&... etc.,
// matching the field `name` attributes exactly) — see
// estate-tax-calculator-notes.md for the full writeup.
//
// VERIFIED EXACT (to the penny, via live GET requests):
//   netTaxableEstate = totalAssets - totalLiabilities        (can be negative)
//   totalTaxableTransfers = netTaxableEstate + lifetimeGifted
//   taxableAfterExemption = max(0, totalTaxableTransfers - exemption)
//   federalEstateTax = taxableAfterExemption * 0.40           (flat rate,
//     NOT the real graduated 18%-40% federal schedule — the reference's
//     own simplification, confirmed by testing several excess amounts)
//   afterTaxValue = netTaxableEstate - federalEstateTax
// The lifetime gifted amount competes for the SAME unified exemption as
// the estate itself (confirmed live: a tiny net estate plus a huge
// lifetime-gifted figure that alone exceeds the exemption still produces
// a nonzero tax) but is NOT part of afterTaxValue (it was already given
// away during the person's lifetime).

import { EXEMPTION_BY_YEAR, FLAT_ESTATE_TAX_RATE, CURRENT_YEAR, PRIOR_YEAR } from "./estateTaxLawParams.js";

export { formatCurrency } from "./financeCalculatorEngine.js";

export const DEFAULTS = {
  residence: "0", stock: "0", saving: "0", vehicle: "0", retirement: "0",
  lifeinsurance: "0", otherasset: "0",
  debt: "0", funeral: "0", charitable: "0", statetax: "0",
  lifetimegifted: "0",
};

function num(v) {
  return Number(v) || 0;
}

/** Computes the estate tax for a single year's exemption. */
function computeForYear(totalTaxableTransfers, year) {
  const exemption = EXEMPTION_BY_YEAR[year];
  const taxableAfterExemption = Math.max(0, totalTaxableTransfers - exemption);
  const federalEstateTax = taxableAfterExemption * FLAT_ESTATE_TAX_RATE;
  return { exemption, taxableAfterExemption, federalEstateTax };
}

export function calculateEstateTax(inputs) {
  const assets = {
    residence: num(inputs.residence), stock: num(inputs.stock), saving: num(inputs.saving),
    vehicle: num(inputs.vehicle), retirement: num(inputs.retirement),
    lifeinsurance: num(inputs.lifeinsurance), otherasset: num(inputs.otherasset),
  };
  const totalAssets = assets.residence + assets.stock + assets.saving + assets.vehicle
    + assets.retirement + assets.lifeinsurance + assets.otherasset;

  const liabilities = {
    debt: num(inputs.debt), funeral: num(inputs.funeral),
    charitable: num(inputs.charitable), statetax: num(inputs.statetax),
  };
  const totalLiabilities = liabilities.debt + liabilities.funeral + liabilities.charitable + liabilities.statetax;

  const lifetimeGifted = num(inputs.lifetimegifted);

  const netTaxableEstate = totalAssets - totalLiabilities;
  const totalTaxableTransfers = netTaxableEstate + lifetimeGifted;

  const current = computeForYear(totalTaxableTransfers, CURRENT_YEAR);
  const afterTaxValue = netTaxableEstate - current.federalEstateTax;

  // Confirmed live: the "if it was {prior year}" comparison sentence
  // only appears when the CURRENT year's own calculation is over the
  // exemption (i.e. current.taxableAfterExemption > 0) — never shown
  // just because the prior year's smaller exemption alone would have
  // been exceeded.
  let prior = null;
  if (current.taxableAfterExemption > 0) {
    const p = computeForYear(totalTaxableTransfers, PRIOR_YEAR);
    prior = { year: PRIOR_YEAR, ...p, afterTaxValue: netTaxableEstate - p.federalEstateTax };
  }

  return {
    totalAssets,
    totalLiabilities,
    lifetimeGifted,
    netTaxableEstate,
    totalTaxableTransfers,
    year: CURRENT_YEAR,
    exemption: current.exemption,
    withinExemption: current.taxableAfterExemption <= 0,
    taxableAfterExemption: current.taxableAfterExemption,
    federalEstateTax: current.federalEstateTax,
    afterTaxValue,
    prior,
  };
}
