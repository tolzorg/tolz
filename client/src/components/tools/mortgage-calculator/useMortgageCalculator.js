import { useCallback, useState } from "react";
import {
  resolveDownPayment, resolveAnnualCost, buildAmortizationSchedule, computeBiweeklyPayoff,
} from "../../../utils/mortgageCalculatorEngine";

const now = new Date();
const DEFAULT_START_MONTH = now.getMonth() + 1;
const DEFAULT_START_YEAR = now.getFullYear();

// Demo numbers shown as placeholder hint text in their fields, not
// pre-filled as actual values — the field starts empty, and calculate()
// falls back to these only if the user leaves it blank. Keeps the
// calculator immediately usable (click Calculate with nothing typed and
// still get a sensible result) without the inputs looking pre-answered.
export const MORTGAGE_PLACEHOLDERS = {
  homePrice: "400000",
  downPaymentValue: "20",
  loanTermYears: "30",
  interestRate: "6.5",
  propertyTaxValue: "1.2",
  homeInsuranceValue: "1500",
  pmiValue: "0",
  hoaValue: "0",
  otherCostsValue: "0",
};

const DEFAULTS = {
  homePrice: 400_000,
  downPaymentValue: 20,
  downPaymentUnit: "percent",
  loanTermYears: 30,
  interestRate: 6.5,
  startMonth: DEFAULT_START_MONTH,
  startYear: DEFAULT_START_YEAR,
  // Matches the reference calculator: taxes & costs start collapsed/unchecked.
  includeTaxesAndCosts: false,
  propertyTaxValue: 1.2,
  propertyTaxUnit: "percent",
  homeInsuranceValue: 1500,
  homeInsuranceUnit: "dollar",
  pmiValue: 0,
  pmiUnit: "dollar",
  hoaValue: 0,
  hoaUnit: "dollar",
  otherCostsValue: 0,
  otherCostsUnit: "dollar",
};

// The actual starting field state: same as DEFAULTS, except every field
// with a demo placeholder (see MORTGAGE_PLACEHOLDERS) starts blank rather
// than pre-filled with that demo number.
const INITIAL_INPUTS = { ...DEFAULTS };
for (const key of Object.keys(MORTGAGE_PLACEHOLDERS)) INITIAL_INPUTS[key] = "";

const EMPTY_EXTRA_MONTHLY = { amount: "", month: DEFAULT_START_MONTH, year: DEFAULT_START_YEAR };
const EMPTY_EXTRA_YEARLY = { amount: "", month: DEFAULT_START_MONTH, year: DEFAULT_START_YEAR };
const EMPTY_ONE_TIME = { amount: "", month: DEFAULT_START_MONTH, year: DEFAULT_START_YEAR };

export const MAX_ADDITIONAL_ONE_TIME_PAYMENTS = 10;

// Ten fixed slots, not a dynamically added/removed list. Every row defaults
// to the loan's own Start Date (not a Jan-Oct calendar spread) — verified
// against the reference calculator's own preset: it seeds every additional
// one-time row to the loan's start month/year, so all ten land in the same
// first simulated month unless the user moves them. Defaulting them earlier
// than the start date (as a Jan-Oct spread would, whenever Start Date isn't
// January) silently drops however many fall before month 0, since one-time
// payments before the loan origination have nothing to apply against.
function buildAdditionalOneTimeRows(month, year) {
  return Array.from({ length: MAX_ADDITIONAL_ONE_TIME_PAYMENTS }, () => ({ amount: "", month, year }));
}

function hasAmount(entry) {
  return entry && entry.amount !== "" && Number(entry.amount) > 0;
}

