import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate the price of a bond?",
    a: "Discount each future coupon and the face value back to today using the yield per period, then add them up. Our bond calculator does this once you enter face value, coupon rate, payment frequency, yield and time to maturity.",
  },
  {
    q: "What is the bond price formula?",
    a: "Price = C/(1+r) + C/(1+r)² + … + (C + F)/(1+r)ⁿ, where C is the coupon per period, r is the yield per period, F is face value and n is the number of periods.",
  },
  {
    q: "What is yield to maturity (YTM)?",
    a: "It's the annual return you'd earn if you buy at today's price, hold to maturity and get every payment on time. It's the discount rate that makes the present value of those payments equal the price.",
  },
  {
    q: "What's the difference between coupon rate, current yield and YTM?",
    a: "Coupon rate is the fixed interest rate on face value. Current yield is the annual coupon divided by the current price. YTM includes coupons plus the gain or loss as the price moves to face value by maturity.",
  },
  {
    q: "What's the difference between clean price and dirty price?",
    a: "Clean price is the quoted price without accrued interest. Dirty price adds the accrued interest and is the amount the buyer actually pays at settlement.",
  },
  {
    q: "How is accrued interest calculated?",
    a: "Multiply the coupon payment by the days since the last coupon date and divide by the days in the coupon period. How days get counted depends on the day-count convention.",
  },
  {
    q: "Which day-count convention should I use?",
    a: "Use whatever the bond follows. U.S. Treasuries use actual/actual, many U.S. corporate, agency and municipal bonds use 30/360, and money market instruments often use actual/360.",
  },
  {
    q: "Why do bond prices fall when interest rates rise?",
    a: "New bonds start paying the higher rate, so older bonds with lower fixed coupons have to sell at lower prices to offer the same yield.",
  },
  {
    q: "Why is my bond trading at a discount or premium?",
    a: "If the coupon rate is lower than the market yield, it trades at a discount. If it's higher, it trades at a premium. When they match, it trades at par.",
  },
  {
    q: "Can I use this calculator for bonds bought between coupon dates?",
    a: "Yes. Enter the settlement details and it returns clean price, accrued interest and dirty price.",
  },
  {
    q: "Can I solve for something other than price?",
    a: "Yes. You can solve for yield, coupon, face value or time to maturity, as long as you fill in the other values.",
  },
  {
    q: "Does the calculator work for zero-coupon bonds?",
    a: "The math for a zero-coupon bond is just face value divided by (1 + yield) raised to the number of periods. If you need a quick check, you can run that by hand or test the calculator with a 0% coupon.",
  },
  {
    q: "Does it handle callable, putable or floating-rate bonds?",
    a: "No. It's for fixed-rate bonds held to maturity. Callable bonds need yield to call and floating-rate bonds need a different framework.",
  },
  {
    q: "Is the bond calculator free, and do I need to sign up?",
    a: "It's free, and you don't need an account to run a calculation.",
  },
];

