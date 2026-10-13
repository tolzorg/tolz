import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What is VAT?",
    a: "VAT, or value-added tax, is a consumption tax charged at each stage of a product's journey, from raw materials to the final sale. Businesses collect it and send it to the government, but only the final customer ends up bearing it, since every business in the chain subtracts the VAT it already paid on its own purchases.",
  },
  {
    q: "How do I calculate VAT from a gross price?",
    a: "Divide the gross price by 1 plus the VAT rate as a decimal to get the net price, then subtract the net price from the gross price to get the VAT. At 20%, 120 ÷ 1.20 = 100, so the VAT is 20. Enter the gross price and the rate in the calculator and it does this for you.",
  },
  {
    q: "How do I add VAT to a price?",
    a: "Multiply the net price by 1 plus the VAT rate as a decimal. At 20%, you multiply by 1.20, so a net price of 100 becomes 120. To get only the VAT amount, multiply the net price by the rate as a decimal: 100 × 0.20 = 20.",
  },
  {
    q: "How do I work out VAT backwards?",
    a: "Working backward means starting from a total that already includes VAT. Divide the total by 1 plus the rate as a decimal, such as 1.20 for 20%. Don't just take 20% off the total, because that gives you the wrong net price.",
  },
  {
    q: "What's the difference between net and gross price?",
    a: "The net price is the amount before VAT. The gross price is the amount after VAT is included. The VAT amount is the difference between the two.",
  },
  {
    q: "What's the difference between VAT and sales tax?",
    a: "VAT is collected at every stage of production and distribution, with each business subtracting the VAT it already paid. Sales tax is collected once, at the final sale. Total tax collected is often similar, but VAT leaves a paper trail that makes evasion harder, and it costs more to administer.",
  },
  {
    q: "Does the US have a VAT?",
    a: "No. The US has no VAT at the federal or state level. Most states charge a retail sales tax instead, and local governments often add their own on top.",
  },
  {
    q: "Is VAT the same as GST?",
    a: "For everyday purposes, yes. GST (goods and services tax) is the name some countries, like Australia, Canada and New Zealand, use for what's basically a VAT. The details of each system vary by country, but the basic math for adding and removing the tax is identical.",
  },
  {
    q: "What is the current UK VAT rate?",
    a: "The UK standard rate is 20%, with a reduced rate of 5% and a zero rate for certain goods and services. Rates can change, so check GOV.UK before you file or invoice.",
  },
  {
    q: "Can I find the VAT rate if I only know the net and gross price?",
    a: "Yes. Subtract the net price from the gross price, divide the result by the net price, and multiply by 100. The calculator does this automatically when you enter those two values.",
  },
  {
    q: "What's the difference between zero-rated and exempt?",
    a: "Zero-rated goods are taxed at 0%, and the business can still reclaim VAT on its costs. Exempt supplies are outside the VAT system, so no VAT is charged and the business generally can't reclaim related input VAT. For a quick calculation, both mean no VAT is added.",
  },
  {
    q: "Who has to register for VAT?",
    a: "In most countries, businesses must register once their taxable turnover passes a set threshold, which differs by country. Smaller businesses can often register voluntarily. Check your local tax authority for the current threshold and rules.",
  },
  {
    q: "Can I get a VAT refund?",
    a: "Sometimes. Businesses can often reclaim VAT paid on business purchases, including cross-border purchases within the EU, and non-EU businesses may be able to recover VAT charged in EU countries. Many countries also refund VAT to visitors on goods they take home, though the UK ended its scheme in 2021.",
  },
  {
    q: "What is the VAT margin scheme?",
    a: "It's an alternative method that lets certain businesses, such as dealers in second-hand goods, pay VAT only on their profit margin instead of the full sale price. The seller can't reclaim VAT on the goods bought under the scheme.",
  },
  {
    q: "What is reverse charge VAT?",
    a: "It's a rule where the buyer, not the seller, accounts for the VAT. It's commonly used for cross-border business-to-business services. The buyer reports the VAT as both owed and (usually) reclaimable, so it often cancels out.",
  },
  {
    q: "Does the calculator work for countries other than the UK?",
    a: "Yes. Enter whatever rate applies in your country, such as 19% for Germany or 5% for the UAE. It doesn't look up rates for you, so confirm the right percentage first.",
  },
  {
    q: "Is this VAT calculator free?",
    a: "Yes. It's free to use, and you don't need an account.",
  },
  {
    q: "Why is my result off by a penny or a cent?",
    a: "Usually rounding. Some invoicing systems round each line and then add them up, while others round only the total. Check which method your tax authority or accounting software uses.",
  },
];