// Drives the Mortgage Calculator: holds every input field from
// calculator.net's mortgage calculator, and computes the full result
// (amortization schedule + baseline + biweekly comparison) only when the
// user explicitly clicks Calculate — matching the reference's own
// "Modify the values and click the Calculate button to use" behavior
// rather than recalculating live on every keystroke.
export function useMortgageCalculator() {
  const [inputs, setInputs] = useState(INITIAL_INPUTS);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [increaseRates, setIncreaseRates] = useState({ propertyTax: "", homeInsurance: "", hoa: "", otherCosts: "" });
  const [extraMonthly, setExtraMonthly] = useState(EMPTY_EXTRA_MONTHLY);
  const [extraYearly, setExtraYearly] = useState(EMPTY_EXTRA_YEARLY);
  const [extraOneTime, setExtraOneTime] = useState(EMPTY_ONE_TIME);
  const [showAdditionalOneTime, setShowAdditionalOneTime] = useState(false);
  const [additionalOneTimePayments, setAdditionalOneTimePayments] = useState(() => buildAdditionalOneTimeRows(DEFAULT_START_MONTH, DEFAULT_START_YEAR));
  const [showBiweekly, setShowBiweekly] = useState(false);

  const [result, setResult] = useState(null);
  const [amortizationView, setAmortizationView] = useState("annual"); // annual | monthly

  const setField = useCallback((key, value) => setInputs((prev) => ({ ...prev, [key]: value })), []);

  const toggleAdditionalOneTime = useCallback(() => {
    setShowAdditionalOneTime((prev) => {
      const next = !prev;
      // Re-seed the rows to the current Start Date the first time this is
      // opened after a Clear, so the presets stay sensible.
      if (next) {
        setAdditionalOneTimePayments((rows) => (
          rows.length ? rows : buildAdditionalOneTimeRows(inputs.startMonth, inputs.startYear)
        ));
      }
      return next;
    });
  }, [inputs.startMonth, inputs.startYear]);
  const updateOneTimePayment = useCallback((index, field, value) => {
    setAdditionalOneTimePayments((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }, []);

  // Converts a {month, year} pair relative to the loan's own start date
  // into a 0-indexed month offset into the amortization simulation.
  const toMonthIndex = useCallback((month, year) => {
    const start = inputs.startMonth + inputs.startYear * 12;
    const target = Number(month) + Number(year) * 12;
    return target - start;
  }, [inputs.startMonth, inputs.startYear]);

  const calculate = useCallback(() => {
    // Fields with a placeholder (see MORTGAGE_PLACEHOLDERS) start blank —
    // "" falls back to the DEFAULTS demo number here; anything the user
    // actually typed (including "0") is used as-is.
    const homePrice = Math.max(0, Number(inputs.homePrice || DEFAULTS.homePrice) || 0);
    const { dollars: downPaymentDollars } = resolveDownPayment(homePrice, inputs.downPaymentValue || DEFAULTS.downPaymentValue, inputs.downPaymentUnit);
    const loanAmount = Math.max(0, homePrice - downPaymentDollars);

    const costs = inputs.includeTaxesAndCosts
      ? {
          propertyTaxAnnual: resolveAnnualCost(inputs.propertyTaxValue || DEFAULTS.propertyTaxValue, inputs.propertyTaxUnit, homePrice),
          homeInsuranceAnnual: resolveAnnualCost(inputs.homeInsuranceValue || DEFAULTS.homeInsuranceValue, inputs.homeInsuranceUnit, homePrice),
          pmiAnnual: resolveAnnualCost(inputs.pmiValue || DEFAULTS.pmiValue, inputs.pmiUnit, loanAmount),
          hoaAnnual: resolveAnnualCost(inputs.hoaValue || DEFAULTS.hoaValue, inputs.hoaUnit, homePrice),
          otherCostsAnnual: resolveAnnualCost(inputs.otherCostsValue || DEFAULTS.otherCostsValue, inputs.otherCostsUnit, homePrice),
          propertyTaxIncreasePercent: Number(increaseRates.propertyTax) || 0,
          homeInsuranceIncreasePercent: Number(increaseRates.homeInsurance) || 0,
          hoaIncreasePercent: Number(increaseRates.hoa) || 0,
          otherCostsIncreasePercent: Number(increaseRates.otherCosts) || 0,
        }
      : {};

    const oneTimePayments = [];
    if (hasAmount(extraOneTime)) {
      oneTimePayments.push({ amount: Number(extraOneTime.amount), monthIndex: toMonthIndex(extraOneTime.month, extraOneTime.year) });
    }
    if (showAdditionalOneTime) {
      for (const p of additionalOneTimePayments) {
        if (hasAmount(p)) oneTimePayments.push({ amount: Number(p.amount), monthIndex: toMonthIndex(p.month, p.year) });
      }
    }

    const extraMonthlyParam = hasAmount(extraMonthly)
      ? { amount: Number(extraMonthly.amount), startMonthIndex: Math.max(0, toMonthIndex(extraMonthly.month, extraMonthly.year)) }
      : null;
    const extraYearlyParam = hasAmount(extraYearly)
      ? { amount: Number(extraYearly.amount), startMonthIndex: Math.max(0, toMonthIndex(extraYearly.month, extraYearly.year)) }
      : null;
    const hasExtraPayments = Boolean(extraMonthlyParam || extraYearlyParam || oneTimePayments.length);

    const startDate = { month: inputs.startMonth, year: inputs.startYear };
    const baseParams = { loanAmount, homePrice, annualRatePercent: Number(inputs.interestRate || DEFAULTS.interestRate) || 0, termYears: Number(inputs.loanTermYears || DEFAULTS.loanTermYears) || 0, startDate };

    const schedule = buildAmortizationSchedule({
      ...baseParams, ...costs,
      extraMonthly: extraMonthlyParam, extraYearly: extraYearlyParam, oneTimePayments,
    });

    // A no-extra-payments baseline, used only to report how much time/
    // interest the extra payments actually saved — cheap to compute (no
    // costs needed, since "Total Interest" is cost-independent) and only
    // needed when there's something to compare against.
    const baselineSchedule = hasExtraPayments ? buildAmortizationSchedule(baseParams) : null;

    const biweekly = showBiweekly ? computeBiweeklyPayoff(baseParams) : null;

    setResult({
      homePrice, downPaymentDollars, loanAmount, schedule, baselineSchedule, biweekly,
      includeTaxesAndCosts: inputs.includeTaxesAndCosts, hasExtraPayments,
    });
  }, [inputs, increaseRates, extraMonthly, extraYearly, extraOneTime, showAdditionalOneTime, additionalOneTimePayments, showBiweekly, toMonthIndex]);

  const clear = useCallback(() => {
    setInputs(INITIAL_INPUTS);
    setShowMoreOptions(false);
    setIncreaseRates({ propertyTax: "", homeInsurance: "", hoa: "", otherCosts: "" });
    setExtraMonthly(EMPTY_EXTRA_MONTHLY);
    setExtraYearly(EMPTY_EXTRA_YEARLY);
    setExtraOneTime(EMPTY_ONE_TIME);
    setShowAdditionalOneTime(false);
    setAdditionalOneTimePayments(buildAdditionalOneTimeRows(DEFAULT_START_MONTH, DEFAULT_START_YEAR));
    setShowBiweekly(false);
    setResult(null);
  }, []);

  return {
    inputs, setField,
    showMoreOptions, setShowMoreOptions,
    increaseRates, setIncreaseRates,
    extraMonthly, setExtraMonthly,
    extraYearly, setExtraYearly,
    extraOneTime, setExtraOneTime,
    showAdditionalOneTime, toggleAdditionalOneTime, additionalOneTimePayments, updateOneTimePayment,
    showBiweekly, setShowBiweekly,
    result, amortizationView, setAmortizationView,
    calculate, clear,
  };
}