// Structured data uses the supplied schema wording, which differs slightly from the visible FAQ text.
const FAQ_SCHEMA_ITEMS = [
  {
    q: "How do you calculate the price of a bond?",
    a: "Discount each future coupon and the face value back to today using the yield per period, then add them up. Our bond calculator does this once you enter face value, coupon rate, payment frequency, yield and time to maturity.",
  },
  {
    q: "What is the bond price formula?",
    a: "Price = C/(1+r) + C/(1+r)^2 + ... + (C + F)/(1+r)^n, where C is the coupon per period, r is the yield per period, F is face value and n is the number of periods.",
  },
  {
    q: "What is yield to maturity (YTM)?",
    a: "It is the annual return you would earn if you buy at today's price, hold to maturity and get every payment on time. It is the discount rate that makes the present value of those payments equal the price.",
  },
  {
    q: "What's the difference between coupon rate, current yield and YTM?",
    a: "Coupon rate is the fixed interest rate on face value. Current yield is the annual coupon divided by the current price. YTM includes coupons plus the gain or loss as the price moves to face value by maturity.",
  },
  {
    q: "What's the difference between clean price and dirty price?",
    a: "Clean price is the quoted price without accrued interest. Dirty price adds the accrued interest and is the amount the buyer actually pays at settlement.",
  },
  {
    q: "How is accrued interest calculated?",
    a: "Multiply the coupon payment by the days since the last coupon date and divide by the days in the coupon period. How days get counted depends on the day-count convention.",
  },
  {
    q: "Which day-count convention should I use?",
    a: "Use whatever the bond follows. U.S. Treasuries use actual/actual, many U.S. corporate, agency and municipal bonds use 30/360, and money market instruments often use actual/360.",
  },
  {
    q: "Why do bond prices fall when interest rates rise?",
    a: "New bonds start paying the higher rate, so older bonds with lower fixed coupons have to sell at lower prices to offer the same yield.",
  },
  {
    q: "Why is my bond trading at a discount or premium?",
    a: "If the coupon rate is lower than the market yield, it trades at a discount. If it is higher, it trades at a premium. When they match, it trades at par.",
  },
  {
    q: "Can I use this calculator for bonds bought between coupon dates?",
    a: "Yes. Enter the settlement details and it returns clean price, accrued interest and dirty price.",
  },
  {
    q: "Can I solve for something other than price?",
    a: "Yes. You can solve for yield, coupon, face value or time to maturity, as long as you fill in the other values.",
  },
  {
    q: "Does the calculator work for zero-coupon bonds?",
    a: "The math for a zero-coupon bond is face value divided by (1 + yield) raised to the number of periods. If you need a quick check, you can run that by hand or test the calculator with a 0% coupon.",
  },
  {
    q: "Does it handle callable, putable or floating-rate bonds?",
    a: "No. It is for fixed-rate bonds held to maturity. Callable bonds need yield to call and floating-rate bonds need a different framework.",
  },
  {
    q: "Is the bond calculator free, and do I need to sign up?",
    a: "It is free, and you do not need an account to run a calculation.",
  },
];

const YIELD_HEADERS = ["Market yield", "Bond price"];
const YIELD_ROWS = [
  ["5%", "$1,000.00"],
  ["6%", "$925.61"],
  ["7%", "$857.88"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = {
  fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15,
  color: "var(--text-primary)", letterSpacing: "-0.01em", marginBottom: 10, marginTop: 14,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const cardStyle = { padding: "20px 20px" };
const liStyle = { marginBottom: 8 };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10,
};

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: "nowrap" }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FaqRow({ item, open, onToggle }) {
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 10, padding: "13px 2px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 13.5, color: "var(--text-primary)" }}>
          {item.q}
        </span>
        <svg width="12" height="12" viewBox="0 0 10 10" fill="none" style={{
          flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s",
        }} aria-hidden="true">
          <path d="M1.5 3.5L5 7L8.5 3.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, margin: "0 0 14px" }}>
          {item.a}
        </p>
      )}
    </div>
  );
}