// Structured data uses the supplied schema wording, which shortens a few answers.
const FAQ_SCHEMA_OVERRIDES = {
  "How do I calculate VAT from a gross price?":
    "Divide the gross price by 1 plus the VAT rate as a decimal to get the net price, then subtract the net price from the gross price to get the VAT. At 20%, 120 divided by 1.20 is 100, so the VAT is 20.",
  "How do I add VAT to a price?":
    "Multiply the net price by 1 plus the VAT rate as a decimal. At 20%, you multiply by 1.20, so a net price of 100 becomes 120. To get only the VAT amount, multiply the net price by the rate as a decimal.",
  "How do I work out VAT backwards?":
    "Divide the VAT-inclusive total by 1 plus the rate as a decimal, such as 1.20 for 20%. Don't just take 20% off the total, because that gives you the wrong net price.",
  "What's the difference between zero-rated and exempt?":
    "Zero-rated goods are taxed at 0%, and the business can still reclaim VAT on its costs. Exempt supplies are outside the VAT system, so no VAT is charged and the business generally can't reclaim related input VAT.",
  "What is reverse charge VAT?":
    "It's a rule where the buyer, not the seller, accounts for the VAT. It's commonly used for cross-border business-to-business services. The buyer reports the VAT as both owed and usually reclaimable, so it often cancels out.",
};
const FAQ_SCHEMA_ITEMS = FAQ_ITEMS.map((item) =>
  FAQ_SCHEMA_OVERRIDES[item.q] ? { ...item, a: FAQ_SCHEMA_OVERRIDES[item.q] } : item
);

const CHAIN_HEADERS = ["Business", "Sells for (net)", "VAT charged (20%)", "VAT already paid on purchases", "Sent to tax authority"];
const CHAIN_ROWS = [
  ["Farm", "100", "20", "0", "20"],
  ["Mill", "250", "50", "20", "30"],
  ["Bakery", "600", "120", "50", "70"],
  ["Total", "", "", "", "120"],
];

const FACTOR_HEADERS = ["Rate", "Factor (multiply to add VAT, divide to remove it)", "VAT as a share of the gross price"];
const FACTOR_ROWS = [
  ["5%", "1.05", "1/21 (about 4.8%)"],
  ["7%", "1.07", "7/107 (about 6.5%)"],
  ["10%", "1.10", "1/11 (about 9.1%)"],
  ["15%", "1.15", "3/23 (about 13%)"],
  ["19%", "1.19", "19/119 (about 16%)"],
  ["20%", "1.20", "1/6 (about 16.7%)"],
  ["21%", "1.21", "21/121 (about 17.4%)"],
  ["23%", "1.23", "23/123 (about 18.7%)"],
  ["25%", "1.25", "1/5 (20%)"],
];

