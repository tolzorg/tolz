import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate a monthly lease payment?",
    a: "Add depreciation and a finance charge. With present value, the payment is (asset value − discounted residual) × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is the number of months. The calculator does it instantly.",
  },
  {
    q: "How do I find the interest rate on a lease?",
    a: "Enter the asset value, residual value, term and the quoted monthly payment in rate mode. The tool keeps testing rates until one reproduces that payment.",
  },
  {
    q: "What is the residual value?",
    a: "It’s the estimated worth of the asset at the end of the lease. You pay for the difference between the starting value and the residual, plus interest.",
  },
  {
    q: "Does a higher residual value lower my payment?",
    a: "Yes. You’re financing less depreciation, so the payment drops, as long as price, term and rate stay the same.",
  },
  {
    q: "What is a money factor, and how do I convert it to APR?",
    a: "It’s a small decimal used in car leases to express the finance charge. Multiply it by 2,400 to get an approximate annual percentage rate.",
  },
  {
    q: "Do I subtract my down payment before using the calculator?",
    a: "Yes. Subtract the down payment from the asset value and enter the result. If fees are being rolled into the lease, add them to the asset value.",
  },
  {
    q: "What’s the difference between a lease and a rental?",
    a: "A lease is the contract, and rent is the payment. In practice, leases are longer and stricter. Rentals are typically more flexible and shorter.",
  },
  {
    q: "Is it cheaper to lease or buy a car?",
    a: "Monthly payments are usually lower when leasing, but buying and keeping a car for many years often costs less overall. The best way to compare is to total up everything you’d pay under each option.",
  },
  {
    q: "Can I buy the asset at the end of a lease?",
    a: "Often yes. Many car and equipment leases include a buyout option, typically priced at the residual value plus any fees. Check your contract.",
  },
  {
    q: "What’s the difference between a capital lease and an operating lease?",
    a: "Under current U.S. accounting rules, capital leases are called finance leases. The split affects how a business records the lease. Operating leases tend to suit shorter terms or fast-obsolescing assets. Your accountant can tell you how a specific lease is classified.",
  },
  {
    q: "What’s the difference between gross, net and NNN leases?",
    a: "In a gross lease, the landlord covers most operating costs. In net leases, the tenant pays some or all of them. A triple net (NNN) lease puts property taxes, insurance and CAM charges on the tenant.",
  },
  {
    q: "Can I use this as an equipment lease calculator?",
    a: "Yes. Any lease with an asset value, residual, term and rate works the same way.",
  },
  {
    q: "Is this lease calculator accurate?",
    a: "It’s accurate for the numbers you enter, using a standard formula. Your lessor’s figure can differ slightly because of fees, taxes, payment timing or rounding.",
  },
  {
    q: "Is this lease calculator free?",
    a: "Yes, it’s free with no hidden charges and no signup.",
  },
];

