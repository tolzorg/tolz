// Mortgage Amortization Calculator engine — matches
// calculator.net/mortgage-amortization-calculator.html (decoded with live GET
// probes; see scripts/mortgage-amortization-calculator.test.js).
//
// The page is the Canadian Mortgage Calculator's sister page, so it runs on
// the same core (calculateMortgagePage) with these differences: the rate
// compounds monthly (R ÷ 1200), the premium is labelled "PMI" ("PMI insurance"
// in its error) and the HOA line "HOA Fee", and with the optionals unticked
// the summary has no payoff date at all.

import { calculateMortgagePage } from "./canadianMortgageCalculatorEngine.js";

export const AMORTIZATION_DEFAULTS = {
  price: "500000", downPayment: "20", years: "30", rate: "7.449",
  propertyTaxes: "1.2", homeInsurance: "2500", mortgageInsurance: "0", hoa: "0", otherCosts: "5000",
};

const PAGE = {
  monthlyRate: (rate) => rate / 1200,
  pmiName: "PMI insurance", hoaName: "HOA fee", pmiLabel: "PMI", hoaLabel: "HOA Fee",
  payoffWithoutOptionals: "omit",
};

/**
 * @param {object} input — strings as typed: price, downPayment (%), years,
 *   rate, includeOptionals (bool), propertyTaxes (% of price), homeInsurance,
 *   mortgageInsurance (PMI), hoa, otherCosts ($/year), startMonth, startYear.
 */
export function calculateMortgageAmortization(input) {
  return calculateMortgagePage(input, PAGE);
}
