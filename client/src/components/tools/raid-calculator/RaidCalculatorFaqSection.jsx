import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "How many drives do I need for RAID 5?",
    a: "At least three. One drive can fail without losing any data, because the data and the parity are spread across all the drives. Adding more drives raises the usable share of the capacity, but RAID 5 still survives only one drive failure at a time.",
  },
  {
    q: "How much speed do I gain from RAID 0?",
    a: "RAID 0 splits data across all its disks so they are read and written at the same time: in theory n disks give up to n times the read and write speed of one disk. The real gain depends on the drives, the controller and how much of the work is disk access.",
  },
  {
    q: "How do I test the speed of my RAID?",
    a: "Run a disk benchmarking tool such as CrystalDiskMark or ATTO Disk Benchmark, measure the read and write speeds, and compare them with the typical speeds for your RAID level and drives.",
  },
  {
    q: "How does a redundant array of independent disks work?",
    a: "RAID combines several drives into one logical drive and spreads the data across them, for speed (striping), safety (mirroring or parity) or both. The RAID level decides how the data is laid out.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const COMPARE = [
  ["RAID 0", "2", "n × d", "n", "n", "0"],
  ["RAID 1", "2", "d", "n", "1", "n − 1"],
  ["RAID 1E", "3", "n × d / 2", "(n + 1) / 2", "(n + 1) / 2", "1"],
  ["RAID 10", "4 (even)", "n × d / 2", "n", "n / 2", "2*"],
  ["RAID 5", "3", "(n − 1) × d", "n − 1", "1", "1"],
  ["RAID 50", "6", "(n − s) × d", "n − s", "1", "up to s"],
  ["RAID 5E", "4", "(n − 2) × d", "n − 1", "1", "1"],
  ["RAID 5EE", "4", "(n − 2) × d", "n − 2", "1", "1"],
  ["RAID 6", "4", "(n − 2) × d", "n − 2", "1", "2"],
  ["RAID 60", "8", "(n/s − 2) × s × d", "(n/s − 2) × s", "1", "up to 2s"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const listStyle = { ...pStyle, paddingLeft: 20, margin: "0 0 10px", listStyleType: "disc" };
const olStyle = { ...listStyle, listStyleType: "decimal" };
const cardStyle = { padding: "20px 20px" };
const tableStyle = { borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%" };
const center = { textAlign: "center" };
const mono = { fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" };
const link = (to, text) => <Link to={to} style={{ color: "var(--accent)" }}>{text}</Link>;

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

export default function RaidCalculatorFaqSection() {
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
        <h2 style={h2Style}>RAID Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The {link("/", "Tolz")} RAID calculator takes the guesswork out of choosing a RAID level (RAID: Redundant Array of Inexpensive, or
          Independent, Disks). It compares the common configurations (RAID 0, 1, 1E, 10, 5, 50, 5E, 5EE, 6 and 60) by storage size,
          performance, fault tolerance and cost, so you can make an informed choice for your next array.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is a RAID Array?</h2>
        <p style={pStyle}>
          Early mainframes used large, expensive and very reliable hard disks, but when one failed, its data was gone (unless there was a backup)
          and the costly disk had to be replaced. Cheaper drives came along that failed far more often. The solution: use many disks together,
          acting as one.
        </p>
        <p style={pStyle}>
          RAID builds a single logical disk (one disk as far as the computer can tell) out of several cheap drives. The drives can be arranged
          for high performance (e.g. video editing), high reliability, low cost or something in between. These arrangements are the
          &quot;RAID levels&quot;.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Whatever level you choose, you still need a backup: on tape, an online remote backup or a second RAID array. Keep at least one full
          copy of the data somewhere else, ideally two. RAID decides how data is spread over the disks, not who can open the files; on Unix or
          Linux, the {link("/calculators/tech-electronics/chmod-calculator", "chmod calculator")} helps with file permissions.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 0: Striping</h2>
        <p style={pStyle}>
          RAID 0 is all about performance. Data is split into blocks written alternately to each disk (striping): with two disks, odd blocks go
          to disk 0 and even blocks to disk 1. Both disks are read and written at once, so performance doubles, and three disks give three times
          the read and write speed, up to the number of disks your controller supports. Faster storage doesn&apos;t make a whole application
          equally faster, though, if storage is only part of its running time.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The catch: if even one disk fails, all the data is lost. RAID 0 suits work that needs maximum speed (e.g. gaming) when the data also
          lives somewhere safer.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 1: Mirroring</h2>
        <p style={pStyle}>
          RAID 1 is about fault tolerance. Every drive holds the same data, so if one fails the other still has everything. Writing is no faster
          than one disk, since the same data goes to both. Reading can in theory reach the sum of both disks&apos; speeds, but in practice it is
          usually well below that, depending on the RAID hardware and software.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          More mirrored disks raise the cost per usable terabyte sharply: with three, two disks can fail without data loss, but you can only use
          a third of the total capacity. Other levels give excellent reliability for less.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 5: Parity</h2>
        <p style={pStyle}>
          RAID 5 stripes data like RAID 0, but adds a parity block to each stripe, effectively one extra disk&apos;s worth, so the minimum is
          2 + 1 = 3 drives. The parity is chosen so that all the data blocks and the parity block XOR to zero. If a disk fails, its blocks are
          recomputed from the others in a process called rebuilding.
        </p>
        <p style={pStyle}>
          Rebuilding reads all the remaining data, recalculates the lost blocks and writes them back. It takes a lot of time and processing
          power, which scales badly with today&apos;s huge drives (hours or even days), and a second failure during the rebuild loses everything.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          The maximum read speed is the number of disks minus one; writes get no similar gain, because the controller writes each block to one
          disk at a time and computes the parity for every stripe.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 6: Double Parity</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          RAID 6 adds a second parity block, so two disks can fail without data loss. If a disk fails and another follows during the rebuild,
          nothing is lost: twice the fault tolerance of RAID 5.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 1E: Striping and Mirroring</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          RAID 1E stripes the data and mirrors each strip onto the next disk, with at least three disks. One disk can fail without losing data
          (cover any disk in the diagram and you can still read every block). Only 50% of the raw space is usable. It&apos;s a good choice for an
          odd number of disks; with an even number, RAID 10 tolerates more failures.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 10, 50 and 60: Nested RAID Levels</h2>
        <p style={pStyle}>
          These combine RAID 1, 5 or 6 with striping (RAID 0) on top. <strong>RAID 10</strong> (1+0) is two or more mirrored pairs striped
          together. It allows two disk failures, one per mirrored set, needs an even number of disks (at least 4) and always uses 50% of the
          capacity. The maximum read gain equals the number of drives and the write gain half of it, since each block is written twice.
        </p>
        <p style={pStyle}>
          <strong>RAID 50</strong> stripes several RAID 5 sub-arrays. One disk per sub-array can fail, and capacity utilization starts at 67%.
          Writes are no faster than one drive, but reads can reach the number of disks minus the number of sub-arrays.
        </p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          <strong>RAID 60</strong> stripes several RAID 6 sub-arrays, so two disks per sub-array can fail. Utilization starts at 50%, and reads are
          slower than RAID 50 because each sub-array gives two drives to parity.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID 5E and 5EE</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Both extend RAID 5 with a hot spare, so they need at least 4 disks. RAID 5E keeps the spare space at the end of each drive, while RAID
          5EE spreads it through the array. When a drive fails, the array rebuilds onto the spare space right away, without waiting for someone
          to swap the failed drive.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>RAID Levels Compared</h2>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          The formulas the calculator uses, for n disks of size d (and s sub-arrays for RAID 50 and 60). Unavailable capacity is n × d minus
          the usable capacity, and speed gains are relative to one disk:
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Level</th><th>Min. disks</th><th>Usable capacity</th><th>Read gain</th><th>Write gain</th><th>Fault tolerance</th></tr></thead>
            <tbody>{COMPARE.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={i === 0 ? { fontWeight: 600, whiteSpace: "nowrap" } : center}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          * RAID 10 nominally survives two failed disks, but only one per mirrored pair: two failures in the same pair lose data.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Which RAID Level Should I Choose?</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          It depends on the application. For pure performance, RAID 0 is the answer, and with just two disks it is also the cheapest; just
          expect to lose everything when a drive fails. For good fault tolerance with fast rebuilds, RAID 10 is a strong choice, though only 50%
          of the capacity is usable. Every level has pros and cons, so try a few configurations in the calculator.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the RAID Calculator</h2>
        <ol style={olStyle}>
          <li>Select the RAID level.</li>
          <li>Enter the size of one disk. All disks are assumed to be the same size; with mixed sizes, enter the smallest.</li>
          <li>Enter the number of disks (and, for RAID 50 or 60, the number of sub-arrays). The messages tell you if a level needs more disks or an even number of them.</li>
          <li>Read the capacity statistics: the usable capacity, the unavailable capacity and the capacity utilization.</li>
          <li>See the maximum read and write speed gains relative to one disk (approximate theoretical figures, useful for comparing levels) and the fault tolerance.</li>
          <li>Optionally enter the cost of one disk for the cost per usable terabyte and the total disk cost (disks only, not RAID controller hardware).</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Know how much space you need? Enter the usable capacity under <em>Know the usable capacity you need?</em> and leave the disk size blank
          to find how big each disk must be.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Worked Example: RAID 6 vs RAID 10</h2>
        <p style={pStyle}>
          A RAID 6 array of 5 disks, 1 TB each, uses two disks&apos; worth of parity, so 3 TB is usable and 2 TB unavailable. The capacity
          utilization is:
        </p>
        <p style={{ ...pStyle, ...mono }}>capacity utilization = usable capacity / total capacity × 100 = 3 / 5 × 100 = 60%</p>
        <p style={pStyle}>
          Three drives can be read at once, so the maximum read speed gain is 3x (in general, read gain = number of disks − 2 for RAID 6). Up to
          two disks can fail, however many drives there are. At $50 per disk, the total cost is 5 × $50 = $250 and:
        </p>
        <p style={{ ...pStyle, ...mono }}>cost per usable TB = total cost / usable capacity = $250 / 3 TB = 83.33 $/TB</p>
        <p style={pStyle}>
          For the same 3 TB with RAID 10 (always 50% utilization), you need 6 × 1 TB disks. All of them can be read at once (6x read gain) and
          half written at once (3x write gain), much better than RAID 6&apos;s writes. Fault tolerance is nominally two drives, but only one per
          half of the array, so it isn&apos;t quite as good as RAID 6. And it costs more:
        </p>
        <p style={{ ...pStyle, ...mono }}>cost per usable TB = (6 × $50) / 3 TB = 100 $/TB</p>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          So RAID 6 is much slower at writing but more fault tolerant and slightly cheaper per terabyte. Which matters more depends on how much
          time your workload spends reading versus writing. More tools are in the{" "}
          {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
