const { chromium } = require("C:/Users/HP/AppData/Local/npm-cache/_npx/361ceb562f3b3235/node_modules/playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1600 } });
  const errors = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
  page.on("pageerror", (err) => errors.push("pageerror: " + err.message));

  await page.goto("http://localhost:5175/calculators/construction/glass-weight", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Glass type and shape", { timeout: 15000 });
  await page.screenshot({ path: "glass-weight-1-initial.png", fullPage: true });

  // Fill dimensions
  await page.fill('input[placeholder="e.g. 40"] >> nth=0', "40");
  await page.fill('input[placeholder="e.g. 40"] >> nth=1', "40");
  await page.fill('input[placeholder="e.g. 12"]', "1.2");
  await page.screenshot({ path: "glass-weight-2-filled.png", fullPage: true });

  const totalWeightText = await page.locator("text=Total weight").first().evaluate(el => el.closest('div').parentElement.textContent);
  console.log("RESULT_CONTEXT:", totalWeightText);

  // Test shape switch to Circular
  await page.selectOption('select >> nth=2', { label: "Circular" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "glass-weight-3-circular.png", fullPage: true });

  // Test glass type dropdown open (Custom)
  await page.selectOption('select >> nth=0', { label: "Custom glass density" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: "glass-weight-4-custom-glass.png", fullPage: true });

  console.log("CONSOLE_ERRORS:", JSON.stringify(errors));
  await browser.close();
})();
