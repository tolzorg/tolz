import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Browsers silently increment/decrement a focused <input type="number">
// when the mouse wheel scrolls over it — including while the page itself
// is being scrolled to reach the next field. Blur it the instant a wheel
// event starts so the tick scrolls the page instead of changing the value.
document.addEventListener(
  "wheel",
  () => {
    const active = document.activeElement;
    if (active instanceof HTMLInputElement && active.type === "number") {
      active.blur();
    }
  },
  { passive: true }
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