export default function BondCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_SCHEMA_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />

      <div className="card" style={cardStyle}>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is by <Link to="/" className="inline-home-link">tolz.org</Link>
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Bond Calculator Does</h2>
        <p style={pStyle}>There are really two jobs in here, and it helps to know which one you're doing.</p>
        <p style={pStyle}>
          The first is a <strong>standard bond calculation on a coupon date</strong>. This assumes the bond is issued
          today or changes hands right on a coupon payment date, so a full coupon period remains. Price, face value,
          yield, maturity and coupon are all tied together. Know four, and the fifth is fixed. That's why you get to
          choose the unknown instead of being locked into "enter yield, get price."
        </p>
        <p style={pStyle}>
          The second is <strong>pricing between coupon dates</strong>. In practice, most trades don't land on a coupon
          date. A bond that pays on January 15 and July 15 might trade on March 20, and now someone's earned two months of
          interest that hasn't been paid yet. This mode figures out that accrued interest and splits the price into
          clean, dirty and accrued so you can see exactly what changes hands.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both modes are built for fixed-rate coupon bonds, which is the bulk of what's out there. They don't try to
          account for things like credit quality or market supply and demand. More on that near the end.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Bond, Exactly?</h2>
        <p style={pStyle}>
          A bond is a loan you make to a company or a government. You hand over money, they promise to pay you interest
          on a schedule and give the original amount back on a set date. The bond itself is just the written terms of
          that deal, and because it can be bought and sold, its price moves around after it's issued.
        </p>
        <p style={pStyle}>
          Bonds are usually described as lower risk than stocks, and that's fair as a general statement, but the range is
          wide. A few of the common types:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Government bonds.</strong> U.S. Treasuries are the benchmark. They're backed by the federal
            government and generally viewed as the safest. Interest is taxed federally but exempt from state and local
            income tax.
          </li>
          <li style={liStyle}>
            <strong>Municipal bonds.</strong> Issued by states, cities and local agencies. Interest is often exempt from
            federal income tax, which is a big reason people buy them.
          </li>
          <li style={liStyle}>
            <strong>Corporate bonds.</strong> Issued by companies. Yields run higher than Treasuries because you're
            taking on the chance the company can't pay.
          </li>
          <li style={liStyle}>
            <strong>High-yield (junk) bonds.</strong> Issued by companies with weaker credit ratings. You get paid more,
            but defaults are more common.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Zero-coupon bonds.</strong> No interest payments at all. You buy at a deep discount and collect face
            value at maturity.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Parts of a Bond (and What to Type Into the Calculator)</h2>
        <p style={pStyle}>Every field in the tool maps to one of these pieces.</p>
        <p style={pStyle}>
          <strong>Face value (par value).</strong> What the issuer repays at maturity. It's also the base for coupon
          payments. $1,000 is the classic corporate figure; Treasuries are sold in much smaller increments.
        </p>
        <p style={pStyle}>
          <strong>Maturity date and time to maturity.</strong> The maturity date is when principal is due. Time to
          maturity is how long's left. Bonds run from under a year to 30 years or longer. When you enter "years to
          maturity" in the calculator, you're entering the time remaining, not the original term.
        </p>
        <p style={pStyle}>
          <strong>Coupon rate.</strong> The yearly interest rate the issuer pays, applied to face value. A 5% coupon on a
          $1,000 bond is $50 a year regardless of what the bond's trading for. Coupons can be fixed, floating or zero.
          This calculator is for fixed.
        </p>
        <p style={pStyle}>
          <strong>Coupon frequency.</strong> How often those payments arrive. Semiannual is standard for U.S. Treasuries
          and corporates, annual is common in Europe, and some bonds pay quarterly or monthly. A 5% bond paying
          semiannually sends $25 twice a year.
        </p>
        <p style={pStyle}>
          <strong>Yield.</strong> The return you'd get based on what you actually pay. This is where things get slippery,
          because "yield" can mean several different numbers. We'll sort those out in a minute.
        </p>
        <p style={pStyle}>
          <strong>Price.</strong> What the bond sells for in the market. In theory, it's the present value of every
          future payment, discounted at the yield investors demand. In practice, it's also pushed around by credit risk,
          supply and demand and the interest rate environment.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Other features matter for real-world valuation even though the basic math ignores them: the issuer, call and
          put options, credit rating, covenants and how easily the bond trades.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Bond Calculator</h2>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Choose what you're solving for.</strong> Price, yield, coupon, face value or time to maturity.
          </li>
          <li style={liStyle}>
            <strong>Enter the other values.</strong> Rates go in as annual percentages. Check whether a field wants 5 or
            0.05 for five percent.
          </li>
          <li style={liStyle}>
            <strong>Set the payment frequency</strong> to match the bond's actual schedule.
          </li>
          <li style={liStyle}>
            <strong>For a between-coupon-dates trade</strong>, enter the settlement date and the dates that define the
            coupon period, and choose the day-count convention that applies to your bond.
          </li>
          <li style={liStyle}>
            <strong>Read the results.</strong> You'll see the solved value, and for mid-period trades the clean price,
            accrued interest and dirty price.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick gut check before you trust any number: if the coupon rate is above the yield, the price should be above
          face value. If it's below, the price should be below face. If your result disagrees, something's mistyped.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate Bond Price</h2>
        <p style={pStyle}>
          The price of a bond is what all its future payments are worth today. Each coupon and the final face value gets
          discounted at the yield per period:
        </p>
        <div style={formulaStyle}>Price = C/(1+r) + C/(1+r)² + … + (C + F)/(1+r)ⁿ</div>
        <p style={pStyle}>
          C is the coupon per period, r is the yield per period, F is face value and n is the number of periods.
        </p>
        <p style={pStyle}>
          <strong>Worked example.</strong> A $1,000 bond, 5% coupon paid semiannually, 10 years to maturity, and you
          want a 6% yield.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Coupon per period: $1,000 × 5% ÷ 2 = $25</li>
          <li style={liStyle}>Periods: 10 × 2 = 20</li>
          <li style={liStyle}>Yield per period: 6% ÷ 2 = 3%</li>
        </ul>
        <p style={pStyle}>
          The 20 coupons are worth about $371.94 today. The $1,000 at the end is worth about $553.68 today. Add them and
          the price is about $925.61, or 92.56% of par. That's a discount, because the bond pays less than the market
          wants.
        </p>
        <p style={pStyle}>
          Doing this once with a spreadsheet is fine. Doing it across ten scenarios is a pain, and doing it backward
          (starting from a price and hunting for the yield) is worse. There's no clean formula for solving yield
          directly, so the calculation has to guess, check and refine until the price matches. That's the main reason a
          bond calculator's worth having.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>A zero-coupon version.</strong> With no coupons, the formula collapses to Price = F ÷ (1+r)ⁿ. A $1,000
          zero-coupon bond maturing in 5 years with a 4% annual yield is worth $1,000 ÷ 1.04⁵, about $821.93. If you ever
          see a bond priced at a big discount with no coupon, this is how it works.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Bond Yield, Explained Without the Confusion</h2>
        <p style={pStyle}>
          If you've ever compared two yield numbers and wondered why they don't match, it's usually because they aren't
          measuring the same thing.
        </p>
        <p style={pStyle}>
          <strong>Coupon rate</strong> is just the interest rate printed on the bond. It doesn't change.
        </p>
        <p style={pStyle}>
          <strong>Current yield</strong> is the annual coupon divided by the current price. It only looks at the income
          you'd get this year, not any gain or loss when the bond matures. In our example: $50 ÷ $925.61 ≈ 5.40%.
        </p>
        <p style={pStyle}>
          <strong>Yield to maturity (YTM)</strong> is the single rate that makes the present value of all remaining
          payments equal today's price. It counts the coupons and the pull from your purchase price up (or down) to face
          value. In our example the YTM is 6.00% (semiannual basis). It's higher than current yield because you're also
          picking up the $74.39 difference between $925.61 and $1,000.
        </p>
        <p style={pStyle}>
          <strong>Yield to call (YTC)</strong> matters for callable bonds, where the issuer can pay you back early. The
          math is the same as YTM, except you swap the call date and call price in for the maturity date and face value.
          This calculator doesn't handle calls, but you should know the number exists, especially when a bond has a high
          coupon and might get redeemed early.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One more thing that trips people up: compounding convention. U.S. bond yields are normally quoted as a nominal
          annual rate compounded semiannually. A 6.00% semiannual yield works out to an effective annual yield of about
          6.09%, since 1.03² − 1 ≈ 6.09%. Neither's wrong. If you're comparing against a savings rate or an annual-pay
          European bond, make sure you're comparing the same kind of number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Solving for Coupon, Face Value and Time to Maturity</h2>
        <p style={pStyle}>
          Price and yield get most of the attention, but the other three solve-for options are handy.
        </p>
        <p style={pStyle}>
          <strong>Coupon.</strong> The coupon that makes a bond sell right at par equals the yield. So if similar bonds
          are yielding 4.8%, a new issue needs roughly a 4.8% coupon to sell at face value. You can also solve for the
          coupon on an existing bond if you know its price and yield, which helps when you're trying to identify a bond
          from partial data.
        </p>
        <p style={pStyle}>
          <strong>Face value.</strong> Say you know the market value of a position, the yield and the coupon rate, and
          you want to know what par amount that represents. Solving for face value gets you there.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Time to maturity.</strong> Given a price, a coupon and a yield, how long has the market assumed the
          bond has left? It's a good way to check a quote or see how much a longer maturity would change the price.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Bond Prices Move</h2>

        <h3 style={{ ...h3Style, marginTop: 0 }}>Rates and prices go in opposite directions</h3>
        <p style={pStyle}>
          When market rates rise, older bonds with lower fixed coupons look worse than new ones, so their prices fall.
          When rates drop, older bonds with higher coupons look better and prices rise. Take the same 5% coupon, 10-year
          bond from earlier and price it at different yields:
        </p>
        <DataTable headers={YIELD_HEADERS} rows={YIELD_ROWS} />
        <p style={pStyle}>
          Notice it isn't symmetrical. A one-point drop in yield, from 6% to 5%, adds $74.39. A one-point rise, from 6%
          to 7%, only costs $67.73. That curve (convexity, if you want the technical word) is why falling rates help a
          bond holder a little more than rising rates hurt.
        </p>

        <h3 style={h3Style}>Longer maturity, bigger swings</h3>
        <p style={pStyle}>
          Price that same 5% coupon bond with 30 years left instead of 10 and run it at a 6% yield. You get about
          $861.62, which is 13.8% under par. The 10-year version was only 7.4% under par. Same coupon, same yield, but a
          longer stretch of payments being discounted at the higher rate means a bigger hit. Lower coupons make this even
          more pronounced, since more of the bond's value is stuck in the far-off principal payment.
        </p>

        <h3 style={h3Style}>Pull to par</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If nothing else changes, a bond's price drifts toward face value as maturity approaches. Premium bonds slide
          down toward par and discount bonds climb up. That's why you shouldn't treat a discount purely as a bargain. Part
          of it is just a return you'll earn by waiting, and it's already baked into the yield.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Clean Price, Dirty Price and Accrued Interest</h2>
        <p style={pStyle}>
          Here's why these exist. Bondholders earn interest every day, but the issuer only pays on coupon dates. If
          someone sold a bond the day before a payment, they'd lose nearly a full period of interest to the new owner. So
          the buyer pays the seller their share of that interest when the trade settles. That payment is the accrued
          interest.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Clean price:</strong> the quoted price, without accrued interest. It's what you see on screens and in
            quotes, and it lets you compare bonds without the noise of where each one sits in its coupon cycle.
          </li>
          <li style={liStyle}>
            <strong>Accrued interest:</strong> the interest earned since the last coupon date but not yet paid out.
          </li>
          <li style={liStyle}>
            <strong>Dirty price</strong> (also called invoice, full or gross price): clean price plus accrued interest.
            It's what the buyer actually pays.
          </li>
        </ul>
        <div style={formulaStyle}>
          Dirty price = Clean price + Accrued interest
          <br />
          Accrued interest = Coupon payment × (days since last coupon ÷ days in the coupon period)
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Example.</strong> A $1,000 bond pays a 6% coupon semiannually, so $30 each period. It's been 60 days
          since the last coupon in a 182-day period. Accrued interest is $30 × 60 ÷ 182 ≈ $9.89. If the clean price is
          98.50 ($985.00 per $1,000), the dirty price is about $994.89. The seller gets the $9.89 up front, and you get it
          back as part of the next full coupon.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Day-Count Conventions</h2>
        <p style={pStyle}>
          The accrued interest formula has two day counts in it: how many days have gone by, and how many days make up
          the period or year. Different markets count differently, and the calculator lets you pick the one that fits.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>30/360 (bond basis):</strong> every month counts as 30 days and a year as 360. It makes hand
            calculations easy and is common for U.S. corporate, agency and municipal bonds.
          </li>
          <li style={liStyle}>
            <strong>Actual/360:</strong> real days in the period, 360-day year. Common in money market instruments like
            commercial paper and short-term CDs.
          </li>
          <li style={liStyle}>
            <strong>Actual/365:</strong> real days in the period, fixed 365-day year. Used by some non-U.S. government
            bonds and some interest rate swaps. Leap years are usually ignored.
          </li>
          <li style={liStyle}>
            <strong>Actual/Actual:</strong> real days in the period and real days in the year. It's the most precise, and
            it's what U.S. Treasuries use.
          </li>
        </ul>
        <p style={pStyle}>
          Does it matter? Usually a little. Take a $1,000 bond with a 6% semiannual coupon, last paid January 15,
          settling March 20 in a non-leap year.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Actual/Actual: 64 days elapsed out of a 181-day period → $30 × 64 ÷ 181 ≈ $10.61</li>
          <li style={liStyle}>30/360: 65 days elapsed out of 180 → $30 × 65 ÷ 180 ≈ $10.83</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          That's about 22 cents per $1,000. On a small trade nobody cares, but on a million-dollar position it's a couple
          hundred dollars, and it's enough to cause a mismatch with your broker's confirmation. In edge cases, the
          different methods can disagree by as much as several days of interest. Always use the convention that your bond
          actually trades under.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When a Bond Calculator Comes in Handy</h2>
        <p style={pStyle}>
          <strong>Homework and exam prep.</strong> Finance courses and licensing exams love bond pricing problems. Use the
          calculator to check your work and see where a hand calculation went sideways.
        </p>
        <p style={pStyle}>
          <strong>Comparing two bonds.</strong> One has a higher coupon, another has a longer maturity, and the prices
          are different. Solve for yield on both and you've got an apples-to-apples number.
        </p>
        <p style={pStyle}>
          <strong>Buying in the secondary market.</strong> Before you place an order, find out what the dirty price is so
          there's no surprise on the confirmation.
        </p>
        <p style={pStyle}>
          <strong>Rate scenarios.</strong> If you own a bond and rates jump by a point, what happens? Re-price at the
          higher yield and see.
        </p>
        <p style={pStyle}>
          <strong>Figuring out a target price.</strong> You want a 5.5% yield on a particular bond. What's the most you
          should pay? Solve for price at that yield.
        </p>
        <p style={pStyle}>
          <strong>Corporate finance and modeling.</strong> Setting a coupon so a new issue prices at par, or checking the
          carrying value of debt on a balance sheet.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Sanity-checking a quote.</strong> If a quote seems off, solving for yield or maturity will show you
          what it implies.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mistakes That Throw Off Bond Calculations</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Mixing up annual and per-period rates.</strong> The formula needs the yield and coupon per period. A
            semiannual bond at 6% uses 3%, not 6%.
          </li>
          <li style={liStyle}>
            <strong>Wrong payment frequency.</strong> Entering annual for a semiannual bond changes the price noticeably.
          </li>
          <li style={liStyle}>
            <strong>Comparing clean and dirty prices.</strong> If one number includes accrued interest and the other
            doesn't, the comparison is meaningless.
          </li>
          <li style={liStyle}>
            <strong>Treating coupon rate as yield.</strong> They're only equal when the bond trades at par.
          </li>
          <li style={liStyle}>
            <strong>Ignoring day-count rules.</strong> Small, but it's the usual reason your number is a few cents off a
            broker's.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Forgetting about call features.</strong> A callable bond trading above par may be redeemed early,
            which makes YTM look better than the return you'll really get.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What the Math Doesn't Cover</h2>
        <p style={pStyle}>
          A calculator gives you the mathematically correct price for given inputs. Real prices also reflect:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Credit risk.</strong> If investors worry about an issuer's ability to pay, they demand a higher yield
            and the price drops. Ratings agencies exist to size up this risk.
          </li>
          <li style={liStyle}>
            <strong>Supply and demand.</strong> Heavy issuance or a rush into safe assets can move prices independent of
            anything in the formula.
          </li>
          <li style={liStyle}>
            <strong>Liquidity.</strong> A thinly traded bond may have a wide gap between what buyers bid and sellers ask.
          </li>
          <li style={liStyle}>
            <strong>Call and put features.</strong> These change the bond's real life and cash flows.
          </li>
          <li style={liStyle}>
            <strong>Taxes.</strong> Municipal interest, Treasury state tax exemption and capital gains on discount bonds
            all change your after-tax return.
          </li>
          <li style={liStyle}>
            <strong>Inflation.</strong> A fixed coupon loses purchasing power when inflation runs high. Reinvestment risk
            is the flip side: if rates fall, you may not be able to reinvest your coupons at the original yield.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Use the output as a baseline, then layer these things on top.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Calculator Accurate, Free and Private?</h2>
        <p style={pStyle}>
          It's free to use, and you don't need an account to run a calculation. The only things you enter are bond
          terms: rates, dates and dollar amounts. There's no personal or account information involved. The results use
          standard present-value bond math, the same approach you'd find in a finance textbook or on a financial
          calculator.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also worth being upfront about scope. This tool is built for standard fixed-rate bonds. It doesn't model
          call or put options, floating or inflation-linked coupons, taxes, fees or default risk. For an actual trade,
          your broker's confirmation is the final word, since rounding and day-count handling can differ a bit from
          market to market.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