// FAQ schema exactly as supplied (its wording differs slightly from the displayed FAQ).
const FAQ_SCHEMA_ITEMS = [
  { q: "How do you calculate a monthly lease payment?", a: "Add depreciation and a finance charge. With present value, the payment is (asset value − discounted residual) × r ÷ (1 − (1 + r)^−n), where r is the monthly rate and n is the number of months." },
  { q: "How do I find the interest rate on a lease?", a: "Enter the asset value, residual value, term and the quoted monthly payment in rate mode. The tool tests rates until one reproduces that payment." },
  { q: "What is residual value?", a: "It is the estimated worth of the asset at the end of the lease. You pay for the difference between the starting value and the residual, plus interest." },
  { q: "Does a higher residual value lower my payment?", a: "Yes. You finance less depreciation, so the payment drops if price, term and rate stay the same." },
  { q: "What is a money factor, and how do I convert it to APR?", a: "A money factor is a small decimal used in car leases to express the finance charge. Multiply it by 2,400 to get an approximate annual percentage rate." },
  { q: "Do I subtract my down payment before using the calculator?", a: "Yes. Subtract the down payment from the asset value and enter the result. If fees are rolled into the lease, add them to the asset value." },
  { q: "What is the difference between a lease and a rental?", a: "A lease is the contract and rent is the payment. In practice, leases are longer and stricter, while rentals are typically shorter and more flexible." },
  { q: "Is it cheaper to lease or buy a car?", a: "Monthly payments are usually lower when leasing, but buying and keeping a car for many years often costs less overall. Total up everything you would pay under each option to compare." },
  { q: "Can I buy the asset at the end of a lease?", a: "Often yes. Many car and equipment leases include a buyout option, typically priced at the residual value plus any fees. Check your contract." },
  { q: "What is the difference between a capital lease and an operating lease?", a: "Under current U.S. accounting rules, capital leases are called finance leases. The split affects how a business records the lease. Operating leases tend to suit shorter terms or assets that become obsolete quickly." },
  { q: "What is the difference between gross, net and NNN leases?", a: "In a gross lease the landlord covers most operating costs. In net leases the tenant pays some or all of them. A triple net lease puts property taxes, insurance and common area maintenance on the tenant." },
  { q: "Can I use this as an equipment lease calculator?", a: "Yes. Any lease with an asset value, residual, term and rate works the same way." },
  { q: "Is this lease calculator accurate?", a: "It is accurate for the numbers you enter, using a standard formula. Your lessor's figure can differ slightly because of fees, taxes, payment timing or rounding." },
  { q: "Is this lease calculator free?", a: "Yes, it is free with no hidden charges and no signup." },
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "14px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const nestedUl = { paddingLeft: 18, marginTop: 8, marginBottom: 0 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center",
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

export default function LeaseCalculatorFaqSection() {
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
        <h2 style={h2Style}>How to Use This Lease Calculator</h2>
        <p style={pStyle}>The tool has two modes, and which one you want depends on what you already know.</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Payment mode.</strong> You know the interest rate and want the monthly payment. Enter the asset value, the residual value, the lease term in months and the annual interest rate. The tool gives you the payment.</li>
          <li style={lastLi}><strong>Rate mode.</strong> You know the monthly payment (from a dealer, a lessor or a contract draft) and want the interest rate it implies. Enter the asset value, residual value, term and monthly payment. The tool solves for the effective annual rate.</li>
        </ul>
        <p style={pStyle}>A quick rundown of the inputs:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Asset value</strong> is what’s being financed. For a car, that’s the negotiated price, not the sticker price. For equipment, it’s the agreed purchase price.</li>
          <li style={liStyle}><strong>Residual value</strong> is what the asset is expected to be worth when the lease ends. You’re not paying that part off.</li>
          <li style={liStyle}><strong>Term</strong> is the length of the lease in months. A 3-year lease is 36.</li>
          <li style={lastLi}><strong>Interest rate</strong> is the yearly cost of financing, entered as a percentage.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The tool doesn’t have a separate down payment field. If you’re putting money down, subtract it from the asset value
          before you enter it. If fees are being rolled into the lease, add them. The worked example below shows how.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a Lease?</h2>
        <p style={pStyle}>
          A lease is a contract between two parties. The lessor is the legal owner of the asset. The lessee is the person or
          business who wants to use it. The lessee gets the right to use the asset for an agreed period and pays regular
          installments in return. When the term ends, the asset usually goes back to the lessor. Sometimes the lessee gets
          the option to buy it or extend the lease.
        </p>
        <p style={pStyle}>
          People tend to think of leases in terms of apartments, offices and cars, but almost anything that can be owned can
          be leased. That includes furniture, storage units, lighting systems, conveyor belts, cleaning equipment, server
          hardware, software licenses, medical devices, delivery vans, farm machinery and even aircraft.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The contract usually does more than set a price. It also spells out how the asset can be used. A car lease might
          prohibit commercial use. An apartment lease might ban pets. An equipment lease might require specific maintenance
          or insurance. Those rules matter because breaking them can cost you money, sometimes more than a few missed
          payments would.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How a Monthly Lease Payment Is Calculated</h2>
        <p style={pStyle}>Every lease payment is built from two pieces: depreciation and a finance charge.</p>
        <p style={pStyle}>
          Depreciation is the gap between what the asset is worth today and what it’ll be worth at the end. That’s the value
          you actually use up, so that’s the part you pay for. The finance charge is the lessor’s return for tying up their
          money in the asset while you use it.
        </p>
        <p style={pStyle}>The calculator combines both with the standard present-value formula:</p>
        <div style={formulaStyle}>Payment = (Asset value − Residual ÷ (1 + r)^n) × r ÷ (1 − (1 + r)^−n)</div>
        <p style={pStyle}>
          Here, r is the monthly rate (annual rate divided by 12) and n is the number of months. The residual gets discounted
          because you don’t “receive” it until the end of the lease, which means it lowers the amount that has to be paid off
          through monthly installments.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Two quick notes. If the rate is zero, the formula simplifies to asset value minus residual, divided by the number
          of months. And the calculation assumes level payments at the end of each month. Plenty of car leases collect the
          first payment at signing, so your contract number can land a little off from the estimate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Example 1: A Simple 36-Month Lease</h2>
        <p style={pStyle}>
          Say you’re leasing an asset valued at $30,000. The residual is $18,000 (60% of the price), the term is 36 months
          and the rate is 6%. The monthly rate works out to 0.5%.
        </p>
        <p style={pStyle}>Plug that in and you get a payment of roughly $455 a month. Here’s where it comes from:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Depreciation is $12,000, or about $333 a month.</li>
          <li style={liStyle}>The remaining $122 or so is the finance charge.</li>
          <li style={lastLi}>Over 36 months you’d pay about $16,380, for an asset that started at $30,000 and was still worth $18,000 at the end.</li>
        </ul>
        <p style={pStyle}>Now change one thing at a time, which is where a calculator earns its keep:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Raise the residual to $20,000 and the payment drops to about $404. That’s roughly $51 a month saved, since you’re paying for less depreciation.</li>
          <li style={liStyle}>Drop the rate from 6% to 3% and the payment falls to about $394.</li>
          <li style={lastLi}>Lower the asset value by $2,000 through negotiation and the payment drops by about $40 or so a month.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Notice that the residual and the price move the payment more than the rate does. That surprises a lot of people
          who spend all their energy haggling over the rate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Example 2: A Lease With a Down Payment and a Buyout</h2>
        <p style={pStyle}>
          This one’s closer to a real car deal. The negotiated price is $35,000, you’re putting $3,000 down, the residual is
          $20,000, the term is 36 months and the rate is 6%.
        </p>
        <p style={pStyle}>
          First, subtract the down payment: $35,000 − $3,000 = $32,000. That’s the asset value you enter. The calculator
          returns a payment of about $465 a month.
        </p>
        <p style={pStyle}>Now the full picture:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Total monthly payments: about $465 × 36 = $16,740</li>
          <li style={liStyle}>Plus the down payment: $3,000, for roughly $19,740 out of pocket</li>
          <li style={lastLi}>If you keep the car at the end, add the $20,000 residual: about $39,740 total</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Compare that with the $35,000 price. The extra $4,700 or so is what financing the deal cost you, before any fees or
          taxes. That’s a handy way to frame it. You can also compare it against what a car loan for the same vehicle would
          cost in total interest, which gets you to a fair lease vs. buy comparison.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Find the Interest Rate From a Quoted Payment</h2>
        <p style={pStyle}>
          Dealers and lessors love quoting a monthly payment and skipping the rate. There’s no clean formula for solving the
          rate directly from the payment, so the tool uses trial and error behind the scenes. It keeps adjusting the rate
          until the calculated payment matches the one you entered, then shows you the answer.
        </p>
        <p style={pStyle}>
          Here’s how to put that to work. Take the first example and enter $30,000, $18,000, 36 months and a payment of about
          $455. The tool comes back with roughly 6%. Now say a dealer quotes you $490 for those exact numbers. Run it, and
          you’ll see the implied rate jump well above what you’d expect to pay on a loan.
        </p>
        <p style={pStyle}>
          That gap usually means something is baked into the payment. It could be a marked-up rate, extra fees rolled in,
          add-on products, or a higher capitalized cost than the one you negotiated. Ask for an itemized breakdown, then rerun
          the numbers with the true all-in figures.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One caution. If the quote has the first payment due at signing, or fees you can’t see, the rate the tool returns
          can come out a bit off from the “official” rate. Treat it as a strong sanity check, not a legal disclosure.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Residual Value Explained</h2>
        <p style={pStyle}>
          Residual value, sometimes called salvage value, is the estimated worth of an asset when the lease ends. In simple
          terms, it’s the price the asset could probably sell for at that point.
        </p>
        <p style={pStyle}>
          Lessors usually set it, often as a percentage of the original price, and they base it on how well the asset is
          expected to hold its value. For a popular car on a 3-year lease, a residual somewhere in the 50s to low 60s percent
          isn’t unusual, though it swings a lot by model, mileage allowance and market conditions.
        </p>
        <p style={pStyle}>A few things to keep in mind:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Higher residual, lower payment.</strong> You’re paying for less depreciation. That’s why two cars with the same sticker price can lease for very different amounts.</li>
          <li style={liStyle}><strong>Longer term, lower residual.</strong> The older the asset gets, the less it’s expected to be worth. Real estate is the usual exception, because property can appreciate.</li>
          <li style={liStyle}><strong>It’s a prediction, not a fact.</strong> If the asset ends up worth less than the residual and you own the buyout option, you can walk away. If it’s worth more, buying it out can be a good deal.</li>
          <li style={lastLi}><strong>You can’t negotiate it as easily as the price.</strong> The residual is mostly the lessor’s number, so focus your leverage on the asset value.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Make sure the residual you enter comes from the actual offer sheet or contract. Guessing here throws off every other
          number.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Money Factor vs. Interest Rate</h2>
        <p style={pStyle}>
          Car leases often skip the annual rate and quote a money factor instead. It’s a small decimal like 0.0025. You might
          also hear it called a lease factor or lease fee.
        </p>
        <p style={pStyle}>
          Converting it is easy. Multiply the money factor by 2,400 to get an approximate APR. So 0.0025 × 2,400 = 6%. Going
          the other way, divide the APR by 2,400.
        </p>
        <p style={pStyle}>
          The money factor method also gives you a quick payment estimate: depreciation plus (asset value + residual) × money
          factor. On Example 1 that comes out to about $453, close to the $455 from the full calculation. The gap is small,
          but it’s the reason a dealer’s number and a calculator’s number sometimes differ by a few bucks.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If your quote shows a money factor, convert it first and enter the equivalent rate. And if you spot a money factor
          that looks high, ask whether it’s the lender’s base rate or has been marked up. Dealers can sometimes add to it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Leasing a Car</h2>
        <p style={pStyle}>
          Car leasing lets you drive a newer vehicle for a few years, usually while it’s still under the manufacturer’s
          warranty, without paying the full purchase price. Terms commonly run 24 to 48 months, and 36 is the most common.
        </p>
        <p style={pStyle}>
          The monthly payment is mostly driven by the gap between the capitalized cost (the negotiated price, plus any
          rolled-in fees) and the residual value. Beyond that, a car lease has some quirks worth knowing:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Mileage limits.</strong> Allowances like 10,000, 12,000 or 15,000 miles a year are common. Going over typically means a per-mile charge, which is often in the range of 15 to 30 cents.</li>
          <li style={liStyle}><strong>Wear and tear.</strong> Dings, stained seats and worn tires beyond “normal” can get billed at turn-in.</li>
          <li style={liStyle}><strong>Fees.</strong> An acquisition fee is common at signing, and a disposition fee often shows up at the end if you return the car.</li>
          <li style={liStyle}><strong>Security deposit and down payment.</strong> Some leases require them, some don’t. A down payment lowers your monthly bill but doesn’t protect you if the car’s totaled early, so many people prefer to put little or nothing down.</li>
          <li style={liStyle}><strong>Taxes.</strong> Sales tax rules on leases vary by state. Some states tax the monthly payments, some tax the full price, and some do it differently again.</li>
          <li style={liStyle}><strong>Buyout.</strong> Many contracts let you buy the car at the end for the residual plus any fees.</li>
          <li style={lastLi}><strong>GAP coverage.</strong> Many leases include it, but check, because being “upside down” on a totaled leased car can get expensive.</li>
        </ul>
        <p style={pStyle}>Leasing a used car is possible but a lot less common than leasing new.</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A heads-up on the cost: leasing a car for a few years often costs more per year of use than buying it and keeping
          it for a long time. You’re paying for the most expensive part of a car’s life, the early depreciation, over and
          over. That said, leasing can still make sense if you like having a new car every few years, want predictable costs
          under warranty, or use the car for business.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Leasing vs. Renting a Car</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both involve paying for the right to use a vehicle you don’t own, but that’s about where the similarities stop.
          Leases run for years and come from dealerships. Rentals run from a day to a few weeks and come from rental
          agencies. People rent when their own car’s in the shop or they’re traveling. They lease when they want a vehicle
          for the long haul without buying it.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business and Equipment Leasing</h2>
        <p style={pStyle}>
          Companies of every size lease equipment, from a coffee shop leasing an espresso machine to a manufacturer leasing
          assembly-line machinery. The big appeal is simple: you get the equipment without paying for all of it upfront. For
          a new business short on capital, that can be the difference between launching and waiting.
        </p>
        <p style={pStyle}>A few common equipment lease structures:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>$1 buyout lease.</strong> You make payments, then buy the equipment for a dollar at the end. It behaves a lot like a loan.</li>
          <li style={liStyle}><strong>Fair market value (FMV) lease.</strong> Payments are lower, and at the end you can return the equipment, renew, or buy it at its then-current market value.</li>
          <li style={lastLi}><strong>Short-term or technology leases.</strong> These are common for computers, phones and other gear that gets outdated fast.</li>
        </ul>
        <p style={pStyle}>
          For tax purposes, lease payments on a true operating lease are generally deductible as a business expense, which can
          lower a company’s tax bill. Vehicle leases for business can come with limits, and higher-priced vehicles can trigger
          an IRS “lease inclusion amount” that trims the deduction. Tax treatment depends on the lease type and your
          situation, so run it by an accountant before signing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You can use the tool as an equipment lease calculator for any of these. Just use the equipment’s agreed price, the
          buyout or expected end value as the residual, and the term and rate from the proposal.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Capital Leases vs. Operating Leases</h2>
        <p style={pStyle}>
          In business, leases get sorted into two broad categories for accounting. Competitors often describe the old rules,
          so here’s the current picture.
        </p>
        <p style={pStyle}>
          Under the older U.S. standard, a capital lease went on the balance sheet as an asset, while an operating lease was
          treated as a rental expense and stayed off the balance sheet. That distinction is now blurrier. Under ASC 842,
          which FASB phased in starting in 2019 for public companies and 2022 for most private ones, leases longer than 12
          months generally go on the lessee’s balance sheet either way. International standards (IFRS 16) work similarly.
        </p>
        <p style={pStyle}>
          What’s left of the old split is the difference between a finance lease (the new name for a capital lease) and an
          operating lease, which affects how expenses show up on the income statement. A lease generally counts as a finance
          lease if it meets at least one of these tests:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Ownership transfers to the lessee at the end.</li>
          <li style={liStyle}>The lessee has a purchase option they’re reasonably certain to use.</li>
          <li style={liStyle}>The lease term covers most of the asset’s economic life (75% is the usual benchmark).</li>
          <li style={liStyle}>The present value of the payments covers substantially all of the asset’s fair value (90% is the usual benchmark).</li>
          <li style={lastLi}>The asset is so specialized that it has no alternative use to the lessor afterward.</li>
        </ul>
        <p style={pStyle}>
          Operating leases tend to suit shorter terms and assets that get obsolete quickly. Some include a bargain purchase
          option, which lets the lessee buy the asset at a favorable price at the end.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          None of this changes how the payment gets calculated. It changes how a business records it. If you’re a business
          owner, your accountant will tell you how your specific lease should be classified.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Real Estate Leases</h2>
        <p style={pStyle}>
          Real estate leases work differently enough that they deserve their own section, and it’s worth saying up front: a
          payment calculator like this one isn’t the right tool for ordinary apartment rent. Rent is set by the market and
          the landlord, not by a depreciation formula, and there’s usually no residual value in the same sense. For a regular
          rental, you just need to read the lease.
        </p>
        <p style={pStyle}>Still, understanding the main lease structures helps if you’re renting or leasing space.</p>

        <h3 style={h3Style}>Residential Leases</h3>
        <p style={pStyle}>
          Twelve months is the most common term for homes and apartments. Other terms like 3, 6, 18 or 24 months are common
          too. Lease-to-own or rent-to-own deals combine a lease with an option to buy the property at an agreed price within
          a set period. Those can work for people who need time to build credit or savings, but the terms (especially what
          happens to the extra money you pay) vary a lot, so read them closely.
        </p>

        <h3 style={h3Style}>Commercial Leases</h3>
        <p style={pStyle}>
          Commercial leases for offices, retail spaces, warehouses and factories usually run longer and are stricter. The big
          question is who pays for what. The main types:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Gross lease (full-service lease).</strong> The tenant pays one flat rent, and the landlord covers most or all operating costs like property taxes, insurance and maintenance. It’s simple to budget for, but you often pay a premium for that simplicity.</li>
          <li style={liStyle}>
            <strong>Net leases.</strong> The tenant pays base rent plus some of the property’s costs, usually at a lower base rent than a gross lease. There are three flavors:
            <ul style={nestedUl}>
              <li style={liStyle}><strong>Single net (N):</strong> base rent plus the tenant’s share of property taxes. This one’s the least common.</li>
              <li style={liStyle}><strong>Double net (NN):</strong> base rent plus property taxes and insurance. The landlord generally still handles structural repairs and common areas.</li>
              <li style={lastLi}><strong>Triple net (NNN):</strong> base rent plus property taxes, insurance and common area maintenance (CAM) charges. It’s the most common net lease in U.S. retail and commercial buildings, and it’s generally landlord-friendly because the tenant carries more of the cost risk.</li>
            </ul>
          </li>
        </ul>
        <p style={pStyle}>
          Some NNN leases are bondable, meaning the tenant can’t terminate or adjust rent even if costs jump or something goes
          wrong with the property. An absolute net lease takes this furthest, putting essentially all building expenses on
          the tenant.
        </p>
        <p style={pStyle}>
          <strong>Modified leases.</strong> These sit between gross and net. In a modified net lease, the tenant might pay
          taxes and insurance while splitting CAM costs with the landlord. A modified gross lease looks more like a
          full-service lease, but with some services left out. They’re common in multi-tenant office and medical buildings.
          The labels get used loosely, so the contract wording matters more than the name.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With commercial space, always ask for a full breakdown of what’s in the base rent and what’s extra. The “cheap” rent
          can end up costing more once CAM charges and taxes land.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What’s Not Included in the Calculation</h2>
        <p style={pStyle}>The tool gives you the core payment. Real leases usually carry extras outside the formula:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Down payment or capitalized cost reduction (subtract from asset value)</li>
          <li style={liStyle}>Acquisition and disposition fees (add to asset value if rolled in)</li>
          <li style={liStyle}>Sales tax on the payment or the price</li>
          <li style={liStyle}>Registration, title and doc fees</li>
          <li style={liStyle}>Insurance, which lessors often require at higher coverage levels than you might carry otherwise</li>
          <li style={liStyle}>Excess mileage and wear charges</li>
          <li style={lastLi}>Early termination penalties, which can be steep</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Adjusting your inputs for the ones that apply gets the estimate close to the contract number. The signed agreement
          is always the final word.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lease vs. Rent</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          People use the two words interchangeably, but they’re not exactly the same. Technically, a lease is the contract
          and rent is the payment for using something. Practically, leases are stricter. A month-to-month rental can usually
          be ended or changed with notice. A lease locks both sides in for the full term, and walking away early usually
          means penalties. In neither case do you build equity in the asset.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lease vs. Buy: How to Compare Them Fairly</h2>
        <p style={pStyle}>
          The core difference is ownership. When you lease, the lessor keeps the title and you borrow the asset. When you
          buy, you own it, even if a loan is involved.
        </p>
        <p style={pStyle}>Here’s how that plays out:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Cost.</strong> Monthly lease payments are often lower than loan payments because you’re only covering depreciation plus interest. But over a long stretch, leasing back-to-back often costs more than buying and keeping the asset. Fees can add up, too.</li>
          <li style={liStyle}><strong>Ending early.</strong> With a loan, you can sell the asset when you want and use the money to pay off the balance. Ending a lease early often triggers penalties.</li>
          <li style={liStyle}><strong>Equity.</strong> At the end of a loan, you own something you can sell or trade in. At the end of a lease, you hand it back and start over.</li>
          <li style={lastLi}><strong>Usage.</strong> Owning means no mileage caps and no turn-in inspection. Leasing means limits and responsibility for damage beyond normal wear.</li>
        </ul>
        <p style={pStyle}>
          To compare fairly, use the calculator to get your lease payment, then total up what you’d pay: payments plus down
          payment plus fees. Then work out what the loan would cost in total for the same asset, and subtract what you could
          sell it for. Include the buyout cost for the lease if you plan to keep the asset.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Leasing tends to suit people who want lower monthly payments, newer equipment every few years, or predictable costs.
          Buying tends to suit heavy use, long holding periods or anyone who’d bump into mileage and wear limits.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What’s in a Lease Agreement?</h2>
        <p style={pStyle}>
          There’s no universal template, since contracts follow the law of the state or country. But most leases cover:
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>The names of the lessor and lessee</li>
          <li style={liStyle}>A description that identifies the asset (a VIN for a car, a serial number for equipment, an address for property)</li>
          <li style={liStyle}>Start date and term</li>
          <li style={liStyle}>Payment amount and schedule</li>
          <li style={liStyle}>Security deposit terms and how it’s returned</li>
          <li style={liStyle}>Permitted use and restrictions</li>
          <li style={liStyle}>Insurance requirements (typically for things like fire, theft, vandalism and weather damage)</li>
          <li style={liStyle}>Who handles maintenance and repairs</li>
          <li style={liStyle}>Default conditions and what happens if you miss payments</li>
          <li style={liStyle}>Renewal, buyout and return terms</li>
          <li style={lastLi}>Early termination clauses</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Read the termination and default sections especially carefully. That’s where leases tend to get expensive.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What About Ecoleasing?</h2>
        <p style={pStyle}>
          Ecoleasing is a less common model, but it’s growing. Instead of buying a product, a customer pays to use it for a set
          period or amount of use, and the manufacturer takes it back at the end to recycle or refurbish it. A TV is a common
          example: the customer gets the right to use it for a set number of hours, then returns it.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It differs from traditional leasing in a few ways. It’s usually simpler, often more like an ordinary purchase than a
          formal contract. It’s mostly used for appliances and relatively inexpensive household goods, not for land, real
          estate or big-ticket items. And the term usually matches the product’s lifespan, so the item gets used once and then
          recycled. The upside is less waste, since materials get recovered and reused. This calculator isn’t designed for
          that model, since ecoleasing pricing is usually set by the manufacturer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for Getting an Accurate Result</h2>
        <ul style={ulStyle}>
          <li style={liStyle}>Use the negotiated price, not the sticker.</li>
          <li style={liStyle}>Pull the residual and term straight from the offer sheet.</li>
          <li style={liStyle}>Convert any money factor to an annual rate (× 2,400).</li>
          <li style={liStyle}>Subtract any down payment from the asset value, and add any fees rolled into the lease.</li>
          <li style={liStyle}>Run a few scenarios, changing one input at a time.</li>
          <li style={liStyle}>When comparing offers, apply the same assumptions to each one.</li>
          <li style={lastLi}>Check the implied rate from any quote against what you’d pay on a loan</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Free, Private and Simple to Use</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This lease calculator is free, with no hidden charges and no signup. It only needs numbers: asset value, residual
          value, term and rate or payment. You don’t have to enter your name, contact details or any contract documents. The
          results come from a standard present-value formula, so the same inputs always return the same answer, and you can
          rerun it as many times as you want while you negotiate. Small differences from your lessor’s figure can come from
          rounding, payment timing or fees, and the contract is always the final word.
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
