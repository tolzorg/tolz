import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How do you calculate a car lease payment?",
    a: "Add the monthly depreciation, (net cap cost − residual) ÷ term, to the finance charge, (net cap cost + residual) × money factor, then add tax. An auto lease calculator does all of that for you.",
  },
  {
    q: "What is a good money factor for a car lease?",
    a: "It depends on your credit and the lender. 0.00125 is about 3% APR and 0.00250 is about 6%. Lower is better, and manufacturer promotions often have the lowest rates.",
  },
  {
    q: "How do I convert money factor to APR?",
    a: "Multiply the money factor by 2,400. For example, 0.0020 × 2,400 = 4.8% APR. To go the other way, divide the APR by 2,400.",
  },
  {
    q: "What is residual value in a car lease?",
    a: "It’s the estimated value of the car at the end of the lease, set by the leasing company, usually as a percentage of MSRP. A higher residual means a lower monthly payment. It’s also roughly the price you’d pay to buy the car at lease end.",
  },
  {
    q: "What is capitalized cost?",
    a: "It’s the price you’re leasing the car for, including any fees rolled in, minus your down payment, trade-in, and rebates. It’s the main number you can negotiate.",
  },
  {
    q: "Is it better to lease or buy a car?",
    a: "It depends on how many miles you drive, how long you keep cars, and your budget. Leasing means lower payments and no ownership. Buying costs more per month but builds equity. Compare total costs using the lease vs buy tool.",
  },
  {
    q: "How much should I put down on a lease?",
    a: "Many people keep it small. If the car is totaled or stolen early, a big down payment usually isn’t refunded. Try different amounts in the calculator and see how much each dollar actually lowers your payment.",
  },
  {
    q: "Is sales tax included in a lease payment?",
    a: "In most places, tax is added to each monthly payment. Some states tax the whole cap cost upfront. Enter your local rate and check with the dealer on how your state handles it.",
  },
  {
    q: "Can I negotiate a car lease?",
    a: "Yes. The capitalized cost is negotiable, and so is any dealer markup on the money factor. The residual is usually fixed by the lessor.",
  },
  {
    q: "How many miles can I drive on a lease?",
    a: "Most U.S. leases allow 10,000 to 15,000 miles a year, with 12,000 being the most common. Going over means a per-mile charge when you return the car. High-mileage leases cost more per month but give you extra room.",
  },
  {
    q: "What counts as normal wear and tear on a leased car?",
    a: "Small dings and scratches, light interior wear, and routine replacement of tires and brakes are usually normal. Large dents, cracked glass, bent rims, torn upholstery, and broken parts are typically charged to you.",
  },
  {
    q: "Can I buy my car at the end of the lease?",
    a: "Most leases allow it. The price is usually the residual value plus a fee. If the car’s market value is higher than that, buying can be a good deal.",
  },
  {
    q: "Can I get out of a car lease early?",
    a: "You can, but it usually costs money. Options include returning the car and paying termination fees, transferring the lease to someone else, buying it out early, or asking the lessor for temporary relief.",
  },
  {
    q: "Can I deduct a car lease on my taxes?",
    a: "If you use the car for business, you can generally deduct the business-use portion in the U.S., subject to limits. Check with a tax professional for your situation.",
  },
  {
    q: "What is a good monthly lease payment?",
    a: "There’s no universal number. It should fit comfortably in your budget alongside insurance, fuel, and maintenance. Use affordability mode to find a price range that matches your target payment.",
  },
  {
    q: "Is this auto lease calculator free?",
    a: "Yes. It’s free to use and doesn’t require signup.",
  },
];

