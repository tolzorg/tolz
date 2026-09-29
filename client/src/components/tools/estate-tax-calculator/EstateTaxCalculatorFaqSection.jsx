import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How much is the federal estate tax exemption for 2026?",
    a: "It's $15 million per person. A married couple can potentially shield up to $30 million by using portability, which requires filing Form 706 after the first spouse dies.",
  },
  {
    q: "What is the federal estate tax rate?",
    a: "The top rate is 40%, charged on the value above the exemption. Since the exemption is so high, effectively everything that's taxed is taxed at 40%.",
  },
  {
    q: "How do I calculate estate tax?",
    a: "Add up the gross estate, subtract debts, expenses, and marital and charitable deductions, add lifetime taxable gifts, subtract the exemption, and multiply what's left by 40%. The calculator handles it for you.",
  },
  {
    q: "Do I owe estate tax if my estate is under $15 million?",
    a: "Not at the federal level. Your state could still tax it, and many state thresholds are far lower.",
  },
  {
    q: "Who pays estate tax?",
    a: "The estate does, usually from estate assets before heirs are paid. The executor files the return and makes the payment.",
  },
  {
    q: "When is the estate tax return due?",
    a: "Form 706 is generally due nine months after the date of death. A six-month extension is available if you file for it.",
  },
  {
    q: "Does life insurance count toward the estate?",
    a: "Yes, if you owned the policy or had control over it at death. An irrevocable life insurance trust can keep the proceeds out of the estate.",
  },
  {
    q: "Do gifts count toward the estate tax?",
    a: "Gifts up to $19,000 per recipient in 2026 don't. Larger gifts use up part of your lifetime exemption and get counted in the calculation.",
  },
  {
    q: "Is estate tax the same as inheritance tax?",
    a: "No. The estate pays estate tax before distribution. Heirs pay inheritance tax, and only a few states have one.",
  },
  {
    q: "Do spouses pay estate tax on what they inherit?",
    a: "No. Assets passing to a U.S.-citizen spouse are fully deductible. If the spouse isn't a citizen, a special trust is generally required.",
  },
  {
    q: "Will it help you avoid estate tax or probate?",
    a: "Neither. A will directs who gets what, but assets still go through probate, and it doesn't reduce tax.",
  },
  {
    q: "Does a revocable living trust reduce estate tax?",
    a: "No. It can skip probate, but you still control the assets, so they stay in your taxable estate.",
  },
  {
    q: "Do heirs pay income tax on inherited property?",
    a: "Usually not on the inheritance itself. Property generally gets a step-up in basis, but retirement accounts are different. Withdrawals are usually taxable income to the heirs.",
  },
  {
    q: "Which states have their own estate tax?",
    a: "About a dozen states and Washington, D.C. Rules and thresholds vary and change, so check your state's revenue department.",
  },
  {
    q: "Should I hire an estate planning attorney?",
    a: "If your estimate is anywhere near the exemption, you own a business, or you live in a state with a low threshold, yes. Even for smaller estates, a will, power of attorney, and healthcare directive are worth getting done right.",
  },
];

