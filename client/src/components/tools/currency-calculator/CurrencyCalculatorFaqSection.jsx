import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "Is this currency calculator free to use?",
    a: "Yes. The tool is completely free, with no signup, subscription, or hidden fees required to convert between currencies.",
  },
  {
    q: "Does this tool use real-time exchange rates?",
    a: "Yes, by default it uses a live market exchange rate. You also have the option to enter a custom rate manually if you want to calculate using a specific rate instead of the current market one.",
  },
  {
    q: "Why is the rate here different from what my bank offered me?",
    a: "Banks and payment providers usually add a margin or spread on top of the real market rate. This calculator shows the mid-market rate, which is the benchmark rate before any provider markup is added.",
  },
  {
    q: "What is a currency pair, and which currency comes first?",
    a: "A currency pair shows the value of one currency against another, written as base currency/quote currency, for example, EUR/USD. The base currency is always treated as one unit, and the quote shows how much of the second currency it takes to equal that one unit.",
  },
  {
    q: "Why do exchange rates keep changing?",
    a: "Exchange rates move because of continuous trading activity in the global forex market, influenced by factors like inflation, interest rates, trade balances, political stability, and overall economic performance in each country.",
  },
  {
    q: "What's the difference between the bid price and the ask price?",
    a: "The bid price is what a buyer is willing to pay for a currency, and the ask price is what a seller wants to receive. The gap between the two, known as the bid-ask spread, is typically where banks and brokers build in their profit.",
  },
  {
    q: "Can I use this currency calculator without an internet connection?",
    a: "Live rate conversion requires a connection to fetch current market data. However, if you already know the exchange rate you want to use, the custom rate mode lets you calculate a conversion manually without needing live data.",
  },
  {
    q: "Do I need to create an account to use this tool?",
    a: "No. There is no signup or account creation required. You can use the calculator directly on the page at any time.",
  },
  {
    q: "Is my data stored when I use the currency calculator?",
    a: "No personal data or conversion history is stored or linked to your identity. Each conversion is calculated instantly without saving a record tied to you.",
  },
  {
    q: "Which currencies can I convert with this tool?",
    a: "The calculator supports a wide range of major and commonly traded world currencies, letting you convert between virtually any currency pair you need for travel, business, or shopping.",
  },
  {
    q: "Is it better to exchange money before I travel or after I arrive?",
    a: "Generally, exchanging at least some money domestically before you leave works out better, since you'll have more time to compare rates and won't be under pressure in an unfamiliar location. Airport kiosks and tourist-area exchange counters typically offer the weakest rates and highest fees.",
  },
  {
    q: "Can I use this to compare prices when shopping from an international website?",
    a: "Yes. Entering the listed price and converting it to your home currency gives you a clear, real-time comparison before you complete a purchase.",
  },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const cardStyle = { padding: "20px 20px" };

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

