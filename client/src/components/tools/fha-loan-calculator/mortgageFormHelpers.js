// Non-component helpers shared by the FHA Loan and VA Mortgage calculator forms.

export const linkButton = { background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 700, cursor: "pointer", textDecoration: "underline", padding: 0 };

export function thisMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: String(now.getFullYear()) };
}

/** Start date plus the three extra-payment dates, all defaulting to this month. */
export function initialDates() {
  const { month, year } = thisMonthYear();
  return {
    startMonth: month, startYear: year, extraMonthlyMonth: month, extraMonthlyYear: year,
    extraYearlyMonth: month, extraYearlyYear: year, extraOneTimeMonth: month, extraOneTimeYear: year,
  };
}
