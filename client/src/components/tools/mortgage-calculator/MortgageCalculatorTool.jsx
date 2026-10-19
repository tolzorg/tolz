import { useMortgageCalculator } from "./useMortgageCalculator";
import MortgageInputsPanel from "./MortgageInputsPanel";
import MortgageResultsPanel from "./MortgageResultsPanel";
import MortgageAmortizationTable from "./MortgageAmortizationTable";
import { RequiredProvider } from "../calculator-ui/Required";

export default function MortgageCalculatorTool() {
  const {
    inputs, setField,
    showMoreOptions, setShowMoreOptions,
    increaseRates, setIncreaseRates,
    extraMonthly, setExtraMonthly,
    extraYearly, setExtraYearly,
    extraOneTime, setExtraOneTime,
    showAdditionalOneTime, toggleAdditionalOneTime, additionalOneTimePayments, updateOneTimePayment,
    showBiweekly, setShowBiweekly,
    result, amortizationView, setAmortizationView,
    calculate, clear, flagged,
  } = useMortgageCalculator();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <RequiredProvider flagged={flagged}>
          <MortgageInputsPanel
            inputs={inputs} setField={setField}
            showMoreOptions={showMoreOptions} setShowMoreOptions={setShowMoreOptions}
            increaseRates={increaseRates} setIncreaseRates={setIncreaseRates}
            extraMonthly={extraMonthly} setExtraMonthly={setExtraMonthly}
            extraYearly={extraYearly} setExtraYearly={setExtraYearly}
            extraOneTime={extraOneTime} setExtraOneTime={setExtraOneTime}
            showAdditionalOneTime={showAdditionalOneTime} toggleAdditionalOneTime={toggleAdditionalOneTime}
            additionalOneTimePayments={additionalOneTimePayments} updateOneTimePayment={updateOneTimePayment}
            showBiweekly={showBiweekly} setShowBiweekly={setShowBiweekly}
            onCalculate={calculate} onClear={clear}
          />
          </RequiredProvider>
        </div>

        <div style={{ flex: "1 1 380px", minWidth: 320 }}>
          <MortgageResultsPanel result={result} />
        </div>
      </div>

      {result && (
        <MortgageAmortizationTable schedule={result.schedule} view={amortizationView} onViewChange={setAmortizationView} />
      )}
    </div>
  );
}