// The supplied FAQ schema matches the displayed text, with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) => ({ q: straight(item.q), a: straight(item.a) }));

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, marginBottom: 0, paddingLeft: 18 };
const listGapStyle = { ...ulStyle, marginBottom: 10 };
const liStyle = { marginBottom: 8 };
const lastLi = { ...liStyle, marginBottom: 0 };
const cardStyle = { padding: "20px 20px" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, lineHeight: 1.8,
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

export default function AutoLeaseCalculatorFaqSection() {
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
        <h2 style={h2Style}>What Is an Auto Lease Calculator?</h2>
        <p style={pStyle}>
          An auto lease calculator estimates what you’ll pay each month to lease a vehicle. People also call it a car lease
          calculator or a lease payment calculator. It’s all the same idea.
        </p>
        <p style={pStyle}>
          A lease isn’t a loan on the whole car. You’re paying for the chunk of value the car loses while you drive it, plus a
          financing charge and tax. The calculator splits those pieces apart, which tells you something a dealer’s quote
          sheet usually doesn’t: which numbers are driving your payment, and which ones you can actually push on.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Think of a lease as a long-term rental. A normal rental runs a few hours or days. A lease usually runs two to four
          years. You make a down payment (sometimes), pay monthly, and give the car back at the end. Some leases include an
          option to buy the car when the term is up, and if you want that option written in from the start, it can nudge
          the monthly payment up a little.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What You Need to Enter</h2>
        <p style={pStyle}>
          Every field lines up with something on a real lease quote, so you can copy numbers straight off an offer sheet.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Vehicle price (capitalized cost):</strong> This is the negotiated price of the car, not the sticker price. Fees you roll into the lease get added to it. Rebates and incentives come off it.</li>
          <li style={liStyle}><strong>Down payment or trade-in (cap cost reduction):</strong> Money or trade-in value you put in upfront to lower the amount you’re paying for.</li>
          <li style={liStyle}><strong>Residual value:</strong> What the leasing company expects the car to be worth when your lease ends. Quotes usually show it as a percentage of MSRP. Multiply it out to get the dollar amount.</li>
          <li style={liStyle}><strong>Money factor:</strong> The lease version of an interest rate. It looks like a tiny decimal, such as 0.00250.</li>
          <li style={liStyle}><strong>Lease term:</strong> Number of months. 24, 36, and 39 are common, and the range is usually two to four years.</li>
          <li style={lastLi}><strong>Sales tax rate:</strong> Your local rate. More on how leases get taxed below, because it’s not the same everywhere.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          One tip from experience: negotiate the price like you’re buying the car. A lot of people recommend not telling the
          dealer you want to lease until you’ve settled on the price. That way you’re not accidentally negotiating from the
          monthly payment, where it’s easy to hide things.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Calculate a Car Lease Payment</h2>
        <p style={pStyle}>The monthly payment has three parts: depreciation, a finance charge, and tax.</p>
        <div style={formulaStyle}>
          Depreciation = (net cap cost − residual value) ÷ lease term in months<br />
          Finance charge = (net cap cost + residual value) × money factor<br />
          Tax = your tax rate × (depreciation + finance charge)<br />
          Monthly payment = depreciation + finance charge + tax
        </div>
        <p style={pStyle}>
          “Net cap cost” just means the negotiated price (plus any rolled-in fees) minus your down payment, trade-in, and
          rebates.
        </p>
        <p style={pStyle}>Here’s a full example with a trade-in, since that’s where people tend to trip up.</p>
        <p style={pStyle}>
          You negotiate a price of $42,000. You put $3,000 down and trade in a car worth $4,000. The lender’s residual is
          $25,000, the term is 36 months, the money factor is 0.00240, and your tax rate is 7%.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Net cap cost: $42,000 − $3,000 − $4,000 = $35,000</li>
          <li style={liStyle}>Depreciation: ($35,000 − $25,000) ÷ 36 = $277.78</li>
          <li style={liStyle}>Finance charge: ($35,000 + $25,000) × 0.0024 = $144.00</li>
          <li style={liStyle}>Base payment: $277.78 + $144.00 = $421.78</li>
          <li style={liStyle}>Tax: $421.78 × 0.07 = $29.52</li>
          <li style={lastLi}><strong>Monthly payment: about $451.30</strong></li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          You could do that on a napkin once. But if you’re comparing five cars, three terms, and a few down payment amounts,
          you’ll want the calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Money Factor Explained (and How to Turn It Into APR)</h2>
        <p style={pStyle}>
          Money factor is the number most people have never heard of until they’re sitting in a finance office. It’s just
          interest expressed in a weird way.
        </p>
        <p style={pStyle}>The conversion is easy:</p>
        <div style={formulaStyle}>
          Money factor × 2,400 = APR (as a percent)<br />
          APR (as a percent) ÷ 2,400 = money factor
        </div>
        <p style={pStyle}>
          So 0.00250 is about 6% APR, and 0.00125 is about 3%. If you’re working with APR as a decimal (0.06), divide by 24
          instead. Same result.
        </p>
        <p style={pStyle}>
          The 2,400 comes from how the finance charge works. It’s applied to the cap cost plus the residual, which is about
          double the average balance you actually owe over the lease. Dividing the yearly rate by 12 months and then by 2
          gives you 24, and multiplying by 100 to turn it into a percent gives you 2,400.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Why bother? Because money factor is one of the few places where a dealer can pad the deal. Lenders set a base rate
          based on your credit, and a dealer can add a markup on top. The poorer your credit, the higher the money factor,
          and the pricier the lease. Ask for the base money factor you qualify for, then compare it to what’s on your quote.
          If there’s a gap, you can see in the calculator exactly what it’s costing you every month. Often it’s more than
          you’d guess.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Residual Value and Capitalized Cost</h2>
        <p style={pStyle}>Two numbers move your payment more than anything else.</p>
        <p style={pStyle}>
          <strong>Residual value</strong> is set by the leasing company, not the dealer, and it’s usually not up for
          negotiation. It’s an estimate of what the car will be worth at the end of the lease. A higher residual means the
          car loses less value during your lease, which means a lower depreciation charge. That’s why cars that hold their
          value well can be cheap to lease even with a high price tag. It’s also why a car that depreciates fast can have a
          scary lease payment.
        </p>
        <p style={pStyle}>
          Residual is also the price you’d pay to buy the car when the lease ends (plus any purchase fee). Keep that in mind
          later.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Capitalized cost</strong> is the part you can negotiate. Every $1,000 you knock off lowers the payment, and
          the effect is bigger than you might expect because the cost comes through in both the depreciation and the finance
          charge. Shop the price around at multiple dealers. Ask for the “selling price” in writing. Watch for add-ons like
          paint protection or extended warranties getting folded into the cap cost.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Sales Tax and Fees on a Lease</h2>
        <p style={pStyle}>
          Lease tax rules vary by state, and sometimes by city. Some places tax each monthly payment. Others tax the whole cap
          cost upfront, and a few tax only the depreciation. This catches a lot of people off guard when they build a budget.
        </p>
        <p style={pStyle}>
          The tax field in this calculator applies your rate to the monthly payment, which is the most common setup. If your
          state does it differently, adjust the rate or ask the dealer how tax is applied before you trust the final number.
          Using the calculator as a car lease calculator with sales tax only works if the rate you enter matches how your
          state actually taxes the lease.
        </p>
        <p style={pStyle}>Fees matter too. Here’s what you’ll run into:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Acquisition fee:</strong> Charged by the leasing company to set up the lease. Often a few hundred dollars up to around a thousand, and usually rolled into the cap cost.</li>
          <li style={liStyle}><strong>Due at signing:</strong> Typically your first month’s payment, registration, documentation fees, and sometimes the acquisition fee. Ask for an itemized list.</li>
          <li style={liStyle}><strong>Security deposit:</strong> Some leases ask for one. It’s usually refundable if the car comes back in good shape.</li>
          <li style={liStyle}><strong>Disposition fee:</strong> A charge at the end of the lease for processing the return. Often a few hundred dollars, and sometimes waived if you lease or buy another car from the same brand.</li>
          <li style={lastLi}><strong>Early termination fee:</strong> Only if you bail out early. More on that below.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you plan to finance a fee, add it to the price field. If you plan to pay it at signing, treat it like a down
          payment. Either way, the calculator’s result will be closer to your real quote.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Much Car Can You Afford to Lease?</h2>
        <p style={pStyle}>
          Plenty of people don’t start with a price. They start with a number they can live with each month. Affordability
          mode handles that. Enter your target payment, the term, money factor, residual, and tax rate, and the calculator
          works out the net cap cost that payment supports.
        </p>
        <p style={pStyle}>
          Example: a $450 target payment, 7% tax, 36 months, a 0.00250 money factor, and a $21,600 residual. That points to a
          net cap cost of roughly $31,900.
        </p>
        <p style={pStyle}>
          One catch. In real life, a more expensive car usually has a bigger residual too, so the number isn’t perfectly
          fixed. Use the result as a ceiling for your negotiation, then re-run the numbers with the real residual for each
          specific car.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A quick gut check some leasing fans use is the “1% rule”: if your monthly payment with little or nothing down is
          around 1% of the car’s price or less, it’s a decent deal. Closer to 0.8% is great. It’s not gospel, but it’s a fast
          way to spot a bad quote. And don’t forget your budget needs room for insurance, gas or charging, and parking. Leases
          often require higher insurance coverage than you’d carry on a car you own.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Mileage Limits and Overage Charges</h2>
        <p style={pStyle}>
          Almost every lease has a mileage cap. In the U.S., standard leases usually allow 10,000, 12,000, or 15,000 miles per
          year, and 12,000 is the most common. If you go over, you pay a per-mile charge when you turn the car in. That charge
          is often somewhere between 15 and 30 cents a mile, and luxury brands can go higher. Check your contract for the
          exact number.
        </p>
        <p style={pStyle}>
          Do the math before you sign. Going 4,000 miles over at 25 cents a mile is $1,000. Over a three-year lease, being
          12,000 miles over is $3,000. That’s not small.
        </p>
        <p style={pStyle}>
          If you drive a lot, ask about a high-mileage lease. These give you several thousand extra miles a year, and the
          monthly payment is higher because the residual drops. Federal data puts the average American driver closer to
          13,000 miles a year, so plenty of people sit right on the edge of a 12,000-mile cap. Be honest with yourself about
          your commute, road trips, and any plans to move or change jobs.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Buying extra miles upfront is usually cheaper than paying the penalty at the end. And if you do go over, buying the
          car at lease end is one way to avoid the overage charge entirely.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Wear and Tear: What’s Normal and What You’ll Pay For</h2>
        <p style={pStyle}>
          When the lease ends, someone (often a third-party inspector) goes over the car. They’re looking for damage beyond
          what you’d expect for the mileage.
        </p>
        <p style={pStyle}>
          <strong>Normal wear and tear</strong> isn’t your problem. Definitions vary by lessor, but small dings and scratches
          that buff out, minor scuffs on wheel covers, light interior wear, and routine replacement of things like tires,
          brake pads, and bulbs usually fall here. A common rule of thumb is damage smaller than a credit card, or about half
          an inch to an inch depending on the contract.
        </p>
        <p style={pStyle}>
          <strong>Excessive wear and tear</strong> is on you. Think bent or cracked rims, broken glass, large dents, rust,
          torn or burned upholstery, missing parts, frame damage, or electrical and mechanical stuff that’s stopped working.
          If the repair cost is more than the car is worth (say, an accident total loss), you may be on the hook for the
          lower of the two numbers. Accident damage that’s your fault generally comes out of your pocket.
        </p>
        <p style={pStyle}>A few ways to stay out of trouble:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>Ask the lessor for a pre-return inspection about 60 to 90 days before the end of the lease. It’s often free and gives you time to fix problems cheaper than the lessor would.</li>
          <li style={liStyle}>Wash and detail the car before turning it in. Buff out small scratches and replace cheap broken parts.</li>
          <li style={liStyle}>Keep your service records. Many contracts require proof of regular maintenance.</li>
          <li style={liStyle}>Consider wear-and-tear coverage if you’ve got kids, pets, or a tight parking situation.</li>
          <li style={lastLi}>If you’re way over on damage or mileage, buying the car at the end is an option that sidesteps those penalties.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Maintenance Rules on a Leased Car</h2>
        <p style={pStyle}>
          Most lease contracts require you to keep up with scheduled maintenance, and they want proof. That means oil changes,
          tire rotation and replacement, brakes, and topping off fluids. Skip it and you can get hit with penalties or even
          void the warranty coverage.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The good news is that a leased car is usually under the manufacturer’s warranty the whole time, so big repair bills
          are rare. Many brands also include a few years of scheduled maintenance, which is worth asking about because it
          affects your total cost. Read this part of the contract carefully. Rules differ more than you’d think.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lease Your Car or Buy It?</h2>
        <p style={pStyle}>
          This is the big question, and the monthly payment alone won’t answer it. A lease payment is lower because you’re
          only paying for part of the car’s value. The real comparison is the total cost over the same stretch of time, and
          what you’re left holding at the end.
        </p>
        <p style={pStyle}>
          The calculator shows the purchase numbers right next to the lease numbers so you can see the gap. Upfront costs and
          monthly payments are higher when you buy. Here’s a rough example to show how the picture changes.
        </p>
        <p style={pStyle}>
          Using the earlier numbers, say you put in the same $7,000 (down payment plus trade-in) and have $35,000 left to
          cover. If you finance that over 60 months at 6%, the payment comes to about $677 a month, or around $40,600 total.
          After five years the loan is gone and you own a car that’s still worth something. If you leased instead and rolled
          right into a second lease, five years of payments at roughly $451 would run about $27,000, plus fees each time, and
          you’d own nothing at the end. That’s an illustration, not a prediction, and it ignores purchase sales tax,
          insurance, and repair costs on an older car. But it shows why the answer depends on how long you keep cars.
        </p>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>Leasing tends to work if you:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Like having a newer car every few years</li>
          <li style={liStyle}>Stay within the mileage limits</li>
          <li style={liStyle}>Want warranty coverage the whole time and fewer repair surprises</li>
          <li style={liStyle}>Want a lower monthly payment and smaller upfront cost</li>
          <li style={lastLi}>Can’t afford to buy a new car but still want to drive one</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}><strong>Buying tends to work if you:</strong></p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Drive a lot of miles</li>
          <li style={liStyle}>Keep your cars for six, eight, or ten years</li>
          <li style={liStyle}>Want to modify or customize your car</li>
          <li style={liStyle}>Want to build equity and eventually have no car payment</li>
          <li style={lastLi}>Don’t want to worry about end-of-lease inspections</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Leasing has downsides worth saying out loud. When it’s over, you’ve built no equity, the same way renting a house
          doesn’t. You don’t own the car, so there are limits on modifications. And you have to think twice about long
          cross-country trips. If you value those things, buying might fit better.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Business Use and Tax Deductions</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If you use a car for work, leasing can be attractive. In the U.S., you can generally deduct the business-use portion
          of lease payments, which can help self-employed people and small business owners. There are limits and special
          rules (including adjustments for higher-priced vehicles), and you’ll need to track business mileage. Talk to a tax
          professional before assuming a deduction, because the details depend on your situation.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Happens at the End of the Lease</h2>
        <p style={pStyle}>You’ve got a few options when the term is up:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Return the car.</strong> Pay any disposition fee, plus charges for excess mileage or damage, and walk away.</li>
          <li style={liStyle}><strong>Buy it.</strong> The price is usually the residual value plus a small purchase fee. If the car’s market value is higher than the residual, that can be a smart move.</li>
          <li style={liStyle}><strong>Trade it in.</strong> If the car is worth more than the buyout price, you may be able to use that extra value toward your next car.</li>
          <li style={lastLi}><strong>Extend the lease.</strong> Some lessors let you keep the car a few more months, which is handy if your next car hasn’t arrived.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>Start thinking about this about three to six months out, not the week before.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Get Out of a Car Lease Early</h2>
        <p style={pStyle}>
          People end leases early more often than you’d think. Sometimes they just don’t like the car. Sometimes life changes:
          a new baby, a longer commute, a job loss. Whatever the reason, there are a handful of ways out, and none of them
          are free.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Return the car to the lessor.</strong> It’s the simplest path, but expect an early termination fee, and in many cases you’ll owe the remaining depreciation too. It can add up fast.</li>
          <li style={liStyle}><strong>Transfer the lease.</strong> A lease swap puts someone else in your seat. They take over the same payment for the remaining months. There’s usually an admin fee of a few hundred dollars, and not every lessor or state allows it, so check your contract first. Lease swap websites exist to match people up and are usually upfront about fees.</li>
          <li style={liStyle}><strong>Buy out the car early.</strong> You can often pay the lessor a set price to end the lease. After that the car is yours, and you can sell or trade it. This usually only makes sense if the buyout price is lower than or close to what the car is worth on the market.</li>
          <li style={lastLi}><strong>Talk to the lessor.</strong> If money is tight, call them before you miss payments. Some will offer temporary relief, though the missed amount typically gets added back later.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Before you commit to a lease, ask what the early termination terms are. It’s a lot easier to understand them
          upfront than when you’re stuck.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You’ll Want an Auto Lease Calculator</h2>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Checking a dealer quote:</strong> Put the quoted numbers in. If your result is a few dollars off, that’s rounding. If it’s way off, something is hiding in the quote, like a marked-up money factor or an extra fee.</li>
          <li style={liStyle}><strong>Comparing cars:</strong> Test different residuals and prices to see which model leases cheapest.</li>
          <li style={liStyle}><strong>Setting a budget:</strong> Use affordability mode before you visit a dealership, so you set the limit rather than the salesperson.</li>
          <li style={liStyle}><strong>Testing negotiation moves:</strong> See how a $1,500 price cut or $2,000 down payment changes the monthly payment.</li>
          <li style={liStyle}><strong>Choosing a term:</strong> Run 24, 36, and 48 months and see how the payment and total cost change.</li>
          <li style={lastLi}><strong>Lease or buy:</strong> Compare both before you commit to either.</li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Tips for a More Accurate Estimate</h2>
        <ul style={listGapStyle}>
          <li style={liStyle}><strong>Use the negotiated price, not MSRP.</strong> MSRP is only useful for figuring the residual.</li>
          <li style={liStyle}><strong>Get the real money factor and residual in writing.</strong> Don’t guess.</li>
          <li style={liStyle}><strong>Treat fees consistently.</strong> Rolled in goes in the price. Paid at signing counts as a down payment.</li>
          <li style={liStyle}><strong>Check how your state taxes leases.</strong> It’s the most common reason estimates don’t match.</li>
          <li style={liStyle}><strong>Factor in mileage.</strong> More miles per year generally means a lower residual and a higher payment.</li>
          <li style={liStyle}><strong>Think about the big down payment.</strong> If the car is totaled or stolen early, the insurer typically pays the lessor, and your down payment usually isn’t coming back. Many people prefer to keep upfront money low. GAP coverage, which is often built into leases, covers the difference between what insurance pays and what you still owe, so ask whether it’s included.</li>
          <li style={lastLi}><strong>Look at the total cost.</strong> A low payment with a big down payment can cost more than a slightly higher payment with little upfront.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The result you get is an estimate. Your actual contract can differ because of rounding, incentives, and how the
          lessor structures things.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This Free Car Lease Calculator Private?</h2>
        <p style={pStyle}>
          Yes, the tool is free and you don’t need an account or signup to use it. It runs on vehicle and lease numbers, not
          personal details, so you’re never asked for your name, Social Security number, or credit info. The flip side is
          that it can’t see your credit tier, so enter a money factor from an actual quote instead of guessing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          On accuracy, it uses the standard lease formulas shown above, the same math lenders use. Treat the result as a
          solid estimate for comparing offers, and rely on your lease contract for the exact numbers.
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
