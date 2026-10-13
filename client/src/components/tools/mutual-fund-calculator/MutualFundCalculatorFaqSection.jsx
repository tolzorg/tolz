import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is a mutual fund calculator?",
    a: "It's a tool that estimates what a mutual fund investment could be worth after a set period, based on how much you invest, the return you expect, and how long you hold. A calculator that includes fees, like this one, also subtracts sales charges and yearly expenses to show your net result.",
  },
  {
    q: "How do I calculate mutual fund returns after fees?",
    a: "Take off any front-end load from your purchase, grow what's left at the fund's return minus its expense ratio, then subtract any deferred charge when you sell. Compare that final number to what you put in. The calculator does all of it for you.",
  },
  {
    q: "What's the formula for mutual fund returns?",
    a: "For a lump-sum investment with no fees, it's A = P × (1 + r)ⁿ, where P is the amount invested, r is the annual return as a decimal, and n is the number of years. Fees then reduce P, r, and A at different points.",
  },
  {
    q: "What is net IRR in a mutual fund?",
    a: "It's the annualized rate you actually earned after all sales charges and expenses. You can compare it directly to the fund's advertised return to see how much fees cost you each year.",
  },
  {
    q: "What's the difference between a front-end and a deferred sales charge?",
    a: "A front-end charge comes out when you buy, so less money gets invested. A deferred charge is collected when you sell, usually based on the lesser of your original investment or the sale value, and it often shrinks the longer you hold.",
  },
  {
    q: "What is a CDSC?",
    a: "It stands for contingent deferred sales charge. It's a back-end fee that steps down over time and often hits zero after several years.",
  },
  {
    q: "What is a good expense ratio for a mutual fund?",
    a: "Lower is better, all else equal. Index funds often charge well under 0.5%, and many charge 0.1% or less. Actively managed funds typically run about 0.5% to 1.5%. Compare funds within the same category.",
  },
  {
    q: "How much do fees affect my long-term returns?",
    a: "More than most people expect. On a $10,000 investment over 30 years at 7% before costs, a 1% expense ratio instead of 0.10% leaves you with roughly 22% less money at the end.",
  },
  {
    q: "Can a mutual fund have both a front-end and a back-end load?",
    a: "Not usually. Funds normally charge one or the other, and many charge neither. A fund might have other fees, though, such as redemption or exchange fees.",
  },
  {
    q: "Are Class A or Class C shares better?",
    a: "It depends on how long you plan to hold. Class A shares usually cost less over long periods because of their lower yearly fees. Class C shares tend to be cheaper for shorter periods because there's no big upfront load. Test both in the calculator with your own timeline.",
  },
  {
    q: "Does the calculator include taxes or inflation?",
    a: "No. It focuses on sales charges, deferred charges, and operating expenses. Taxes and inflation would lower your real, after-tax return further.",
  },
  {
    q: "Is this mutual fund calculator free, and do I need to sign up?",
    a: "It's free, and you don't need to register or log in.",
  },
  {
    q: "Can the calculator predict my actual returns?",
    a: "No. It applies the return you enter as a steady yearly rate, while actual returns vary. Use it for planning and try several scenarios.",
  },
];

// Structured data uses the supplied schema wording, which differs from the visible text in two answers.
const FAQ_SCHEMA_OVERRIDES = {
  "What's the formula for mutual fund returns?":
    "For a lump-sum investment with no fees, it's A = P × (1 + r)^n, where P is the amount invested, r is the annual return as a decimal, and n is the number of years. Fees then reduce the starting amount, the yearly growth, and the final balance at different points.",
  "What is a CDSC?":
    "CDSC stands for contingent deferred sales charge. It's a back-end fee that steps down over time and often reaches zero after several years.",
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  FAQ_SCHEMA_OVERRIDES[item.q] ? { ...item, a: FAQ_SCHEMA_OVERRIDES[item.q] } : item
);

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