const FAQ_SCHEMA_ITEMS = [
  {
    q: "How much is the federal estate tax exemption for 2026?",
    a: "It's $15 million per person. A married couple can potentially shield up to $30 million by using portability, which requires filing Form 706 after the first spouse dies.",
  },
  {
    q: "What is the federal estate tax rate?",
    a: "The top rate is 40%, charged on the value above the exemption. Since the exemption is so high, effectively everything that's taxed is taxed at 40%.",
  },
  {
    q: "How do I calculate estate tax?",
    a: "Add up the gross estate, subtract debts, expenses, and marital and charitable deductions, add lifetime taxable gifts, subtract the exemption, and multiply what's left by 40%.",
  },
  {
    q: "Do I owe estate tax if my estate is under $15 million?",
    a: "Not at the federal level. Your state could still tax it, and many state thresholds are far lower.",
  },
  {
    q: "Who pays estate tax?",
    a: "The estate does, usually from estate assets before heirs are paid. The executor files the return and makes the payment.",
  },
  {
    q: "When is the estate tax return due?",
    a: "Form 706 is generally due nine months after the date of death. A six-month extension is available if you file for it.",
  },
  {
    q: "Does life insurance count toward the estate?",
    a: "Yes, if you owned the policy or had control over it at death. An irrevocable life insurance trust can keep the proceeds out of the estate.",
  },
  {
    q: "Do gifts count toward the estate tax?",
    a: "Gifts up to $19,000 per recipient in 2026 don't. Larger gifts use up part of your lifetime exemption and get counted in the calculation.",
  },
  {
    q: "Is estate tax the same as inheritance tax?",
    a: "No. The estate pays estate tax before distribution. Heirs pay inheritance tax, and only a few states have one.",
  },
  {
    q: "Do spouses pay estate tax on what they inherit?",
    a: "No. Assets passing to a U.S.-citizen spouse are fully deductible. If the spouse isn't a citizen, a special trust is generally required.",
  },
  {
    q: "Does a will help you avoid estate tax or probate?",
    a: "Neither. A will directs who gets what, but assets still go through probate, and it doesn't reduce tax.",
  },
  {
    q: "Does a revocable living trust reduce estate tax?",
    a: "No. It can skip probate, but you still control the assets, so they stay in your taxable estate.",
  },
  {
    q: "Do heirs pay income tax on inherited property?",
    a: "Usually not on the inheritance itself. Property generally gets a step-up in basis, but retirement account withdrawals are usually taxable income to the heirs.",
  },
  {
    q: "Which states have their own estate tax?",
    a: "About a dozen states and Washington, D.C. Rules and thresholds vary and change, so check your state's revenue department.",
  },
  {
    q: "Should I hire an estate planning attorney?",
    a: "If your estimate is anywhere near the exemption, you own a business, or you live in a state with a low threshold, yes. Even for smaller estates, a will, power of attorney, and healthcare directive are worth getting done right.",
  },
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

export default function EstateTaxCalculatorFaqSection() {
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
        <p style={pStyle}>
          If you've ever wondered whether your family could end up owing tax when you die, this estate tax
          calculator on <Link to="/" className="inline-home-link">Tolz</Link> gives you a quick answer. Plug
          in what you own, what you owe, and any big gifts you've made over the years, and the tool applies
          the current federal exemption and tax rate to show a rough tax bill.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Most people who run the numbers find out they're nowhere near the limit. That's good news, but
          it's worth confirming rather than assuming. The people who do end up owing tend to be business
          owners, folks with lots of real estate, or families whose investments quietly grew for thirty
          years.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What This Estate Tax Calculator Does</h2>
        <p style={pStyle}>
          The calculator estimates federal estate tax, the tax the government charges on the total value of
          what someone leaves behind. Some people call it the "death tax," which isn't the official name but
          it's what you'll hear at the dinner table and on the news.
        </p>
        <p style={pStyle}>
          Here's what it does in plain terms. It takes your total assets, subtracts your debts and other
          deductible amounts, adds any large lifetime gifts, subtracts the federal exemption, and applies
          the tax rate to whatever is left. If the answer is zero, your estate is under the federal
          threshold. If it isn't, you'll see roughly how much tax is at stake.
        </p>
        <p style={pStyle}>
          One quick note on the word "estate." In this context it doesn't mean a big house on a piece of
          land. It just means everything a person owns, minus what they owe. A one-bedroom condo with a car
          and a savings account is an estate, and so is a ten-figure business empire.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This tool is built for U.S. taxpayers. It doesn't calculate state estate or inheritance taxes,
          which I'll cover below because they matter more than people expect.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Estate Tax Calculator</h2>
        <p style={pStyle}>
          You don't need appraisals or a stack of paperwork. Reasonable, current estimates work fine. If a
          number is a guess, round toward the higher side. It's better to be pleasantly surprised than
          caught short.
        </p>
        <p style={pStyle}>
          <strong>Assets.</strong> Add up everything you own or control: your home and other real estate,
          checking and savings, brokerage accounts, retirement accounts like 401(k)s and IRAs, business
          interests, vehicles, art, jewelry, collectibles, annuities, and life insurance. The insurance part
          trips people up. If you own the policy, or held any control over it when you died, the payout
          counts as part of your estate even though it goes straight to a beneficiary.
        </p>
        <p style={pStyle}>
          Also count things you may not think about, like a share of a vacation home you co-own, money
          people owe you, and the value of a partial stake in a family company. Small items count, too,
          though something with mostly sentimental value, like grandma's ring, usually doesn't move the
          needle on tax.
        </p>
        <p style={pStyle}>
          <strong>Liabilities.</strong> Enter mortgages, car loans, credit card balances, business debts,
          and anything else you owe. Add a realistic amount for funeral costs and estate administration
          expenses like legal and court fees. Those are deductible.
        </p>
        <p style={pStyle}>
          <strong>Lifetime gifts.</strong> Enter gifts you've made that went above the annual gift
          exclusion. Gifts to a spouse (if they're a U.S. citizen) or to charity generally don't count
          against you. More on this in the gifts section.
        </p>
        <p style={pStyle}>
          <strong>Spouse and charity.</strong> Money that passes to a surviving spouse, or to a qualified
          charity, is deductible. The tool works from assets, liabilities, and gifts, so if you want to see
          the taxable result after those transfers, subtract them from the totals before you enter them.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Then play with it. Change the value of a business, swap in a lower home price, or bump up a stock
          portfolio by 20% and see what happens. That kind of "what if" testing is where a calculator like
          this really earns its keep.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estate Tax Basics: What It Is and Who Actually Pays It</h2>
        <p style={pStyle}>
          The estate tax gets charged on the total value of your property at the time of death. It's the
          estate itself that owes, not the heirs, and the executor pays it out of estate funds before
          anything is distributed.
        </p>
        <p style={pStyle}>
          The important part is that the tax only applies above the exemption. If your estate is worth less
          than the threshold, there's generally no federal tax and no need to file an estate tax return. If
          it's worth more, only the portion over the threshold is taxed. Someone with a $16 million estate
          and a $15 million exemption is taxed on $1 million, not $16 million.
        </p>
        <p style={pStyle}>
          Also, assets that pass to a surviving spouse aren't taxed at all, thanks to the unlimited marital
          deduction. That's why so many couples don't see any federal estate tax at the first death. The tax
          question usually shows up later, when the surviving spouse's estate goes to the kids.
        </p>

        <h3 style={h3Style}>Why so few people end up paying</h3>
        <p style={pStyle}>
          Estate and gift taxes raise a small slice of federal revenue. The Congressional Budget Office has
          put the figure at roughly $30 billion a year, which is tiny next to the trillions of dollars of
          wealth that gets passed on. There are a few reasons for that. The exemption is high. The marital
          deduction defers a lot of tax. And people with big estates often use planning tools like trusts,
          gifting programs, and sales of assets to family members at valued-down prices to shrink what's
          left to tax. Some of those strategies are perfectly normal and legal, and others require careful
          handling, which is why you want a professional involved.
        </p>

        <h3 style={h3Style}>A quick history note</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Taxing inheritances isn't a new idea. It goes back to ancient Rome, and modern versions grew out
          of arrangements in medieval Europe, where heirs paid the ruling lord a fee to take over land. The
          stated purposes today are raising revenue and keeping wealth from piling up in the same families
          forever. Whether that's fair depends on who you ask, and it's a hot political topic, but that's
          beyond what a calculator can settle.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estate Tax vs. Inheritance Tax</h2>
        <p style={pStyle}>
          People mix these up all the time. The difference comes down to who pays.
        </p>
        <p style={pStyle}>
          An estate tax is charged on the estate as a whole, before heirs get anything. The estate pays. The
          federal government has one of these.
        </p>
        <p style={pStyle}>
          An inheritance tax is charged on the person who receives the property. The federal government
          doesn't have one, but a handful of states do. In these states, the rate depends on who you are
          relative to the person who died and how much you receive. Spouses are exempt everywhere, children
          usually pay little or nothing, and more distant relatives and unrelated heirs typically pay more.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's possible to live in a state that has both, which means an estate could owe a state estate tax
          and heirs could owe state inheritance tax on top of it. Maryland is the best-known example of
          that.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>2026 Federal Estate Tax Exemption and Rate</h2>
        <p style={pStyle}>
          For 2026, the federal estate tax exemption is $15 million per person, and the top rate is 40%.
          Those figures come from the IRS's annual inflation adjustments (Rev. Proc. 2025-32).
        </p>
        <p style={pStyle}>
          For years, the big worry was that the exemption would be cut roughly in half at the end of 2025.
          Legislation passed in 2025 prevented that. The higher exemption is now permanent, and it gets
          adjusted for inflation every year. That said, tax laws can always be changed by a future Congress,
          so it's smart to re-check every January.
        </p>
        <p style={pStyle}>
          The statutory rate schedule technically starts lower and climbs up to 40%. But since the
          exemption is so large, the lower brackets are effectively wiped out by the credit, and every
          taxable dollar ends up taxed at 40%. That's why the calculator uses a flat 40% on the amount above
          the exemption.
        </p>

        <h3 style={h3Style}>Portability: how couples can double up</h3>
        <p style={pStyle}>
          If one spouse dies without using all of their exemption, the leftover can be transferred to the
          surviving spouse. This is called portability, and it can let a couple shield up to $30 million
          together.
        </p>
        <p style={pStyle}>
          Here's an example. Say each spouse has a $15 million exemption. The first spouse dies and uses $6
          million of it, leaving the rest to the surviving spouse tax free through the marital deduction.
          The survivor can now shield their own $15 million plus the $9 million that was left over, for a
          total of $24 million.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The catch is that portability isn't automatic. The executor has to file a federal estate tax
          return (Form 706) and elect it, even if there's no tax due. Skipping that filing is one of the
          most expensive paperwork mistakes people make. For estates that aren't otherwise required to
          file, the IRS has allowed a late portability election up to five years after death, but don't
          count on that as a plan.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Estate Value Is Determined</h2>
        <p style={pStyle}>
          The IRS doesn't care what you paid for something or what it was worth when you got it. It uses
          fair market value, meaning the price a willing buyer and a willing seller would agree on when
          neither is under pressure. The total of everything is called the gross estate.
        </p>
        <p style={pStyle}>
          Some assets are simple. A brokerage account has a clear number on the date of death. Others take
          work. Real estate usually needs an appraisal, and a privately held business or partial ownership
          interest may need a professional valuation, which can be the most argued-over number on the whole
          return.
        </p>
        <p style={pStyle}>
          Executors also have a useful option. If it lowers both the gross estate and the estate tax, they
          can choose an alternate valuation date, six months after death, instead of the date of death. It
          only helps when asset values have dropped, which is why it's sometimes used after market
          declines.
        </p>

        <h3 style={h3Style}>What's included that people forget</h3>
        <ul style={ulStyle}>
          <li>Life insurance you own or control</li>
          <li>Retirement accounts (though the heirs will also owe income tax when they withdraw)</li>
          <li>Revocable trust assets, since you still control them</li>
          <li>Jointly owned property, at least a portion of it</li>
          <li>Certain gifts you made where you kept an interest, like living in a house you "gave" away</li>
        </ul>

        <h3 style={h3Style}>What you can subtract</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          After you've totaled the gross estate, you can subtract mortgages and debts, funeral costs, estate
          administration expenses, transfers to a surviving spouse, and gifts to qualified charities. State
          estate taxes paid are deductible too. What's left is the taxable estate.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How Federal Estate Tax Is Calculated</h2>
        <p style={pStyle}>Here's the sequence the calculator follows.</p>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 6 }}>
            <strong>Gross estate.</strong> Total fair market value of everything you own or control at
            death.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Deductions.</strong> Subtract debts, funeral and administration costs, the marital
            deduction, and charitable gifts. That gives you the taxable estate.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Add adjusted taxable gifts.</strong> Lifetime gifts made after 1976 that went over the
            annual exclusion get added back, because they already used part of your exemption.
          </li>
          <li style={{ marginBottom: 6 }}>
            <strong>Subtract the exemption.</strong> For 2026, that's $15 million.
          </li>
          <li>
            <strong>Apply the rate.</strong> 40% of what's left is the estimated tax.
          </li>
        </ul>

        <h3 style={h3Style}>Example 1: single person over the limit</h3>
        <p style={pStyle}>
          Someone passes away with a $20 million gross estate, $1 million in debts and expenses, and a
          $500,000 bequest to charity. The taxable estate is $18.5 million. They also made $1 million in
          taxable gifts earlier in life, bringing the total to $19.5 million. Subtract the $15 million
          exemption and you get $4.5 million, and 40% of that is $1.8 million.
        </p>
        <p style={pStyle}>
          Each extra $1 million in value adds $400,000 to the bill, which is why accurate numbers matter
          near the threshold.
        </p>

        <h3 style={h3Style}>Example 2: married couple</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          A couple owns $22 million together. The first spouse dies and leaves everything to the survivor,
          so no tax is due thanks to the marital deduction. If the executor files Form 706 and elects
          portability, the survivor can shield up to $30 million, and the couple's $22 million is fully
          covered. If nobody files, only the survivor's own $15 million exemption applies, which leaves $7
          million exposed to tax. At 40%, that's $2.8 million, all from a missed form.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Projecting Your Estate Over the Next Ten Years</h2>
        <p style={pStyle}>
          One of the more useful things you can do is not just run today's number, but try future ones.
          Your estate probably won't stay the same size.
        </p>
        <p style={pStyle}>
          Try this. Say your estate is $12 million today and you expect a 5% average annual growth from
          investments and real estate. In ten years, it'd be roughly $19.5 million. If the exemption were
          frozen at $15 million, that would put you over by about $4.5 million. In reality, the exemption
          rises with inflation, so the gap would be smaller, but it wouldn't disappear.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          To do this in the calculator, work out a projected value for your assets, then enter it in place
          of today's figure. A quick approach for a rough doubling time is the rule of 72: divide 72 by your
          expected growth rate. At 6%, money roughly doubles in 12 years. Growth rates are never that
          smooth, so try a low, medium, and high case and see how far apart the results land.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Lifetime Gifts and Your Exemption</h2>
        <p style={pStyle}>
          The estate tax and gift tax share one lifetime exemption. That means anything you give away over
          the yearly limit reduces how much exemption is left at death.
        </p>
        <p style={pStyle}>
          The annual gift exclusion for 2026 is $19,000 per recipient. You can give that much to as many
          people as you like without any paperwork and without touching your exemption. Married couples can
          combine their gifts to give $38,000 per recipient. Some payments are also unlimited and don't
          count as gifts at all if you pay them straight to the provider, such as tuition paid directly to a
          school or medical bills paid directly to a hospital.
        </p>
        <p style={pStyle}>
          Gifts to your spouse (if they're a U.S. citizen) and gifts to qualified charities also don't count
          against you.
        </p>
        <p style={pStyle}>
          If you give more than the annual exclusion, you file a gift tax return (Form 709). You typically
          don't owe any tax at that point. You're just tracking how much of your lifetime exemption you've
          used. If you gave $2 million in taxable gifts, you'd have about $13 million left at death.
        </p>
        <p style={pStyle}>
          The rules are designed this way to stop wealthy people from giving everything away right before
          they die. The IRS has also confirmed that if the exemption is lowered in the future, people who
          used the higher exemption through gifts won't have that taken back.
        </p>

        <h3 style={h3Style}>Gifting and taxes on the receiving end</h3>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Gifts and inheritances get very different treatment when the recipient later sells. Property
          received as an inheritance gets a step-up in basis: the tax basis resets to its value on the date
          of death, so much of the built-up gain is erased for income tax purposes. Property received as a
          gift generally keeps the giver's original basis. So gifting a highly appreciated asset can save
          estate tax but create a big capital gains bill for your kids. It's a real trade-off, and it's one
          reason estate planning isn't just about minimizing estate tax.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>When You'd Actually Need an Estate Tax Calculator</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 10 }}>
            <strong>You own a business or family farm.</strong> These are often worth more than owners
            realize and are hard to divide or sell. Knowing the potential tax helps you decide whether to
            sell, gift shares, or set up a succession plan. There are also tools for spreading payments out
            over time for closely held businesses, so it's worth asking about them.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>You're retired with a mix of assets.</strong> Home, retirement accounts, savings, and
            insurance can total more than you'd think. Many people have never added it all up in one place.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>You've just lost a spouse.</strong> If you inherited a large estate, and maybe your late
            spouse's unused exemption, you'll want to know how much protection you have now.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>You're an executor.</strong> The estate tax return is generally due nine months after
            death, with a six-month extension available. An estimate helps you decide whether you're
            required to file and how much cash the estate may need to raise.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>You're not a U.S. citizen or you're married to a non-citizen.</strong> Non-U.S. citizens
            who aren't domiciled in the U.S. have a much smaller exemption for U.S.-based assets, and the
            unlimited marital deduction generally doesn't apply to a non-citizen spouse unless the assets go
            into a special trust called a QDOT. If this is you, use the result only as a rough guide and
            talk to a professional.
          </li>
          <li>
            <strong>You're about to meet with an attorney.</strong> Showing up with rough numbers makes the
            meeting more productive, and probably cheaper.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>State Estate and Inheritance Taxes</h2>
        <p style={pStyle}>
          The federal number is only part of the story, and for a lot of families it's the smaller part.
          About a dozen states plus Washington, D.C. have their own estate tax, and a few states have an
          inheritance tax.
        </p>
        <p style={pStyle}>
          State exemptions can be much lower than the federal one. Depending on the state, the threshold
          might be anywhere from about $1 million to several million dollars, so an estate can owe zero
          federal tax and still owe state tax. Some states have a "cliff" that makes things worse: if your
          estate is even a little over the state's threshold, the entire estate can be taxed, not just the
          excess.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          State rules change often, so check your state's revenue department for current thresholds. Also
          remember that owning real estate in another state can trigger that state's tax, even if you don't
          live there.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Estate Planning Basics</h2>
        <p style={pStyle}>
          An estate tax estimate is just one piece. A full plan covers more, and it's not only for wealthy
          people or those nearing retirement. The bigger the estate, the more a good plan can save, but even
          modest estates benefit.
        </p>

        <h3 style={h3Style}>Start with an inventory</h3>
        <p style={pStyle}>
          List everything you own, including the small stuff. Something with low market value, like a piece
          of jewelry or a painting, can matter a lot to your family. Write down account numbers, locations
          of documents, and login info for online accounts, or at least where your executor can find them.
        </p>

        <h3 style={h3Style}>Get the key documents in place</h3>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>A will.</strong> It says who gets what and names your executor. It doesn't avoid
            probate, though. Everything in a will still goes through the state probate process, which
            involves court fees, legal fees, and executor fees, and can take months or more.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Power of attorney.</strong> This lets someone you trust handle your finances if you
            can't.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>A living will and health care proxy.</strong> These say what medical care you want and
            who can make medical decisions when you can't speak for yourself.
          </li>
          <li>
            <strong>Beneficiary designations.</strong> Retirement accounts and life insurance go to whoever
            is named on the form, regardless of what your will says. Check these regularly, especially
            after a marriage, divorce, or birth.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Why It Matters for People With Smaller Estates</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Guardianship.</strong> If you have young children, a will is how you name who would
            raise them. If you don't, a court decides.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Managing a minor's money.</strong> Without a plan, a court sets up its own arrangement,
            which can be costly and may not be what you'd have chosen.
          </li>
          <li>
            <strong>Naming a decision-maker.</strong> Someone has to pay debts, manage accounts, and deal
            with the paperwork. A will lets you choose that person.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          A lawyer who knows your state's rules is worth the cost here, since federal and state law both
          come into play.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Trusts and Estate Tax</h2>
        <p style={pStyle}>
          A trust is a legal arrangement where a trustee holds and distributes assets according to rules you
          set. Trusts can control when and how heirs get money, protect assets from creditors in some
          cases, and, depending on the type, cut estate tax.
        </p>
        <p style={pStyle}>
          Living trusts (also called inter vivos trusts) are set up while you're alive. Testamentary trusts
          are created through a will and only take effect after death. The big practical difference is
          probate. Assets properly placed in a living trust don't go through probate, while a testamentary
          trust can't avoid it.
        </p>
        <p style={pStyle}>
          Revocable vs. irrevocable. A revocable trust can be changed or canceled anytime, which gives you
          flexibility and control. But because you keep control, the assets are still counted in your
          estate, so it doesn't reduce estate tax. It mostly helps you skip probate and plan for incapacity.
          It also takes real effort to set up and fund, since you have to retitle accounts and property into
          the trust's name, and legal fees upfront can be high.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          An irrevocable trust is different. You give up control, which is exactly why the assets can be
          removed from your taxable estate. Common examples are irrevocable life insurance trusts, which
          keep insurance payouts out of your estate, and other trusts built to hold assets you expect to
          grow.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Other Ways to Reduce a Taxable Estate</h2>
        <ul style={ulStyle}>
          <li style={{ marginBottom: 8 }}>
            <strong>Annual gifting.</strong> Use the $19,000-per-person exclusion every year. It's simple
            and doesn't use any exemption.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Charitable giving.</strong> Bequests and charitable trusts reduce the taxable estate.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Marital planning.</strong> The marital deduction and portability can defer or eliminate
            tax at the first death.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Paying for tuition and medical costs directly.</strong> These don't count as gifts.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Valuation and business planning.</strong> Family partnerships and other structures can
            affect how interests are valued.
          </li>
          <li>
            <strong>Irrevocable trusts.</strong> As above, these move assets out of your estate.
          </li>
        </ul>
        <p style={{ ...pStyle, marginTop: 10, marginBottom: 0 }}>
          Every one of these has legal requirements and trade-offs. Tax avoidance through planning is
          legal, but tax evasion is a crime with serious penalties. A qualified estate planning attorney can
          tell the difference and design something that will hold up if the IRS ever takes a look.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Common Mistakes People Make</h2>
        <ul style={{ ...ulStyle, marginBottom: 0 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Forgetting life insurance.</strong> It's often the item that pushes a "safe" estate over
            the line.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Skipping the portability filing.</strong> As shown earlier, that can cost millions.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Ignoring state taxes.</strong> Many families plan around the federal number and get
            blindsided by a state bill.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Using outdated numbers.</strong> Exemptions change with inflation and law changes.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Confusing a will with a full plan.</strong> A will doesn't skip probate or reduce tax.
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Gifting appreciated assets without thinking about the basis.</strong> You could save
            estate tax and create a capital gains problem.
          </li>
          <li>
            <strong>Not updating beneficiaries.</strong> An ex-spouse can still get your retirement account
            if nobody changes the form.
          </li>
        </ul>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Accuracy, Privacy, and Cost</h2>
        <p style={pStyle}>
          The calculator applies the current federal rules: the $15 million exemption, the 40% rate, and
          the handling of deductions and lifetime gifts described above. It's an estimator, though. Complex
          situations like trusts, closely held businesses, generation-skipping transfers, foreign assets,
          and unusual valuation questions can change the outcome, so use the result to plan and to prepare
          for talking with a tax professional, not to file a return.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It's free to use, and you can run it as many times as you want. You don't need to sign up or
          create an account. The numbers you type are used to generate your estimate on the page. You don't
          need to enter names, Social Security numbers, or account details, so please don't.
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
