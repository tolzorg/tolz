import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How is the inflation rate calculated?",
    a: "It's based on the change in the Consumer Price Index between two points in time. Subtract the older CPI value from the newer one, divide by the older value, and that gives you the percentage change, which is the inflation rate for that period.",
  },
  {
    q: "What's a normal inflation rate?",
    a: "Most developed economies, including the U.S., target somewhere around 2% annual inflation as a healthy long-term average, though actual yearly rates can run higher or lower depending on economic conditions.",
  },
  {
    q: "What's the inflation rate today?",
    a: "As of mid-2026, U.S. inflation has been sitting in the mid-3% range on an annual basis, according to the most recent Bureau of Labor Statistics data. It's updated monthly, so it's worth checking the latest release for the most current figure.",
  },
  {
    q: "Does this calculator work for British pounds, euros, or Indian rupees?",
    a: "This tool runs on U.S. CPI data and U.S. dollar amounts. Other countries track inflation using their own price indexes, the UK uses its own CPI/RPI data, the eurozone uses the Harmonized Index of Consumer Prices, and India and Australia each have their own national statistics offices tracking local inflation. The underlying math is the same, but you'd need a calculator pulling from that country's specific data for an accurate pound, euro, or rupee comparison.",
  },
  {
    q: "Can I use this to check inflation from the 1800s?",
    a: "Not directly, official U.S. CPI data only goes back to around 1913. Anything earlier relies on historical price estimates rather than an official government index, so this calculator, like most CPI-based tools, works within the range where real CPI data exists.",
  },
  {
    q: "Can I project inflation into the future?",
    a: "Yes, switch to the flat-rate mode, enter an assumed annual inflation rate, and the calculator will compound that rate forward over however many years you choose. This is useful for retirement planning or general forecasting where you're working off an assumption rather than historical fact.",
  },
  {
    q: "Is there a difference between inflation and hyperinflation?",
    a: "Yes, a big one. Regular inflation is a gradual, usually manageable rise in prices, often in the low single digits annually. Hyperinflation is an extreme, rapid collapse in currency value, sometimes with prices doubling in a matter of days, and it usually points to a much deeper economic or political crisis.",
  },
  {
    q: "Do I need an account to use this tool?",
    a: "No. It's completely free, with no signup or login required. Just enter your numbers and get your result.",
  },
  {
    q: "Why does inflation matter for salary comparisons?",
    a: "A raise that sounds big on paper can actually mean a pay cut in real terms if inflation outpaced the increase. Comparing an old and new salary using actual inflation data shows whether your purchasing power genuinely went up, stayed flat, or fell.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "How is the inflation rate calculated?",
    a: "It's based on the change in the Consumer Price Index between two points in time. Subtract the older CPI value from the newer one, divide by the older value, and that gives you the percentage change, which is the inflation rate for that period.",
  },
  {
    q: "What's a normal inflation rate?",
    a: "Most developed economies, including the U.S., target around 2% annual inflation as a healthy long-term average, though actual yearly rates can run higher or lower depending on economic conditions.",
  },
  {
    q: "What's the inflation rate today?",
    a: "As of mid-2026, U.S. inflation has been running in the mid-3% range on an annual basis, according to the most recent Bureau of Labor Statistics data, which updates monthly.",
  },
  {
    q: "Does this calculator work for British pounds, euros, or Indian rupees?",
    a: "This tool runs on U.S. CPI data and U.S. dollar amounts. Other countries track inflation with their own indexes, such as the UK's CPI/RPI or the eurozone's Harmonized Index of Consumer Prices, so an accurate pounds, euro, or rupee comparison requires a calculator built on that country's own data.",
  },
  {
    q: "Can I use this to check inflation from the 1800s?",
    a: "Not directly. Official U.S. CPI data only goes back to around 1913, so this calculator, like most CPI-based tools, works within the range where real CPI data exists.",
  },
  {
    q: "Can I project inflation into the future?",
    a: "Yes, using the flat-rate mode. Enter an assumed annual inflation rate and the calculator compounds it forward over your chosen number of years.",
  },
  {
    q: "Is there a difference between inflation and hyperinflation?",
    a: "Yes. Regular inflation is a gradual rise in prices, often in the low single digits annually. Hyperinflation is an extreme, rapid collapse in currency value that usually signals a deeper economic or political crisis.",
  },
  {
    q: "Do I need an account to use this tool?",
    a: "No. The calculator is completely free with no signup or login required.",
  },
  {
    q: "Why does inflation matter for salary comparisons?",
    a: "A raise that looks large on paper can amount to a real pay cut if inflation outpaced it. Comparing an old and new salary using actual inflation data shows whether purchasing power genuinely increased, stayed flat, or fell.",
  },
];