export default function MutualFundCalculatorFaqSection() {
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
        <h2 style={h2Style}>What This Mutual Fund Calculator Does</h2>
        <p style={pStyle}>
          Most online mutual fund calculators do one thing: they take a starting amount, apply a growth rate, and show you
          a big number at the end. That's fine for rough planning, but it assumes the fund keeps every penny of its return,
          and no fund does.
        </p>
        <p style={pStyle}>
          This one works from the other direction. It starts with the return the fund earns before costs, then takes out
          the three things that eat into it:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>The sales charge you pay when you buy (front-end load)</li>
          <li style={liStyle}>The deferred sales charge you pay when you sell (back-end load)</li>
          <li style={liStyle}>The operating expenses the fund deducts every year (expense ratio)</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          What's left is your real result. The calculator gives you the ending balance, the net return over the whole
          holding period, and the net IRR, a single yearly rate you can compare directly against the fund's advertised
          performance, a no-load alternative, or even a savings account.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Mutual Fund Calculator, Step by Step</h2>
        <p style={pStyle}>
          You only need five or six numbers, and most of them come straight from the fund's fact sheet or prospectus.
        </p>
        <ol style={listGapStyle}>
          <li style={liStyle}>
            <strong>Initial investment.</strong> The lump sum you plan to put in. If you're choosing between funds, use
            the same amount for each so the comparison is fair.
          </li>
          <li style={liStyle}>
            <strong>Expected annual return.</strong> This is the return before fees. Be realistic here. Plugging in last
            year's 25% because that's what the fund just did is a fast way to fool yourself. Long-term U.S. stock funds
            have historically landed in the high single digits to low double digits, bond funds lower, and money market
            funds lower still. Run a conservative case and an optimistic one.
          </li>
          <li style={liStyle}>
            <strong>Holding period.</strong> How many years you expect to stay in. It affects compounding, and it decides
            how much of a deferred charge you'd owe, since many of those shrink over time.
          </li>
          <li style={liStyle}>
            <strong>Sales charge on purchase.</strong> The front-end load, as a percentage of what you invest. Enter 0 if
            the fund is no-load.
          </li>
          <li style={liStyle}>
            <strong>Deferred sales charge.</strong> The back-end load, as a percentage, charged when you sell. Enter 0 if
            there isn't one.
          </li>
          <li style={liStyle}>
            <strong>Annual fees and expenses.</strong> The expense ratio. It's listed as a percentage near the top of the
            fund's fee table.
          </li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then hit calculate. The best way to use the tool is to change one thing at a time. Bump the expense ratio by
          half a point and see what happens. Stretch the holding period from 3 years to 8 and watch a deferred charge
          disappear. Fees are the one part of investing you can see in advance, so they're worth poking at.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Math Works</h2>
        <h3 style={{ ...h3Style, marginTop: 0 }}>The basic lump-sum formula</h3>
        <p style={pStyle}>If a fund had no fees at all, a one-time investment would grow like this:</p>
        <div style={formulaStyle}>A = P × (1 + r)ⁿ</div>
        <ul style={listGapStyle}>
          <li style={liStyle}>A is the ending value</li>
          <li style={liStyle}>P is the amount you start with</li>
          <li style={liStyle}>r is the annual return, written as a decimal (7% = 0.07)</li>
          <li style={liStyle}>n is the number of years</li>
        </ul>
        <p style={pStyle}>
          Your gain is simply A minus P. Say you put $10,000 in at 7% for 10 years. That's 10,000 × 1.07¹⁰, which comes
          out to about $19,672. The extra $9,672 is your gain, and most of it comes from compounding, meaning your earlier
          gains started earning gains of their own.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You may see this called a lump sum mutual fund calculator or a lumpsum investment calculator. Same idea: one
          deposit, left alone to grow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Changes Once Fees Enter the Picture</h2>
        <p style={pStyle}>Real funds don't work that cleanly. The calculator adjusts the formula in three places:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>A front-end load</strong> shrinks P before anything starts growing. A 5% load turns $10,000 into
            $9,500 of actual investment.
          </li>
          <li style={liStyle}>
            <strong>The expense ratio</strong> reduces the yearly growth. A fund earning 7% with a 1% expense ratio
            effectively grows at about 6% a year for you.
          </li>
          <li style={liStyle}>
            <strong>A deferred charge</strong> comes off the final balance when you sell.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The net return is how much you gained relative to what you originally put in. The net IRR takes that result and
          converts it into a yearly rate, which is the number that makes funds with different time horizons easy to
          compare.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>A Quick Primer on How Mutual Funds Work</h2>
        <p style={pStyle}>You don't need this to use the calculator, but it helps explain why the fee inputs exist.</p>
        <p style={pStyle}>
          A mutual fund pools money from lots of investors and uses it to buy stocks, bonds, or other securities. Each
          investor owns shares of the fund, and each share represents a slice of everything the fund holds. A
          professional manager or team makes the buying and selling decisions based on the fund's stated objective,
          whether that's growth, income, preserving capital, or some mix.
        </p>

        <h3 style={h3Style}>NAV and how shares are priced</h3>
        <p style={pStyle}>
          Unlike a stock, a mutual fund doesn't trade all day at a moving price. Once per trading day, usually after the
          market closes, the fund adds up the value of everything it owns, subtracts its liabilities, and divides by the
          number of shares outstanding. That per-share number is the net asset value, or NAV.
        </p>
        <p style={pStyle}>
          When you buy or sell, your order gets filled at the next NAV calculated after you place it. So if you submit a
          sell order at 2 p.m., you won't know your exact price until the close. This is also where fees tie in.
          Operating expenses come out of the fund's assets before NAV is calculated, which is why you never see a bill for
          them. The cost just shows up as a slightly lower share price than you'd otherwise have.
        </p>

        <h3 style={h3Style}>Types of mutual funds</h3>
        <p style={pStyle}>Funds are usually grouped by what they hold:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Equity (stock) funds</strong> invest mainly in shares of public companies. They're sorted further by
            company size (large-cap, small-cap), style (growth or value), sector, or region. They have the most growth
            potential and the most ups and downs.
          </li>
          <li style={liStyle}>
            <strong>Bond (fixed income) funds</strong> hold debt issued by governments or corporations. They tend to be
            steadier than stock funds with less upside, though they're not risk-free. Interest rate changes and credit
            problems can hurt them.
          </li>
          <li style={liStyle}>
            <strong>Money market funds</strong> hold very short-term, high-quality debt. They're the low-risk end of the
            spectrum and are used more for parking cash than for growth.
          </li>
          <li style={liStyle}>
            <strong>Hybrid or balanced funds</strong> mix stocks and bonds in one fund. A classic split is roughly 60%
            stocks and 40% bonds.
          </li>
          <li style={liStyle}>
            <strong>Target date funds</strong> are built around a retirement year, like 2055. They start stock-heavy and
            slowly shift toward bonds as that year gets closer.
          </li>
          <li style={liStyle}>
            <strong>Index funds</strong> aim to match a market index such as the S&amp;P 500 or the Russell 2000, rather
            than beat it.
          </li>
        </ul>

        <h3 style={h3Style}>Index funds vs. actively managed funds</h3>
        <p style={pStyle}>
          An index fund just buys what's in its benchmark and holds it. There's very little trading, so costs stay low,
          and there's less taxable activity too. An actively managed fund has a manager picking investments and trying to
          beat a benchmark. That might pay off, but it's expensive. The manager's research and trading cost money, and
          those costs flow through to you.
        </p>
        <p style={pStyle}>
          The research on this is fairly consistent. S&amp;P's long-running SPIVA scorecards have repeatedly found that
          most actively managed U.S. stock funds trail their benchmark over 10 and 15-year periods, and fees are a big part
          of why. That's one reason the net IRR matters so much. If an active fund only matches the index before costs,
          you'll fall behind after them.
        </p>

        <h3 style={h3Style}>How you actually make money in a mutual fund</h3>
        <p style={pStyle}>There are three routes:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Dividends and interest.</strong> The fund collects income from its holdings and passes most of it to
            you, minus expenses.
          </li>
          <li style={liStyle}>
            <strong>Capital gains distributions.</strong> When the fund sells holdings at a profit, it typically pays
            those gains out to shareholders, usually near year-end.
          </li>
          <li style={liStyle}>
            <strong>A rising NAV.</strong> If the value of what the fund owns goes up, so does your share price. You
            collect that when you sell.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the first two, you can usually either take the cash or reinvest it in more shares. Reinvesting is how most
          people build up balances over time, and it's what the compounding assumption in the calculator is modeling.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mutual Fund Fees: What the Calculator Accounts For</h2>
        <p style={pStyle}>
          Running a fund costs money, and the fund passes those costs to you. Fees fall into two buckets: one-time
          transaction charges and ongoing yearly costs.
        </p>

        <h3 style={h3Style}>Front-end sales charge (load)</h3>
        <p style={pStyle}>
          This is taken out when you buy. It's a percentage of your purchase, and it reduces the amount that actually gets
          invested. Put $20,000 into a fund with a 5% front-end load, and $1,000 goes to the sales charge. Only $19,000
          buys shares.
        </p>
        <p style={pStyle}>
          That missing money doesn't just cost you $1,000. It would have compounded for the entire holding period.
          Front-end loads are most common on Class A shares and often run from about 3% to 5.75% for stock funds, lower
          for bond funds. FINRA rules cap them at 8.5%, though almost no one charges anywhere near that anymore.
        </p>
        <p style={pStyle}>
          Many fund families offer breakpoints, which are discounts on the load when you invest more. A fund might charge
          5.75% on purchases under $50,000 and 4.5% from $50,000 to $100,000. If you qualify for a breakpoint, enter that
          lower rate in the calculator.
        </p>

        <h3 style={h3Style}>Deferred sales charge (back-end load)</h3>
        <p style={pStyle}>
          This one is charged when you sell. It's normally a percentage of the lesser of your original investment or the
          value at the time you redeem. That detail matters, and it works like this.
        </p>
        <p style={pStyle}>Say you invest $15,000 in a fund with a 4% deferred charge:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            If the fund grows to $22,000 and you sell, the fee is 4% of $15,000, which is $600. You'd walk away with
            $21,400.
          </li>
          <li style={liStyle}>
            If the fund drops to $9,000 and you sell, the fee is 4% of $9,000, which is $360. You'd receive $8,640.
          </li>
        </ul>
        <p style={pStyle}>So the fee never gets calculated on gains, but it does hit you when you're already down.</p>

        <h3 style={h3Style}>Contingent deferred sales charge (CDSC)</h3>
        <p style={pStyle}>
          A lot of deferred charges step down over time to reward you for staying put. A typical schedule might start at
          6% and drop a point each year. Sell at the end of year four and you'd pay 2%. Hold five or six years and you'd
          pay nothing. Some funds use a shorter schedule, like 1% for the first year only, which is common on Class C
          shares.
        </p>
        <p style={pStyle}>
          Funds normally charge a front-end load or a deferred charge, not both. And plenty of funds charge neither.
          Those are called no-load funds.
        </p>

        <h3 style={h3Style}>Other one-time fees</h3>
        <p style={pStyle}>Check the prospectus for these too:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            Purchase fees and redemption fees, which go to the fund itself (not to a broker) and are often meant to
            discourage short-term trading
          </li>
          <li style={liStyle}>Exchange fees for moving money between funds in the same family</li>
          <li style={liStyle}>Account maintenance fees, sometimes charged on small balances</li>
        </ul>
        <p style={pStyle}>
          If your fund has any of these, you can fold them into the load or deferred inputs as a rough approximation, or
          just keep them in mind when reading the results.
        </p>

        <h3 style={h3Style}>Operating expenses and the expense ratio</h3>
        <p style={pStyle}>
          This is the ongoing cost, charged every year as a percentage of the fund's average assets. It covers the
          management fee, administrative costs, and usually a 12b-1 fee, which pays for marketing and shareholder
          services. FINRA caps 12b-1 fees at 1% per year, and many funds charge 0.25% or less.
        </p>
        <p style={pStyle}>Together these show up as the fund's expense ratio. How much you'll see depends mostly on the fund type:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Plain index funds can be incredibly cheap, sometimes 0.10% or even lower</li>
          <li style={liStyle}>Actively managed stock funds typically run roughly 0.5% to 1.5%</li>
          <li style={liStyle}>Anything above 2% is rare and usually hard to justify</li>
        </ul>
        <p style={pStyle}>
          The expense ratio is the fee that quietly does the most damage over a long timeline, because it's charged every
          single year on a balance that's getting bigger. And since returns in any given year are uncertain while fees are
          guaranteed, a high-cost fund has to beat a low-cost one just to break even with it.
        </p>

        <h3 style={h3Style}>Share classes: A, C, and others</h3>
        <p style={pStyle}>One fund can offer several share classes holding identical investments, with different fee setups:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Class A</strong> usually has a front-end load and a lower yearly 12b-1 fee. It tends to be cheaper for
            longer holding periods.
          </li>
          <li style={liStyle}>
            <strong>Class C</strong> usually has no front-end load, a small deferred charge (often 1% in the first year),
            and a higher yearly 12b-1 fee. It can cost less if you plan to sell in a few years, but the higher annual cost
            adds up. Many C shares convert to A shares after several years.
          </li>
          <li style={liStyle}>
            <strong>Class B</strong> shares had multi-year declining deferred charges. Most fund companies have stopped
            offering them to new investors.
          </li>
          <li style={liStyle}>
            <strong>No-load, institutional, and "I" or "Admiral"-type shares</strong> have no sales charge and are mostly
            available through direct platforms, retirement plans, or with higher minimums.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can model each class one at a time in the calculator, using your own timeline, to see which one costs the
          least.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Net Return and Net IRR Explained</h2>
        <p style={pStyle}>
          <strong>Net return</strong> is how much your investment grew over the whole period, after fees, compared to what
          you put in. Start with $10,000, end with $17,000, and your net return is 70%. It's simple and easy to picture.
        </p>
        <p style={pStyle}>
          The problem is that 70% over 5 years and 70% over 15 years are very different results, and the net return number
          alone doesn't show that.
        </p>
        <p style={pStyle}>
          That's where <strong>net IRR</strong> comes in. The internal rate of return is the single yearly rate that
          would turn what you put in into what you ended up with, taking timing into account. It's already an annual
          number, and it's calculated after every fee. So you can put it right next to the fund's advertised return, a
          bond yield, or a savings rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's how to read it. If a fund advertises 7% and your net IRR comes out to 5.5%, that 1.5-point difference is
          the real yearly cost of owning that fund under your assumptions. If you're comparing two funds and one has a
          higher advertised return but a lower net IRR, the net IRR is telling you something the brochure isn't.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Examples</h2>
        <p style={pStyle}>All of these are simplified. Run the same numbers in the live tool to see how it handles them.</p>

        <h3 style={h3Style}>Example 1: Load plus expense ratio</h3>
        <p style={pStyle}>
          You invest $10,000 for 10 years in a fund earning 7% before costs, with a 5% front-end load and a 1% expense
          ratio.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>No fees at all: $10,000 grows to about $19,670</li>
          <li style={liStyle}>After the 5% load, $9,500 is invested</li>
          <li style={liStyle}>With the 1% expense ratio, it grows at about 6% a year, so $9,500 becomes about $17,010</li>
          <li style={liStyle}>Fees cost you roughly $2,660, or about 14% of the fee-free result</li>
          <li style={liStyle}>Net IRR comes out to about 5.5% a year instead of 7%</li>
        </ul>
        <p style={pStyle}>
          Now run the same fund as a no-load share class with the same 1% expense ratio. You'd end up at about $17,910,
          roughly $900 more, just because the front-end load is gone.
        </p>

        <h3 style={h3Style}>Example 2: How much does the expense ratio matter alone?</h3>
        <p style={pStyle}>
          Let's remove loads entirely and just compare expense ratios. You invest $10,000 for 30 years in two no-load
          funds that both earn 7% before expenses.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Fund X charges 0.10%. It effectively grows at 6.9%, ending around $74,000</li>
          <li style={liStyle}>Fund Y charges 1.00%. It grows at 6%, ending around $57,400</li>
        </ul>
        <p style={pStyle}>
          That's a gap of about $16,600, or roughly 22%, and the only difference between the two funds is the fee. Neither
          fund did anything smarter than the other. One just cost less.
        </p>

        <h3 style={h3Style}>Example 3: Holding period and a deferred charge</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You invest $15,000 in a Class C-style fund with a 1% deferred charge that disappears after year one. If you sell
          at month 10 with a balance of $16,500, you owe 1% of the lesser amount, so $150. If you wait until month 13, you
          owe nothing. Two months of patience saved $150, and the calculator makes that kind of timing easy to check.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What a Front-End Load Really Costs Per Year</h2>
        <p style={pStyle}>
          Here's a useful way to think about a load. Because it's a one-time hit, you can spread it across your holding
          period to see what it's costing you annually.
        </p>
        <p style={pStyle}>
          A 5% front-end load means you start with 95 cents on the dollar. To get back to even, your money has to grow by
          about 5.3%. Spread that over the years, and the load works out to roughly:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>5.3% per year if you hold for 1 year</li>
          <li style={liStyle}>about 1% per year if you hold for 5 years</li>
          <li style={liStyle}>about 0.5% per year if you hold for 10 years</li>
          <li style={liStyle}>about 0.25% per year if you hold for 20 years</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So a load that looks expensive on a short timeline can look pretty reasonable over decades, especially if the
          fund has a low expense ratio. That's exactly why Class A shares are often the better pick for long-term
          investors, and why Class C or no-load shares are usually the better pick for shorter ones. Plug your own timeline
          into the calculator to see where the crossover happens.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Use a Mutual Fund Calculator</h2>
        <p style={pStyle}>
          <strong>Comparing share classes of the same fund.</strong> Same holdings, different fee structures. The
          calculator tells you which one costs less for the number of years you plan to hold.
        </p>
        <p style={pStyle}>
          <strong>Checking a recommendation.</strong> If an advisor or a bank suggests a fund, you can enter its loads and
          expense ratio and see the cost over your timeline before you sign anything. That turns "the fees are pretty
          reasonable" into an actual number.
        </p>
        <p style={pStyle}>
          <strong>Picking from your 401(k) lineup.</strong> Workplace plans usually give you a short menu with different
          expense ratios. Modeling them over 25 or 30 years makes the long-term cost of a pricey option very real.
        </p>
        <p style={pStyle}>
          <strong>Deciding when to sell.</strong> If your fund has a deferred charge that drops over time, you can test
          selling now against selling in six months or a year.
        </p>
        <p style={pStyle}>
          <strong>Evaluating a fund against a different kind of investment.</strong> Since net IRR is a yearly rate, you
          can compare a loaded fund against a CD, a bond, or a savings account on equal terms.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Learning how fees work.</strong> If you're new to investing, nothing teaches fee drag faster than
          changing one number and watching the ending balance move.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mutual Funds: Pros and Cons</h2>
        <p style={pStyle}>Mutual funds stay popular for good reasons, but they come with tradeoffs.</p>

        <h3 style={h3Style}>What they do well</h3>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Diversification.</strong> One purchase can give you exposure to hundreds of securities, so one
            company's bad year doesn't sink you.
          </li>
          <li style={liStyle}>
            <strong>Low minimums.</strong> Many funds let you start with a small amount and add to it over time.
          </li>
          <li style={liStyle}>
            <strong>Professional management.</strong> Someone else handles the research, trading, and rebalancing.
          </li>
          <li style={liStyle}>
            <strong>Liquidity.</strong> You can sell shares on any business day at the next NAV, minus any redemption
            fees.
          </li>
          <li style={liStyle}>
            <strong>Simple pricing.</strong> The NAV is calculated daily, so you always know what your holding is worth.
          </li>
        </ul>

        <h3 style={h3Style}>What to watch out for</h3>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>You can lose money.</strong> Mutual funds aren't insured against market losses, and share prices go up
            and down.
          </li>
          <li style={liStyle}>
            <strong>Costs.</strong> Sales charges and yearly expenses reduce what you keep, and high-fee funds have to work
            harder just to match cheaper ones.
          </li>
          <li style={liStyle}>
            <strong>Taxes.</strong> In a regular taxable account, dividends and capital gains distributions are taxable in
            the year you receive them, even if you reinvest them.
          </li>
          <li style={liStyle}>
            <strong>Manager risk.</strong> In an actively managed fund, your results depend a lot on one person's or one
            team's decisions.
          </li>
          <li style={{ ...liStyle, marginBottom: 0 }}>
            <strong>Little control.</strong> You can't pick what the fund buys or when it sells.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What to Check in a Fund Before You Buy</h2>
        <p style={pStyle}>
          The calculator handles costs. These other items are worth a look in the prospectus or fact sheet:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Investment objective and risk level.</strong> Make sure the fund's goals match yours, and that you can
            stomach the kind of drops it's had in the past.
          </li>
          <li style={liStyle}>
            <strong>Past performance.</strong> It doesn't predict anything, but it does show how the fund behaved in good
            and bad markets. Look at 5- and 10-year numbers and a bad year like 2008 or 2022, not just the latest one.
          </li>
          <li style={liStyle}>
            <strong>Total return.</strong> This includes reinvested dividends and price changes. Check the time period
            being used, because a 1-year number can look very different from a 10-year one.
          </li>
          <li style={liStyle}>
            <strong>Turnover ratio.</strong> This roughly shows how much of the portfolio gets replaced in a year. A fund
            that holds 100 stocks and swaps out 25 of them is around 25%. Higher turnover means more trading costs, which
            don't always show up in the expense ratio, and more taxable gains.
          </li>
          <li style={liStyle}>
            <strong>Fee table.</strong> Look for the loads, the expense ratio, and any waivers. A temporary waiver can
            make a fund look cheaper than it'll be later.
          </li>
          <li style={liStyle}>
            <strong>Manager tenure.</strong> A fund with a great record but a brand-new manager may not behave like it did
            before.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For an independent cross-check, FINRA also offers a free Fund Analyzer that lets you compare the cost of
          different funds side by side.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Taxes, and What the Calculator Doesn't Cover</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Taxes can change the picture, and the calculator doesn't model them. In a taxable brokerage account, you'll
          generally owe tax on dividends and on capital gains distributions each year, whether or not you reinvest them.
          When you sell shares at a profit, that gain is taxable too. Funds with high turnover tend to produce more taxable
          distributions, while index funds usually produce fewer. In a 401(k) or a traditional IRA, those taxes are
          deferred, and in a Roth account, qualified withdrawals are tax-free. So the same fund can have very different
          after-tax results depending on where you hold it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Accurate Is the Calculator?</h2>
        <p style={pStyle}>The math is exact for the numbers you enter. The accuracy of the result depends on two things.</p>
        <p style={pStyle}>
          First, how accurate your fee inputs are. Use the prospectus, not a summary from a third-party site, because
          loads and expense ratios change. If a fund has a temporary fee waiver, use the gross expense ratio for a longer
          holding period, since the waiver might expire.
        </p>
        <p style={pStyle}>
          Second, the return assumption. The calculator applies one steady yearly rate, but real returns bounce around. A
          fund that averages 7% might return 20% one year and lose 10% the next. The order of those returns matters,
          especially if you're withdrawing money. So run a low, middle, and high case and look at the range instead of
          fixating on one result.
        </p>
        <p style={pStyle}>
          Also keep in mind that the tool is built for lump-sum investing. If you're adding money regularly, such as a
          monthly contribution, your results will differ from a one-time deposit.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Treat the output as a planning estimate. It isn't a forecast, and it isn't personal financial advice.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Mutual Fund Calculator Free and Private?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's free to use, with no hidden charges, and you don't need an account or signup to run it. The only things you
          enter are numbers like dollar amounts, percentages, and years. You won't be asked for your name, brokerage, or
          account details, so there's nothing personal tied to your results.
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