export default function CurrencyCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
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
          Whether you're planning a trip abroad, invoicing an overseas client, or simply trying to
          understand what your money is worth in another country, converting between currencies accurately
          matters. This currency calculator, available for free on{" "}
          <Link to="/" className="inline-home-link">Tolz</Link>, lets you convert between world currencies
          using a live market exchange rate, or enter your own custom rate for a quick offline calculation.
          There's no signup, no downloads, and no hidden steps, just enter an amount, pick your currencies,
          and get a result you can trust.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Currency Calculator Does</h2>
        <p style={pStyle}>
          At its core, this tool solves a simple but common problem: turning an amount in one currency into
          its equivalent in another. Instead of manually looking up an exchange rate and doing the math
          yourself, the calculator pulls in current market data and performs the conversion instantly. You
          select a "from" currency and a "to" currency, type in the amount you want to convert, and the tool
          displays the converted value along with the exchange rate it used.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          What sets this currency calculator apart from a basic multiplication exercise is flexibility. Most
          people need live, up-to-date rates because currency values shift constantly based on global market
          activity. But there are also situations, budgeting exercises, historical comparisons, academic
          assignments, or negotiating a fixed rate with someone, where you need to plug in a specific rate
          of your own rather than the current market one. This tool supports both modes, so you're not
          locked into a single way of working.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Live Market Rate Mode vs Custom Rate Mode</h2>
        <p style={pStyle}>
          Live rate conversion is the default and most commonly used mode. It reflects the current market
          exchange rate between two currencies at the time you run the calculation. This is the right choice
          when you want an accurate, real-world figure, for example, checking how much your salary in one
          currency translates to in another, or estimating the cost of a purchase from an international
          retailer.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Custom rate conversion lets you override the live rate and input your own number instead. This is
          useful in a few specific situations: your bank or payment provider quoted you a fixed rate that
          differs from the open market, you're doing a hypothetical calculation ("what if the rate was X"),
          you're working on a finance assignment with a rate given by an instructor, or you simply don't
          have an internet connection and already know the rate you want to use. Because both modes live in
          the same interface, you can switch between "what is it worth right now" and "what would it be
          worth at this rate" without needing two separate tools.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Currency Actually Is</h2>
        <p style={pStyle}>
          Currency is simply a medium that a group of people agrees to use in exchange for goods and
          services, and people have relied on some form of it for thousands of years. Before currency
          existed in any recognizable form, communities exchanged goods and services directly with one
          another through bartering, trading a sack of grain for a length of cloth, for instance, with no
          money changing hands at all. Over time, that direct swapping proved inefficient, and people began
          settling on objects that could stand in for value instead. History shows an unusually wide range
          of things pressed into service as money, including coins, gold, silver, barley, tea pressed into
          bricks, salt, cowrie shells, and even large carved stone discs used on some Pacific islands. The
          common thread is that anything a community collectively agrees has worth can function as currency,
          whether or not it has any practical use on its own.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The first currency that resembles what we'd recognize today was struck in the seventh century BC
          under King Alyattes of Lydia, in what is now western Turkey. Lydian coinage was round, a shape
          chosen for practical reasons, and it became the first standardized unit of currency in recorded
          history. Paper money came along much later and developed first in Asia; it eventually made its
          way to Europe after Marco Polo described it following his travels through the region.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Currency Works Today</h2>
        <p style={pStyle}>
          Money in its physical form, coins and bank notes, is still around, but it now represents a small
          share of how currency is actually stored and moved. Most of what people hold as currency sits in
          digital bank accounts rather than in a wallet, and the currencies issued by governments today are
          fiat currencies: they hold value because a government declares them legal tender, not because
          they're backed by a physical commodity like gold or silver, which is how most currencies operated
          in earlier eras.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Large currency transactions are settled electronically almost without exception, and even small
          everyday purchases, groceries, a haircut, a coffee, increasingly happen through debit cards,
          credit cards, or mobile payment apps rather than with physical notes and coins. This shift toward
          digital movement of money is part of why online currency conversion tools have become so commonly
          used: a growing share of financial life happens in numbers on a screen rather than cash in hand.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Where Cryptocurrency Fits In</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Cryptocurrency is a separate category worth understanding, even though it isn't issued or backed
          by any central government or bank. It's a digital form of money secured through encryption, with
          new units and transaction verification handled by a decentralized network rather than a single
          authority. The technology underlying most cryptocurrencies is a blockchain, a shared, distributed
          record of every transaction that's ever taken place on that network, maintained collectively by
          participants rather than by one central clearinghouse. Bitcoin remains the most widely recognized
          cryptocurrency and holds by far the largest market value among them, but there are numerous others
          in circulation, including Ethereum, Litecoin, and Ripple. Like traditional currencies,
          cryptocurrency values move up and down based on market activity, and they can be bought, sold, and
          exchanged in much the same way fiat currencies are.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Key Terms Worth Knowing Before You Convert</h2>
        <p style={pStyle}>
          A handful of terms come up repeatedly in any discussion of currency exchange, and understanding
          them makes it much easier to interpret the number this calculator gives you:
        </p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}><strong>Exchange rate</strong> — the value of one currency expressed in terms of another.</li>
          <li style={{ marginBottom: 8 }}>
            <strong>Forex</strong> — short for foreign exchange, the global, decentralized market where
            currencies are bought and sold. It's an over-the-counter market rather than a centralized
            exchange, and by trading volume it's the largest financial market in the world.
          </li>
          <li style={{ marginBottom: 8 }}><strong>Bid price</strong> — the price a buyer is willing to pay for a unit of currency.</li>
          <li style={{ marginBottom: 8 }}><strong>Ask price</strong> — the price a seller is willing to accept for a unit of currency.</li>
          <li style={{ marginBottom: 8 }}>
            <strong>Bid-ask spread</strong> — the gap between the bid and ask price. Banks, brokers, and
            currency exchange counters routinely widen this spread beyond the true market gap, and the
            difference functions as their profit, often labeled as a fee or commission rather than called a
            markup outright.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Pip</strong> — the smallest standard unit of movement in an exchange rate quote. If
            EUR/USD moves from 1.2800 to 1.2803, that's a three-pip move.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Currency pair</strong> — a quote showing the value of one currency against another. The
            first currency listed is the base currency; the second is the quote currency.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Interbank rate</strong> — the wholesale rate banks use when trading currency among
            themselves, generally more favorable than the rate offered to individual customers.
          </li>
          <li>
            <strong>Major currencies</strong> — the small group of currencies that dominate global trading
            volume: the U.S. dollar, euro, Japanese yen, British pound, Australian dollar, Canadian dollar,
            and Swiss franc. Any pair involving the U.S. dollar and one of these is referred to as a major
            currency pair.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How the Forex Market Sets the Rates You See</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Exchange rates exist because currencies are almost never equal in value to one another, and the
          foreign exchange market is where that relative value gets determined. It's a decentralized,
          over-the-counter market rather than a single physical exchange, and it operates at enormous scale,
          trillions of dollars in currency change hands globally every single day. Rates move continuously,
          sometimes shifting multiple times within the same minute, driven by the constant stream of buy and
          sell activity from banks, institutions, businesses, and individual traders around the world. The
          pairings that see the highest trading volume tend to involve the U.S. dollar against the euro, the
          Japanese yen, and the British pound.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Reading a Currency Pair and Forex Quote</h2>
        <p style={pStyle}>
          Every forex quote involves two currencies: a base currency and a quote currency (sometimes called
          a counter currency). Take a quote like EUR/USD 1.366 as an example. Here, EUR is the base currency
          and USD is the quote currency, meaning one euro is worth 1.366 U.S. dollars, or put differently, it
          costs $1.366 to buy one euro, before accounting for any commission a broker might add. The base
          currency in a pair is always represented as exactly one unit. If a EUR/MXN quote instead showed
          17.70, that would mean it takes 17.70 Mexican pesos to buy one euro. Most currency pairs quote how
          many units of a foreign currency one U.S. dollar buys, though the euro is a notable exception,
          conventionally quoted the other way around, in terms of how many dollars one euro is worth.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          When you go to buy foreign currency, you'll typically be shown two separate numbers: a buying rate
          and a selling rate, corresponding to the bid and ask price for that pair. If you're the one
          purchasing currency from a bank or a broker, you're transacting at their selling (ask) price,
          which sits above their buying price, the same basic principle any merchant follows, buying low and
          selling high.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Actually Moves Exchange Rates</h2>
        <p style={pStyle}>Exchange rates respond to an enormous number of variables, but a handful of forces do most of the work:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Inflation differences</strong> — a country with comparatively low inflation tends to see
            its currency strengthen over time as purchasing power holds up better, while a country with
            persistently higher inflation typically sees its currency lose value against currencies with
            steadier prices.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Interest rate differences</strong> — interest rates shape both the appeal of holding a
            given currency and the inflation outlook for that economy, and shifts in rates can push exchange
            rates up or down as capital moves toward better returns.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Trade deficits</strong> — when a country imports more than it exports, it needs more
            foreign currency than it earns from selling abroad, effectively increasing the supply of its own
            currency relative to demand and putting downward pressure on its value.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Political conditions</strong> — government policy and regulation can move exchange rates
            directly or indirectly, and economies seen as politically stable generally attract more foreign
            investment than those experiencing turmoil, since instability tends to push capital toward safer
            economies.
          </li>
          <li>
            <strong>Overall economic performance</strong> — capital tends to flow toward economies that
            appear strong and offer good returns, and that inflow of investment increases demand for the
            local currency, strengthening it in the process.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why and When You'd Need a Currency Calculator</h2>
        <p style={pStyle}>Currency conversion needs come up more often than people expect, and they rarely look the same twice. Here are the situations where this tool is most useful:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>International travel.</strong> Before or during a trip, travelers use a currency
            calculator to figure out how far their money will go, compare prices in local currency to what
            they're used to, and avoid overspending because a number "looked small" in an unfamiliar
            currency. Quick checks at a shop, restaurant, or hotel counter are far easier with a tool than
            with mental math.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Freelancing and international invoicing.</strong> Freelancers and remote workers who get
            paid in a foreign currency need to know what an invoice amount actually converts to in their
            home currency, especially when quoting rates to clients or reconciling payments that arrive in
            USD, EUR, or GBP.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Online shopping from overseas retailers.</strong> When a product is priced in a currency
            you don't use daily, converting the price first helps you understand the real cost before
            checkout, particularly important since some card issuers apply their own conversion margin that
            differs from the market rate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Studying or relocating abroad.</strong> Students and people relocating for work often
            need to convert tuition fees, rent, or living costs into their home currency to plan a realistic
            budget, especially when comparing offers or scholarships quoted in a different currency.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Business and cross-border transactions.</strong> Small business owners dealing with
            international suppliers or customers use currency conversion to price products, estimate margins
            after currency fluctuation, and understand how exchange rate movement affects their costs over
            time.
          </li>
          <li>
            <strong>General curiosity and financial literacy.</strong> Not every use case is urgent, many
            people simply want to understand global purchasing power, follow news about currency movements,
            or check how a specific pair (like USD to EUR) has shifted recently.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Currency Calculator</h2>
        <p style={pStyle}>Using the tool takes only a few seconds:</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>Select your source currency (the currency you're converting from).</li>
          <li style={{ marginBottom: 6 }}>Select your target currency (the currency you're converting to).</li>
          <li style={{ marginBottom: 6 }}>Enter the amount you want to convert.</li>
          <li style={{ marginBottom: 6 }}>Choose whether to use the live market rate or enter a custom rate manually.</li>
          <li>View your converted amount instantly, along with the exchange rate applied.</li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          There's no need to create an account, install anything, or provide personal or payment
          information. The calculator is built to be used repeatedly and quickly, ideal for anyone who needs
          to check conversions multiple times a day, such as while traveling or managing international
          payments.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy and Reliability of Exchange Rate Data</h2>
        <p style={pStyle}>
          An exchange rate is only useful if it reflects real market conditions, so this calculator draws
          its live rates from up-to-date market pricing rather than static or outdated figures. It's worth
          understanding, though, that exchange rates shift continuously throughout the trading day based on
          global supply, demand, interest rates, and broader economic events, as described above. The rate
          shown at any given moment is the mid-market rate, a fair, real-time benchmark sitting between the
          bid and ask price, which may differ slightly from the exact rate your bank or card provider
          applies, since financial institutions typically add their own spread or fee on top of the market
          rate.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This distinction matters: if you're comparing what a bank or currency exchange counter is offering
          you against the "real" rate, this calculator gives you that real market benchmark, so you can see
          whether you're getting a fair deal or being charged a significant markup. For everyday
          conversions, travel budgeting, invoice checking, price comparisons, the live rate gives you a
          dependable, current figure you can act on with confidence.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Currency Calculator vs Manual Conversion or Bank Estimates</h2>
        <p style={pStyle}>
          Doing currency math by hand or relying on a bank's quoted rate has real downsides. Manual
          calculation is slow and prone to simple arithmetic mistakes, especially with less familiar
          currency pairs or larger numbers involving decimals. Bank-quoted rates, on the other hand, are
          often not the true market rate, they include a spread that can meaningfully change the final
          amount, particularly for larger transactions.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Using a dedicated currency calculator solves both problems at once: it removes manual error and
          shows you the actual market rate so you can judge any fees or markups being applied elsewhere.
          It's also far faster than searching for a rate manually and then running the math yourself,
          particularly valuable when you need to check several currency pairs in a short time, such as
          comparing prices across multiple international vendors.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Getting a Fair Rate When Exchanging Money for Travel</h2>
        <p style={pStyle}>
          If you're planning to travel somewhere that uses a different currency, a little preparation goes a
          long way toward avoiding poor exchange rates. As a general rule, exchanging some cash domestically
          before you leave tends to work out better than waiting until you land, since you're under less
          time pressure and won't be trying to negotiate an exchange in an unfamiliar setting where you may
          not speak the local language well. Many banks and credit unions offer currency exchange with
          better rates and lower fees than other options, and some online currency services will order
          foreign cash and deliver it by mail ahead of your trip. Airport kiosks are convenient once you've
          landed, but they're also usually the most expensive option, with wide spreads and high fees built
          in to take advantage of travelers who need cash immediately and have limited alternatives nearby.
        </p>
        <p style={pStyle}>
          If you do need to exchange money after you've arrived, it's worth checking first whether your own
          bank has a branch or partner ATM in the area, since those tend to offer better terms than a local
          kiosk, hotel counter, or tourist-area exchange booth. Destinations where credit and debit cards are
          widely accepted make things simpler too, card issuers generally apply rates much closer to the
          wholesale market rate than cash exchange counters do, and carrying less physical cash is also
          safer. That said, it's worth checking your card's terms beforehand, since cards without
          travel-specific perks often carry a foreign transaction fee that adds a percentage on top of every
          purchase made abroad.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's also common to come home with leftover foreign currency that has no obvious use once you're
          back. Beyond keeping small amounts as a memento, it is possible to sell it back, and, as with
          buying it in the first place, banks and credit unions typically offer better rates and lower fees
          for this than a currency exchange kiosk would.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private, and Ready to Use Anytime</h2>
        <p style={pStyle}>
          This currency calculator is completely free to use, with no signup, account creation, or personal
          information required. You won't be asked for an email address, payment details, or any
          identifying information just to convert an amount, you can open the page and start using it
          immediately.
        </p>
        <p style={pStyle}>
          No data you enter into the calculator, the amount, the currencies selected, or a custom rate, is
          stored or tied to your identity. Each calculation is processed to give you an instant result,
          without creating a record that follows you between sessions. There are also no hidden charges,
          premium tiers, or usage limits blocking access to the core conversion feature; the tool is built to
          be used as often as you need, whether that's once for a single purchase or repeatedly throughout a
          trip or workday.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Because it runs directly in your browser without extra software, there's nothing to download or
          install, and it works the same way whether you're checking a conversion on a laptop before a
          business trip or double-checking a price on your phone while shopping.
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
