// Sales Tax Calculator engine — matches
// calculator.net/sales-tax-calculator.html: given any TWO of {before-tax
// price, sales tax rate, after-tax price}, solve for the third.
//
// Every rule below was reverse-engineered by driving the live reference
// with plain GET requests (its form submits GET to the same page,
// server-rendered) across every pairwise combination of given/blank
// fields, plus edge cases (zero values, negative values, all 3 given,
// fewer than 2 given).

/** Which field gets solved when all 3 combinations are theoretically
 * possible is NOT simply "whichever is blank" — confirmed live by
 * submitting all 3 fields non-empty at once: the reference silently
 * IGNORES the submitted after-tax price and recomputes it anyway. The
 * real priority order, confirmed by testing every pairwise combination:
 *   1. before-tax price + tax rate given → solve after-tax price
 *      (checked FIRST, wins even when after-tax price was also filled in)
 *   2. before-tax price + after-tax price given → solve tax rate
 *   3. tax rate + after-tax price given → solve before-tax price
 * Fewer than 2 fields given is a distinct error, checked before any of
 * the above. */
export function calculateSalesTax({ beforeTax, taxRate, afterTax }) {
  const hasBefore = beforeTax !== "" && beforeTax != null;
  const hasRate = taxRate !== "" && taxRate != null;
  const hasAfter = afterTax !== "" && afterTax != null;

  const presentCount = [hasBefore, hasRate, hasAfter].filter(Boolean).length;
  if (presentCount < 2) {
    return { error: "Please provide at least two values to calculate." };
  }

  const beforeNum = Number(beforeTax);
  const rateNum = Number(taxRate);
  const afterNum = Number(afterTax);

  // Per-field validity — confirmed live these are asymmetric: before-tax
  // price must be STRICTLY positive (0 itself is rejected), while tax
  // rate and after-tax price only reject NEGATIVE values (0 is valid for
  // both — a 0% tax rate, or an after-tax price equal to before-tax,
  // are legitimate results/inputs).
  if (hasBefore && !(beforeNum > 0)) {
    return { error: "Please provide a valid before tax price." };
  }
  if (hasRate && !(rateNum >= 0)) {
    return { error: "Please provide a valid sales tax rate." };
  }
  if (hasAfter && !(afterNum >= 0)) {
    return { error: "Please provide a valid after tax price." };
  }

  let solved;
  let before, rate, after;

  if (hasBefore && hasRate) {
    solved = "after";
    before = beforeNum;
    rate = rateNum;
    after = before * (1 + rate / 100);
  } else if (hasBefore && hasAfter) {
    solved = "rate";
    before = beforeNum;
    after = afterNum;
    // Confirmed live: a negative implied rate (after < before) is
    // rejected with its own distinct message, not silently computed.
    if (after < before) {
      return { error: "After tax price can not be smaller than before tax price." };
    }
    rate = ((after - before) / before) * 100;
  } else {
    solved = "before";
    rate = rateNum;
    after = afterNum;
    before = after / (1 + rate / 100);
  }

  return { solved, before, rate, after, taxDollar: after - before };
}

export function formatCurrency(value, { decimals = 2 } = {}) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatPercent(value, decimals = 2) {
  const n = Number(value) || 0;
  return `${n.toFixed(decimals)}%`;
}