const DECADE_ROWS = [
  ["1970s", "Persistent high inflation, peaking near 12-13% by the end of the decade due to oil shocks and loose monetary policy."],
  ["Early 1980s", "Inflation hit double digits (over 13% in 1980) before the Fed under Paul Volcker aggressively raised interest rates to crush it."],
  ["Late 1980s–1990s", "Inflation settled into a more moderate 2-4% range for most of this stretch."],
  ["2000s", "Generally mild, mostly in the 2-3% range, aside from a spike above 5% in 2008 before the financial crisis hit and inflation briefly went negative in 2009."],
  ["2010s", "Unusually low and stable, often under 2%, with a few dips near zero."],
  ["2020-2021", "Inflation stayed low through most of 2020, then began climbing sharply in the back half of 2021."],
  ["2022", "Peaked around 8-9%, the highest annual rate in roughly four decades — driven by pandemic supply chain issues, stimulus spending, and energy prices."],
  ["2023-2024", "Cooled off substantially, dropping from the 6% range down toward 3% by late 2024."],
  ["2025-2026", "Inflation has been hovering in the mid-2% to mid-3% range, with month-to-month fluctuations tied to tariffs, energy prices, and shelter costs."],
];

const YEAR_ROWS = [
  ["2026*", "3.36% (through Jul)", "1988", "4.08%", "1950", "1.09%"],
  ["2025", "2.63%", "1987", "3.66%", "1949", "-0.95%"],
  ["2024", "2.95%", "1986", "1.91%", "1948", "7.74%"],
  ["2023", "4.12%", "1985", "3.55%", "1947", "14.65%"],
  ["2022", "8.00%", "1984", "4.30%", "1946", "8.43%"],
  ["2021", "4.70%", "1983", "3.22%", "1945", "2.27%"],
  ["2020", "1.24%", "1982", "6.16%", "1944", "1.64%"],
  ["2019", "1.81%", "1981", "10.35%", "1943", "6.00%"],
  ["2018", "2.44%", "1980", "13.58%", "1942", "10.97%"],
  ["2017", "2.13%", "1979", "11.22%", "1941", "5.11%"],
  ["2016", "1.26%", "1978", "7.62%", "1940", "0.73%"],
  ["2015", "0.12%", "1977", "6.50%", "1939", "-1.30%"],
  ["2014", "1.62%", "1976", "5.75%", "1938", "-2.01%"],
  ["2013", "1.47%", "1975", "9.20%", "1937", "3.73%"],
  ["2012", "2.07%", "1974", "11.03%", "1936", "1.04%"],
  ["2011", "3.16%", "1973", "6.16%", "1935", "2.56%"],
  ["2010", "1.64%", "1972", "3.27%", "1934", "3.51%"],
  ["2009", "-0.34%", "1971", "4.30%", "1933", "-5.09%"],
  ["2008", "3.85%", "1970", "5.84%", "1932", "-10.30%"],
  ["2007", "2.85%", "1969", "5.46%", "1931", "-8.94%"],
  ["2006", "3.24%", "1968", "4.27%", "1930", "-2.66%"],
  ["2005", "3.39%", "1967", "2.78%", "1929", "0.00%"],
  ["2004", "2.68%", "1966", "3.01%", "1928", "-1.15%"],
  ["2003", "2.27%", "1965", "1.59%", "1927", "-1.92%"],
  ["2002", "1.59%", "1964", "1.28%", "1926", "0.94%"],
  ["2001", "2.83%", "1963", "1.24%", "1925", "2.44%"],
  ["2000", "3.38%", "1962", "1.20%", "1924", "0.45%"],
  ["1999", "2.19%", "1961", "1.07%", "1923", "1.80%"],
  ["1998", "1.55%", "1960", "1.46%", "1922", "-6.10%"],
  ["1997", "2.34%", "1959", "1.01%", "1921", "-10.85%"],
  ["1996", "2.93%", "1958", "2.73%", "1920", "15.90%"],
  ["1995", "2.81%", "1957", "3.34%", "1919", "15.31%"],
  ["1994", "2.61%", "1956", "1.52%", "1918", "17.26%"],
  ["1993", "2.96%", "1955", "-0.28%", "1917", "17.80%"],
  ["1992", "3.03%", "1954", "0.32%", "1916", "7.64%"],
  ["1991", "4.25%", "1953", "0.82%", "1915", "0.92%"],
  ["1990", "5.39%", "1952", "2.29%", "1914", "1.35%"],
  ["1989", "4.83%", "1951", "7.88%", "", ""],
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
const cardStyle = { padding: "20px 20px" };

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={`${h}-${i}`} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: "nowrap" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "6px 10px", borderBottom: "1px solid var(--border)", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
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

export default function InflationCalculatorFaqSection() {
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
          A dollar just doesn't stretch the way it used to, and if you've ever done the math on what your
          parents paid for a house or a tank of gas back in the day, you already know that. This inflation
          calculator, built by <Link to="/" className="inline-home-link">Tolz</Link>, lets you plug in an
          amount and two years and see exactly what that money was worth then versus now, using actual U.S.
          Consumer Price Index data instead of some rough guess. You can also run it the other way and
          project a flat inflation rate forward or backward if you're working with a hypothetical number
          instead of real history. Either way, you get a straight answer without having to dig through
          spreadsheets or government data tables yourself.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Calculator Actually Does (US Dollar, By Year)</h2>
        <p style={pStyle}>
          This is an inflation calculator by year, you pick a starting year, an ending year, and an amount,
          and it tells you what that amount is worth once you account for inflation between those two
          points. It runs on U.S. CPI data, so if you're searching for an inflation calculator usd or an
          inflation calculator us specifically, this is built for exactly that. Say you want to know what
          $500 in 1985 would take to match today, type it in, pick the years, and you'll get a real number
          pulled from actual historical price data, not a flat estimate applied across the board.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          There's also a flat-rate mode built in, which is different from the CPI comparison. Instead of
          pulling historical numbers, you set your own annual inflation rate and let the calculator compound
          it forward or backward. That's the inflation calculator future option, useful when you're not
          trying to recreate history but instead want to model what a rate like 3% a year does to a dollar
          amount over the next 10, 20, or 30 years.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What About Pounds, Euros, Rupees, and Other Currencies?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A lot of people search for an inflation calculator uk, inflation calculator pounds, inflation
          calculator euro, or inflation calculator india, and it's worth clearing up how that works. Every
          country tracks its own version of the Consumer Price Index using its own basket of goods, so
          British inflation on pounds runs off the UK's CPI (or the older RPI measure), eurozone countries
          use the Harmonized Index of Consumer Prices, India uses data published by the Reserve Bank of
          India and its statistics ministry, and Australia relies on the Australian Bureau of Statistics.
          This particular tool is built around U.S. CPI data and U.S. dollar amounts, so if you're
          converting British pounds or working an inflation calculator by year British pounds problem
          specifically, you'd want a calculator that pulls from the UK's own price index rather than the
          American one. The math behind all of these works the same way, comparing a price index between
          two years, the data source is just different depending on which currency and country you're
          dealing with.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why People Actually Use an Inflation Calculator</h2>
        <p style={pStyle}>
          There's no single reason people search for this, it comes up in a handful of pretty different
          situations, and most of them are practical, not just curiosity.
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Figuring out if a salary kept up with the cost of living.</strong> This is probably one
            of the most common uses, an inflation calculator by year salary search usually means someone's
            comparing an old paycheck to a current one, or checking whether a raise actually grew their real
            income or just matched inflation. If your salary went from $45,000 to $60,000 over ten years but
            inflation ate up most of that gain, you'll see it here.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Planning for retirement or long-term savings.</strong> Nobody wants to save for 30 years
            and then realize their money doesn't buy what they thought it would. Running the numbers on past
            inflation gives you a realistic sense of how much prices can move over a few decades, which
            makes future planning a lot less guesswork.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Business budgeting and reporting.</strong> Comparing costs, revenue, or contract values
            across different years only means something if you adjust for inflation first. Otherwise you're
            comparing numbers that aren't really on the same scale.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Real estate comparisons.</strong> Figuring out if a property actually gained value or
            just kept pace with inflation is a common question, especially when people are comparing
            purchase prices from decades ago.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>School papers and research.</strong> If you're writing about a historical event and want
            to express an old price or wage in modern terms so people actually understand the scale, this
            does that in one step.
          </li>
          <li>
            <strong>Plain old curiosity.</strong> Honestly, a huge chunk of searches for this kind of tool
            are just people wondering what a movie ticket, a car, or their allowance from 20 or 30 years ago
            would cost today. That's a completely valid reason to use it.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use It</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 6 }}>Type in the dollar amount you're starting with.</li>
          <li style={{ marginBottom: 6 }}>Pick the starting year.</li>
          <li style={{ marginBottom: 6 }}>
            Pick the ending year, this can be the current year or any past year within the available data
            range.
          </li>
          <li style={{ marginBottom: 6 }}>
            Choose whether you want the CPI-based historical comparison or the flat-rate projection mode.
          </li>
          <li style={{ marginBottom: 6 }}>
            If you go with flat-rate, enter your own percentage, historically, U.S. inflation has averaged
            somewhere around 3% a year, so that's a reasonable starting point if you don't have a specific
            rate in mind, but you can set it to whatever you want to test.
          </li>
          <li style={{ marginBottom: 6 }}>
            Hit calculate and you'll get the adjusted amount along with the percentage change between the
            two years.
          </li>
          <li>You can run it as many times as you want, there's no cap on calculations.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Inflation Actually Means</h2>
        <p style={pStyle}>
          Inflation is just a general rise in the prices of goods and services over time, which means each
          unit of your money buys a little less than it used to. It's usually measured as a percentage
          change over a 12-month period, and it's not something that just happens randomly, it's tied to how
          much money is circulating in an economy relative to how much stuff there actually is to buy. When a
          central bank or government increases the money supply faster than the economy grows, each dollar
          (or pound, or euro) ends up worth a bit less. Most developed countries, including the U.S., aim to
          keep inflation somewhere around 2-3% a year through interest rate policy and other tools, since a
          small, steady amount of inflation tends to keep an economy moving rather than stalling out.
        </p>

        <h3 style={h3Style}>When Inflation Gets Out of Control: Hyperinflation</h3>
        <p style={pStyle}>
          Hyperinflation is what happens when that process goes seriously wrong, prices shoot up so fast
          that money essentially stops functioning as money. It usually happens when a government floods the
          economy with cash without any matching increase in actual goods and production. Germany in the
          1920s is the textbook example: the government printed huge amounts of currency to cover war debts
          and reparations after World War I, and at the worst point, prices were doubling every few days.
          People were reportedly burning stacks of currency for heat because it was worth less than the
          firewood it could buy. Brazil went through a long stretch of hyperinflation from the early 1980s
          into the mid-1990s, and Ukraine dealt with the same thing in the early '90s after the Soviet
          collapse, in both cases, people scrambled to hold onto foreign currency or physical assets like
          gold instead of their own cash, because local money was losing value by the day.
        </p>

        <h3 style={h3Style}>The Other Direction: Deflation</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Deflation is the reverse, prices falling instead of rising, and it sounds like it should be good
          news, but economists generally treat it as more dangerous than moderate inflation. If people
          expect prices to keep dropping, they hold off on spending, waiting for a better deal. Less spending
          means less business revenue, which leads to layoffs and further price cuts, which leads to even
          less spending. That's the deflationary spiral that made the Great Depression so brutal to climb out
          of, it feeds on itself in a way that's genuinely hard to reverse once it gets going.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Inflation Happens in the First Place</h2>
        <p style={pStyle}>
          Economists generally point to a few different drivers, and real-world inflation is usually some
          mix of all of them:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Cost-push inflation</strong> happens when the cost of producing goods goes up, say, oil
            prices spike due to a geopolitical event, and businesses pass that added cost on to consumers
            through higher prices.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Demand-pull inflation</strong> happens when demand for goods and services outpaces what
            the economy can actually produce. When there's more money chasing fewer available goods, prices
            get bid up.
          </li>
          <li>
            <strong>Built-in inflation</strong> is basically inflation feeding on expectations, if workers
            expect prices to keep rising, they push for higher wages, and businesses raise prices to cover
            those higher wages, which then confirms the original expectation. It's a bit of a self-fulfilling
            loop tied to both of the causes above.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          There's also a school of thought, associated with economist Milton Friedman and the Monetarists,
          that puts most of the blame squarely on money supply rather than supply-and-demand dynamics in
          specific markets. Their basic argument, sometimes expressed as the equation MV = PY (money supply
          times how often it changes hands, equals price level times economic output), is that if a central
          bank prints more money without the economy actually producing more goods, prices are going to rise
          proportionally to absorb that extra cash. In practice, most policymakers today use a mix of both
          ideas, adjusting interest rates and the money supply while also paying attention to real
          supply-and-demand pressures in the economy.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How CPI Is Actually Calculated</h2>
        <p style={pStyle}>
          In the U.S., the Bureau of Labor Statistics tracks a broad "basket" of everyday goods and
          services, things like groceries, rent, gas, and healthcare, and checks how their combined price
          changes from month to month. That basket gets turned into a single number, the Consumer Price
          Index, and comparing CPI between two points in time gives you the inflation rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's roughly how the math works: say the CPI in January of one year was 236.916, and a year
          later it was 242.839. Subtract the two to get 5.923, then divide that by the original number:
          5.923 ÷ 236.916 comes out to about 2.5%. That's your inflation rate for that stretch. If the CPI
          actually went down instead of up over that period, you'd technically be looking at deflation
          rather than inflation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why Measuring Inflation Isn't as Clean as It Sounds</h2>
        <p style={pStyle}>
          Calculating CPI in theory is simple math, but in practice, it gets messy for a few reasons:
        </p>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Quality changes muddy the picture.</strong> If a laptop costs more than it did five
            years ago, is that inflation, or is it because the laptop is genuinely a better product now?
            Untangling price increases from quality improvements is one of the trickier parts of building an
            accurate index.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Volatile categories can distort short-term readings.</strong> A spike in oil prices can
            push headline inflation up temporarily even if the broader economy isn't really running hot,
            which is part of why you'll often see "core" CPI numbers that strip out food and energy
            specifically because those categories swing around so much.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Inflation doesn't hit everyone the same way.</strong> Someone who drives for a living
            feels a gas price spike a lot more than someone who works from home, even though they're
            technically experiencing the "same" inflation rate on paper.
          </li>
          <li>
            <strong>There's more than one version of the index.</strong> Beyond the standard CPI, you'll run
            into variations like CPIH (which factors in housing costs such as mortgage interest), CPIY (CPI
            stripped of taxes like VAT, useful for isolating price changes that aren't just tax hikes), and
            CPILFENS, the "core" measure that excludes food and energy for a steadier read on underlying
            inflation trends.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Historical U.S. Inflation, Decade by Decade</h2>
        <p style={pStyle}>
          Inflation hasn't been a steady 2-3% forever, it's swung wildly depending on the decade. Here's a
          rough sense of how U.S. inflation has trended over time, based on official CPI data:
        </p>
        <DataTable headers={["Period", "What Happened"]} rows={DECADE_ROWS} />
        <p style={pStyle}>
          If you're specifically looking for an inflation calculator by the 1800s, it's worth knowing why
          that's hard to find: official CPI tracking in the U.S. only goes back to around 1913, when the
          Bureau of Labor Statistics started publishing it consistently. Anything before that relies on
          estimated historical price reconstructions rather than an official government index, so most
          inflation calculators, including this one, work within the CPI-backed range rather than reaching
          back into the 1800s.
        </p>

        <h3 style={h3Style}>Full Year-by-Year U.S. Inflation Rate Table</h3>
        <p style={pStyle}>
          For anyone who wants the actual annual averages instead of just the decade-level summary above,
          here's the year-by-year breakdown of U.S. inflation going back to when the Bureau of Labor
          Statistics data begins. These are annual average rates based on CPI-U:
        </p>
        <DataTable headers={["Year", "Avg. Inflation", "Year", "Avg. Inflation", "Year", "Avg. Inflation"]} rows={YEAR_ROWS} />
        <p style={{ ...pStyle, fontSize: 12, marginBottom: 10 }}>
          *The 2026 figure is a partial-year average through the most recently published month and will
          shift as the remaining months are released.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few things jump out looking at the full table: the late 1910s saw inflation over 15-17% tied to
          World War I spending, the early 1920s and early 1930s swung into outright deflation (prices
          falling, not rising) during the post-war slump and the Great Depression, the late 1970s into 1980
          was the worst sustained stretch in modern U.S. history, and 2022 was the sharpest single-year spike
          since the early '80s. Outside of those periods, inflation has mostly bounced around in the 1-4%
          range.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What's the Inflation Rate Today?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As of mid-2026, U.S. annual inflation has been running in the mid-3% range, continuing a gradual
          cooldown from the 2022 peak but still sitting above the Federal Reserve's long-term 2% target. The
          Bureau of Labor Statistics releases a fresh CPI report roughly once a month, so "today's" inflation
          rate is really last month's 12-month reading, there's always a slight lag between when prices move
          and when the official number gets published. If you want the most current figure, checking the
          latest BLS release is your best bet, since a single month's reading can bounce around and doesn't
          always signal a lasting trend on its own.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Can You Actually Beat Inflation?</h2>
        <p style={pStyle}>
          There's no perfect way to fully dodge inflation, but sitting on cash that isn't earning anything is
          about the worst option, since it guarantees a slow loss in real value. If you had $50,000 sitting
          in a checking account earning zero interest during a year with 2.5% inflation, that money would
          effectively lose around $1,250 in real purchasing power by year's end, even though the number on
          the statement didn't change.
        </p>
        <p style={pStyle}>
          That's a big part of why the standard financial advice leans toward investing or putting money
          somewhere it can grow, rather than letting it sit idle. Common approaches people use to try to keep
          pace with or outrun inflation include:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Commodities</strong> like gold, silver, or oil, which tend to hold intrinsic value and
            often see demand rise as currency values fall. Gold specifically has a long track record as an
            inflation hedge because it's limited in supply and easy to store.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Treasury Inflation-Protected Securities (TIPS)</strong> — U.S. government bonds where the
            principal adjusts directly with CPI, so they're built specifically to track inflation rather than
            just hoping to outpace it. Other countries have similar instruments, like UK index-linked gilts
            or Mexican Udibonos.
          </li>
          <li>
            <strong>Real estate, stocks, and other assets</strong> that have historically tended to
            appreciate faster than the general price level over long stretches, though none of these come
            with guarantees.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          None of this is financial advice, just context for why "keep cash under the mattress" isn't
          usually the move when inflation is part of the picture. What actually makes sense depends on your
          own situation, timeline, and risk tolerance.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Privacy, Cost, and Access</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This calculator is free to use, with no hidden charges and no subscription tucked in somewhere.
          You don't need to sign up or hand over an email address to run a calculation, you just enter your
          numbers and get a result. Nothing you type in gets stored or shared anywhere; the tool simply
          processes the amount and years you provide and hands back the math. It's meant to be something you
          can open, use, and close without any friction, and come back to as many times as you need.
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