const COUNTRY_HEADERS = ["Country", "Standard rate", "Worth knowing"];
const COUNTRY_ROWS = [
  ["United Kingdom", "20%", "5% reduced rate (home energy, for example) and 0% on most food and children's clothing"],
  ["Germany", "19%", "7% reduced rate"],
  ["France", "20%", "Reduced rates of 10%, 5.5% and 2.1%"],
  ["Ireland", "23%", "Reduced rates of 13.5% and 9%"],
  ["Spain", "21%", "Reduced rates of 10% and 4%"],
  ["Italy", "22%", "Reduced rates of 10%, 5% and 4%"],
  ["Netherlands", "21%", "9% reduced rate"],
  ["Sweden", "25%", "Reduced rates of 12% and 6%"],
  ["Hungary", "27%", "Highest standard rate in the EU"],
  ["Luxembourg", "17%", "Lowest standard rate in the EU"],
  ["Switzerland", "8.1%", "Not an EU member, and has its own VAT rules"],
  ["United Arab Emirates", "5%", "Introduced in 2018"],
  ["Saudi Arabia", "15%", "Raised from 5% in 2020"],
  ["Australia", "10%", "Called GST"],
  ["Canada", "5% federal GST", "Provinces add their own taxes, and the rate you pay depends on where you are"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
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

function DataTable({ headers, rows, wrap = false }) {
  return (
    <div style={{ overflowX: "auto", marginBottom: 10 }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: "left", padding: "8px 10px", borderBottom: "2px solid var(--border)", color: "var(--text-primary)", fontFamily: "var(--font-display)", fontWeight: 700, whiteSpace: wrap ? "normal" : "nowrap", verticalAlign: "bottom" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: "8px 10px", borderBottom: "1px solid var(--border)", color: j === 0 ? "var(--text-primary)" : "var(--text-secondary)", fontWeight: j === 0 ? 600 : 400, whiteSpace: wrap && j === row.length - 1 ? "normal" : "nowrap", verticalAlign: "top", minWidth: wrap && j === row.length - 1 ? 200 : undefined }}>
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

export default function VatCalculatorFaqSection() {
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
        <h2 style={h2Style}>How the VAT Calculator Works</h2>
        <p style={pStyle}>
          VAT math ties four numbers together: the rate (a percentage), the net price (before tax), the gross price (after
          tax) and the VAT amount. If you know any two, the other two follow. That's why there's no "add" mode or "remove"
          mode to flip between. You just fill in what you've got.
        </p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Net price and rate:</strong> you get the VAT amount and the gross price (that's adding VAT).
          </li>
          <li style={liStyle}>
            <strong>Gross price and rate:</strong> you get the net price and the VAT amount (that's removing VAT).
          </li>
          <li style={liStyle}>
            <strong>Net price and gross price:</strong> you get the rate and the VAT amount.
          </li>
          <li style={liStyle}>
            <strong>Net price and VAT amount:</strong> you get the rate and the gross price.
          </li>
          <li style={liStyle}>
            <strong>Gross price and VAT amount:</strong> you get the net price and the rate.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Type plain numbers, with no currency symbols or thousands separators. The math is the same whether you're
          working in pounds, euros, dirhams or dollars, so use whatever currency your invoice is in. Change a number and
          the results update right away, which makes it easy to run quick what-ifs, like seeing how a price looks at 20%
          versus 5%.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is VAT?</h2>
        <p style={pStyle}>
          VAT stands for value-added tax. It's a consumption tax, which means it's baked into the price of what people buy
          rather than taken out of what they earn. It's also an indirect tax: you don't send it to the government
          yourself. The seller adds it to the price, collects it from you and passes it along, so businesses end up acting
          as the middlemen.
        </p>
        <p style={pStyle}>
          The "value-added" part is what makes it different from other taxes. Every business in a supply chain charges
          VAT on what it sells, but it also gets to subtract the VAT it already paid on what it bought. So each one ends up
          paying tax only on the value it added. By the time the product reaches a regular customer, the full tax has been
          collected, and the customer is the one who ultimately carries it.
        </p>
        <p style={pStyle}>
          Governments lean on it heavily. VAT brings in about a fifth of all tax revenue worldwide. As of early 2025,
          roughly 175 of the 193 UN member countries had some form of it, including every OECD country except the United
          States. Inside the EU, member states have to charge a standard rate of at least 15%, though most go well above
          that.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The idea isn't new. A German industrialist named Georg Wilhelm von Siemens floated it back in 1918 as a
          replacement for the old turnover tax. The modern version came from a French tax official, Maurice Lauré, who
          tried it out in the Ivory Coast in 1954 and then brought it to France itself in 1958. After the European Economic
          Community adopted its VAT directives in 1967, it spread through Europe fast, and plenty of other countries copied
          the model afterward. You'll also see it go by other names: VAT, GST (goods and services tax) or just
          "consumption tax," depending on the country.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How VAT Works Along a Supply Chain</h2>
        <p style={pStyle}>
          The easiest way to see it is with a loaf of bread at a 20% rate. A farm sells wheat to a mill, the mill sells
          flour to a bakery, and the bakery sells bread to you. Everybody adds 20% VAT to their price, but everybody also
          subtracts the VAT they already paid on their own purchases.
        </p>
        <DataTable headers={CHAIN_HEADERS} rows={CHAIN_ROWS} />
        <p style={pStyle}>
          Add up what reached the tax authority and you get 120, which is exactly 20% of the 600 final net price. The mill
          didn't pay tax on the farm's wheat a second time. It only paid on the 150 it added. The bakery did the same with
          its extra 350. That's why VAT doesn't snowball into tax on top of tax. You pay 720 at the register, and 120 of
          that is tax.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          For the businesses in the middle, VAT is mostly pass-through money. They collect it, subtract their credits and
          send in the difference. As long as they're registered and the purchases qualify, they're not out of pocket. The
          person who actually bears the cost is the end customer, who has no one further down the line to pass it to.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Adding VAT to a Net Price</h2>
        <p style={pStyle}>
          Adding VAT is the one most people already know. You've got a price before tax and you need the price after. Say
          the net price is €80 and the rate is 23%. Turn the percentage into a decimal (23 ÷ 100 = 0.23) and multiply: 80
          × 0.23 = 18.40. That's the VAT. Add it to the net and you get 98.40, the gross price. You can skip a step by
          multiplying by 1.23 right away. Same answer.
        </p>
        <p style={pStyle}>
          At 20% on a net price of £100, you'd get £20 in VAT and a gross price of £120. When you use this VAT calculator
          to add VAT, you see the tax amount and the total side by side, which is handy since invoices usually show both
          lines.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This direction is what you want when you're quoting a job, building a price list or writing up a sales invoice.
          In B2B work, prices are often quoted net and the tax gets added at the end, so seeing both numbers at once saves
          a step.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Removing VAT from a Gross Price</h2>
        <p style={pStyle}>
          This is the one that trips people up. Say a receipt shows a total of 120 with 20% VAT included. The natural move
          is to take 20% off 120, which gives you 96. That's wrong. The 20% was added to the original price, not to the
          final total, so 20% of 120 is more than the tax that's actually in there. The right move is to divide by 1.20:
          120 ÷ 1.20 = 100. The VAT is the 20 that's left over.
        </p>
        <p style={pStyle}>
          Same idea at 15%. A gross price of 230 divided by 1.15 gives you a net price of 200 and VAT of 30. Whatever the
          rate is, you divide the total by one plus the rate as a decimal. Never subtract the percentage from the total.
        </p>
        <p style={pStyle}>
          If you want to do it in your head, VAT is a fixed slice of any VAT-inclusive price, and the slice depends only on
          the rate:
        </p>
        <DataTable headers={FACTOR_HEADERS} rows={FACTOR_ROWS} />
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So at 20%, the VAT in any gross price is one-sixth of it. A £90 receipt has £15 of tax in it. At 25%, it's
          one-fifth. A reverse VAT calculator does all of this in a single step, but the shortcuts are great for
          sanity-checking a number on the fly.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Finding an Unknown VAT Rate</h2>
        <p style={pStyle}>
          Sometimes you've got the amounts but not the rate. A supplier invoice might list a net price and a total without
          saying what percentage was charged, or you just want to double-check that the right rate got applied. The
          formula is the gross price minus the net price, divided by the net price, times 100.
        </p>
        <p style={pStyle}>
          Here's an example. A net price of 250 and a gross price of 297.50 means 47.50 in tax. Divide 47.50 by 250 and you
          get 0.19, so the rate is 19%. You get the same answer if you enter 250 and 47.50 instead.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          If the number that comes back doesn't match any rate you know, look closer before you assume the math is off.
          The invoice might mix items at different rates, shipping might be taxed differently from the goods, someone might
          have made a typo, or rounding on a very small amount might be nudging the percentage by a hair. This also works
          as a quick price check. If a product is listed at 59.99 with tax included and you know the net price from a trade
          list, working out the implied rate tells you whether the tax treatment looks right.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>VAT Rates Around the World</h2>
        <p style={pStyle}>
          Most countries run a standard rate plus one or more reduced rates, and governments adjust them when budgets or
          politics shift. The figures below are the standard rates as of this writing, so check with the local tax
          authority before you file or invoice anything.
        </p>
        <DataTable headers={COUNTRY_HEADERS} rows={COUNTRY_ROWS} wrap />
        <p style={pStyle}>
          If you're after a UK VAT calculator at 20%, just type 20 into the rate field. Same for any other country. The
          tool doesn't look rates up for you, so it'll use whatever number you give it.
        </p>
        <p style={pStyle}>
          Two terms get mixed up a lot, so here's the difference. <strong>Zero-rated</strong> goods are still inside the
          VAT system. VAT is charged at 0%, and the business can still reclaim the VAT it paid on its own costs.{" "}
          <strong>Exempt</strong> supplies sit outside the system. No VAT is charged, and the business generally can't
          reclaim related input VAT. Education, health services and a lot of financial services and insurance are exempt
          in most countries. For a quick calculation, both give you a VAT amount of zero, and the calculator treats 0% like
          any other rate. The difference only shows up when you're filing a return.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The finer details change a lot from country to country. In the Philippines, senior citizens get a VAT exemption
          on many goods and some services for personal use. China has a reduced rate for things like books alongside its
          standard one. Plenty of countries leave out basics such as unprocessed food, schooling, medical care and
          government fees. Exports are usually zero-rated, since VAT is meant to be collected where the product is
          consumed. Filing deadlines, payment rules and penalties all vary too, so a setup that works in one country won't
          automatically carry over to another.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>VAT vs. Sales Tax</h2>
        <p style={pStyle}>
          Both are consumption taxes expressed as a percentage of the price, but they work differently under the hood.
          Sales tax is a single-stage tax. Nobody collects anything until the final sale, when the retailer adds it to the
          bill. VAT is a multi-stage tax, charged at every step of the chain, with each business subtracting what it
          already paid.
        </p>
        <p style={pStyle}>
          Go back to the bread example at 20%. If the country used a 20% sales tax instead, nothing would be collected from
          the farm, the mill or the bakery. You'd pay 120 on the 600 loaf at the register, and that'd be it. The government
          ends up with the same 120 either way. What changes is when and from whom it's collected.
        </p>
        <p style={pStyle}>
          So why would a country choose VAT? It's a lot harder to dodge. Because every business in the chain files its own
          paperwork, the numbers have to line up: if the bakery claims a credit for tax paid to the mill, the mill must
          have reported charging it. That paper trail is also the downside. VAT costs more to administer, and it's more
          work for businesses to comply with than a single tax at the register.
        </p>
        <p style={pStyle}>Some other differences are worth knowing:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Rates:</strong> Retail sales taxes tend to run lower, roughly 4% to 10%, while VAT rates in most
            countries sit between about 14% and 25%. That's partly because VAT is applied to a bigger base.
          </li>
          <li style={liStyle}>
            <strong>Visibility:</strong> In Europe, shelf prices include VAT, so what you see is what you pay. In the US,
            tax is added at the register, which makes it more noticeable. VAT is easier to overlook, and that's one reason
            governments like it.
          </li>
          <li style={liStyle}>
            <strong>Double taxation:</strong> VAT doesn't stack tax on tax, because each step gets a credit for the
            previous one. Sales tax can, for example when a business pays it on supplies it then uses to make something it
            sells.
          </li>
          <li style={liStyle}>
            <strong>Who really pays:</strong> Taxing businesses at each stage doesn't mean less for shoppers. Businesses
            just build the cost into their prices. Total revenue is generally about the same either way.
          </li>
          <li style={liStyle}>
            <strong>Fairness:</strong> Both taxes hit lower-income households harder, since they spend a bigger share of
            their income. Many countries soften that with reduced rates on food and essentials, or with rebates.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          People swap the terms "sales tax" and "VAT" all the time in casual talk, but they aren't the same thing.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Does the US Have a VAT?</h2>
        <p style={pStyle}>
          No. The US doesn't have a VAT at the federal level or in any state. It's the one major developed country that
          doesn't. Most states use a retail sales tax instead, and local governments often pile their own on top. Five
          states (Alaska, Delaware, Montana, New Hampshire and Oregon) don't have a statewide sales tax at all.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A VAT wouldn't automatically collect more than an equivalent sales tax. But it's easier for tax authorities to
          monitor, and harder for taxpayers to evade, thanks to the invoice trail and the detailed reporting. If you're in
          the US and selling to customers in the UK or EU, though, VAT can still apply to you. We'll get to that in a
          minute.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>VAT vs. GST</h2>
        <p style={pStyle}>
          In everyday use, GST (goods and services tax) is just another name for a VAT. Australia, Canada, New Zealand and
          Singapore call theirs GST, and the basic setup is the same: it's charged along the chain, businesses get credits
          for what they paid, and the final customer ends up paying.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Where they differ is in the local rules, not in the idea itself. Canada's federal GST sits alongside provincial
          taxes, and some provinces blend the two into a single harmonized tax. India's GST, introduced in 2017, replaced
          a whole pile of central and state taxes and has separate central and state components. Some articles claim
          there's a fundamental structural split between VAT and GST, such as one being tied to the sale and the other to
          the supply. In practice, for a quick calculation, they behave the same way. Just enter your country's rate and
          the math works.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Who Has to Charge and Pay VAT?</h2>
        <p style={pStyle}>
          Most businesses and individual traders are what tax authorities call "taxable persons." They're responsible for
          registering, charging VAT, and sending it in, whether they're based in the country or not. In many places, a
          domestic business only has to register once its taxable turnover crosses a set threshold (in the UK it's
          currently £90,000, but double-check, since thresholds get updated). Smaller businesses can often register
          voluntarily, which can make sense if you buy a lot of VAT-bearing supplies and want to reclaim that tax.
        </p>
        <p style={pStyle}>
          In some countries, and for some kinds of transactions, a middleman gets the bill instead of the seller. Payment
          processors and digital marketplaces can be on the hook, especially for cross-border sales.
        </p>
        <p style={pStyle}>
          The tricky bit for international sellers is the "place of supply." VAT is charged by the country where the
          transaction is considered to happen, and different countries have different rules for deciding that. A growing
          number of them now tax cross-border sales where the customer is, particularly for digital products, e-commerce
          purchases and live online events. That means a seller in one country can end up registering for VAT in several
          others. The EU runs a One-Stop Shop system that lets sellers report their EU sales through one portal instead of
          registering everywhere.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then there's the <strong>reverse charge</strong>. When a foreign supplier sells services to a local business,
          many countries skip the supplier's VAT obligation and make the buyer account for the VAT instead. The buyer
          records the tax as both owed and, usually, reclaimable, so it often nets out to zero. On an invoice you'll
          typically see a note saying "reverse charge applies" and no VAT on the line.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Input VAT, Credits and Refunds</h2>
        <p style={pStyle}>
          VAT is supposed to be neutral for businesses. They collect it from customers (output VAT) and subtract the VAT
          they paid on their own purchases (input VAT). The difference goes to the tax authority, or comes back as a refund
          if they paid more than they charged.
        </p>
        <p style={pStyle}>In real life, VAT can still cost a business money. A few things cause that:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>Some expenses aren't creditable, such as business entertainment, and fuel in some countries.</li>
          <li style={liStyle}>Refunds can take weeks or months, which strains cash flow, especially for exporters.</li>
          <li style={liStyle}>There's the cost of compliance and advisers.</li>
          <li style={liStyle}>Mistakes lead to fines and penalties.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A few things help keep those costs down. Businesses can build in-house know-how instead of paying for outside
          advice on every issue, track filing deadlines and invoice requirements with automated systems, and go after
          unclaimed credits and refunds. Larger companies can also use VAT grouping so transactions between related
          companies don't trigger tax, structure their groups so holding companies can recover input VAT, and take
          advantage of import VAT deferral schemes to smooth out cash flow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The VAT Margin Scheme</h2>
        <p style={pStyle}>
          Some businesses can use a different method called the margin scheme, where VAT is paid only on the profit margin
          rather than on the full sale price. It's common for second-hand goods, antiques, art and used cars. The tradeoff
          is that the seller can't reclaim VAT on the goods bought under the scheme, and the invoice doesn't show VAT
          separately.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Here's how it works. Say a dealer buys a used car for £10,000 and sells it for £12,000. The margin is £2,000.
          Since the margin already includes VAT, you'd work backward at 20%, which gives £333.33 in VAT due. To check that
          with the calculator, enter 2000 as the gross price and 20 as the rate. The rules differ by country, so confirm
          that the scheme applies to what you're selling.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When Can You Get a VAT Refund?</h2>
        <p style={pStyle}>There are a few situations where paid VAT comes back to you:</p>
        <ul style={listGapStyle}>
          <li style={liStyle}>
            <strong>Businesses within the EU:</strong> A company that paid VAT in another EU country can usually claim it
            back through the cross-border refund process.
          </li>
          <li style={liStyle}>
            <strong>Businesses outside the EU:</strong> A foreign company can often recover VAT charged on business
            expenses in an EU country.
          </li>
          <li style={liStyle}>
            <strong>Tourists:</strong> Many countries let visitors reclaim VAT on goods they take home. You usually need to
            spend a minimum amount in one store, get a form stamped at customs when you leave, and take the goods out within
            a set time. Refund agencies often take a fee. Note that the UK ended its tax-free shopping scheme for visitors
            in 2021, so check each country's rules before you plan around it.
          </li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Keep your receipts either way. Refund claims are only as good as the paperwork behind them.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Use a VAT Calculator</h2>
        <p style={pStyle}>The tool earns its keep in a bunch of everyday situations.</p>
        <p style={pStyle}>
          <strong>Freelancers and small businesses.</strong> A designer who agrees to a fee of 800 net needs the invoice
          figure once 20% is added. The calculator shows 160 in tax and a total of 960. It's just as handy in reverse, when
          a client pays a round gross amount and you need to know how much of it is yours.
        </p>
        <p style={pStyle}>
          <strong>Online sellers.</strong> If you sell to consumers in Germany at €49 including VAT, you don't keep €49.
          Divide by 1.19 and your net revenue is €41.18, with €7.82 going to VAT. That's the number to use when you're
          working out margins.
        </p>
        <p style={pStyle}>
          <strong>Bookkeepers and accountants.</strong> Bank entries and receipts are almost always gross, but ledgers
          need the net and VAT split. A quick reverse calculation is faster than building a formula for a few entries.
        </p>
        <p style={pStyle}>
          <strong>Buyers comparing quotes.</strong> Wholesale prices are often quoted net and shelf prices gross.
          Converting one to the other lets you compare them fairly.
        </p>
        <p style={pStyle}>
          <strong>Travelers and shoppers.</strong> If you're in Europe and wondering how much tax is in that price, or
          whether a tourist refund is worth the hassle, this gives you the answer. Americans in particular tend to be
          surprised by tax-included pricing.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>Students.</strong> Changing one input and watching the others update is a good way to see how net, gross
          and tax relate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>The Math Behind the Results</h2>
        <p style={pStyle}>
          Understanding the formulas helps you trust the output and catch mistakes in other people's numbers. With the
          rate written as r percent:
        </p>
        <div style={formulaStyle}>
          VAT amount = Net price × r ÷ 100
          <br />
          Gross price = Net price × (1 + r ÷ 100)
          <br />
          Net price = Gross price ÷ (1 + r ÷ 100)
          <br />
          r = (Gross price − Net price) ÷ Net price × 100
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Every combination of two inputs works out from those relationships. At 20%, a net price of 80 gives you 16 in tax
          and a gross price of 96. Enter 80 and 16 and you get a 20% rate. Enter 96 and 20% and you get 80 and 16 back. The
          numbers hold up from every direction.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Rounding and Small Differences</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          VAT amounts are usually shown to two decimal places, and a calculation can land on a fraction of a penny or
          cent. For a single price, the result here is correct to two decimals. For a long invoice, things get a bit more
          complicated. Some systems round each line and then add them up, others add the unrounded lines and round the
          total, and the two can differ by a cent or a penny. Which method is right depends on your country and your
          accounting software. If your invoice total is off by a hair from the calculator, rounding is almost always why.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common VAT Mistakes</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A handful of errors come up over and over. The big one is subtracting the percentage from the gross price
          instead of dividing, which understates the tax and gets worse at higher rates. The next is using one rate for a
          whole basket when the receipt has standard-rated, reduced-rated and zero-rated items on it. Calculate each group
          on its own. People also mix up markup and VAT. Adding 20% to your cost to cover profit isn't the same as adding
          VAT, and you should do them in separate steps. And then there's adding VAT to a price that already includes it,
          so the customer gets taxed twice. Before you type anything in, confirm whether a number is net or gross.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Is This VAT Calculator Free and Accurate?</h2>
        <p style={pStyle}>
          Yes, it's free to use, and there are no hidden charges attached to a result. You don't need to create an account
          to use the tool on this page. All you enter are the numbers the calculation needs, like a price and a rate, so
          there's no reason to type in business names, customer details or invoice files.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          As for accuracy, it uses the standard formulas above, the same way every time. What it can't do is know which
          rate applies to your product, your customer or your country. If you're filing a return, selling across borders
          or dealing with refunds and reclaim rules, treat the output as a working figure and confirm the rate and
          treatment with your tax authority or an accountant.
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
