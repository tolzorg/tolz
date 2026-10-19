import { RequiredContext, FieldNameContext } from "./requiredFields";

/** Wraps a calculator so its inputs can show the flagged "Please enter a value" state. */
export function RequiredProvider({ flagged, children }) {
  return <RequiredContext.Provider value={flagged}>{children}</RequiredContext.Provider>;
}

/** Names the field inside it (adds no element, so layout is unchanged). `flagged` may be passed
 * directly instead of using a RequiredProvider around the calculator. */
export function Req({ name, flagged, children }) {
  return <FieldNameContext.Provider value={{ name, flagged }}>{children}</FieldNameContext.Provider>;
}
