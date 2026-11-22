import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "How do I calculate RAID capacity?", a: "Multiply the number of disks by disk size, then subtract redundancy overhead: none for RAID 0, one disk for RAID 5, two for RAID 6, half the total for RAID 10 and RAID 1E, and all but one disk for RAID 1. The RAID calculator does this for whichever level you select." },
  { q: "What is the difference between RAID 5 and RAID 6?", a: "RAID 5 uses single parity and survives one disk failure. RAID 6 uses double parity, loses one more disk of capacity, and survives two failures. RAID 6 is safer with large drives." },
  { q: "Is RAID 10 better than RAID 5?", a: "For write speed and rebuild time, yes. RAID 5 offers more usable space from the same disks, so the better choice depends on whether you value performance or capacity." },
  { q: "Why is RAID 10 better than RAID 01?", a: "In RAID 10, a failed disk affects only its mirrored pair. In RAID 01, one failure takes down an entire stripe set, which leaves less protection and a bigger rebuild." },
  { q: "Which RAID level is fastest?", a: "RAID 0 has the highest theoretical speed but no protection. RAID 10 is the fastest option that still survives a failure." },
  { q: "Which RAID level has the most redundancy?", a: "A multi-disk RAID 1 mirror can survive all but one disk failing, but it wastes the most space. RAID 6 and RAID 60 offer strong redundancy with better efficiency." },
  { q: "How many disks do I need for each RAID level?", a: "RAID 0 and 1 need two, RAID 1E and RAID 5 need three, RAID 10, 5E, 5EE and RAID 6 need four, RAID 50 needs six, and RAID 60 needs eight." },
  { q: "Can I mix different-sized drives in a RAID array?", a: "Yes, but every drive is treated as the smallest one, so the extra space is wasted. Does RAID 1 require identical drives? Not strictly, but the mirror is limited to the smaller drive." },
  { q: "Can I mix HDDs and SSDs in one array?", a: "Sometimes, but the array typically runs at the speed of the slowest drive. It is best to keep one drive type per array." },
  { q: "Can Windows be installed on a RAID array?", a: "Usually yes on a hardware RAID volume, though you may need to load the controller driver during setup. Creating an array on a drive with Windows already installed normally erases it." },
  { q: "What happens when a drive in a RAID array fails?", a: "Except in RAID 0, the array keeps running in a degraded state while you replace the failed drive and let it rebuild. In RAID 0, the data is lost." },
  { q: "Does RAID replace backups?", a: "No. RAID keeps a system running through a drive failure but cannot recover deleted files, overwritten data or anything lost to malware or disaster." },
  { q: "Why is my usable space lower than the calculator shows?", a: "Operating systems often report capacity in TiB instead of TB, and formatting uses a small amount of space. Both reduce the visible figure without any real loss." },
  { q: "What is the cost per TB in a RAID calculator?", a: "It is the total price of all disks divided by usable capacity. It shows what each usable terabyte costs after redundancy overhead." },
  { q: "Is this RAID calculator free?", a: "Yes. It is free, and it does not ask you to upload any files." },
];

// The supplied FAQ schema matches the list above except that one question is
// worded "What is cost per TB in a RAID calculator?".
const SCHEMA_QUESTION_OVERRIDES = {
  "What is the cost per TB in a RAID calculator?": "What is cost per TB in a RAID calculator?",
};

const MIN_HEADERS = ["RAID level", "Minimum disks"];
const MIN_ROWS = [
  ["RAID 0, RAID 1", "2"], ["RAID 1E, RAID 5", "3"], ["RAID 10, 5E, 5EE, 6", "4"], ["RAID 50", "6"], ["RAID 60", "8"],
];

const EXAMPLE_HEADERS = ["", "RAID 5", "RAID 6", "RAID 10"];
const EXAMPLE_ROWS = [
  ["Usable capacity", "20 TB", "16 TB", "12 TB"],
  ["Capacity utilization", "83.3%", "66.7%", "50%"],
  ["Max read gain", "5x", "4x", "6x"],
  ["Max write gain", "~1x", "~1x", "3x"],
  ["Fault tolerance", "1 disk", "2 disks", "1 guaranteed"],
  ["Cost per usable TB", "$30.00", "$37.50", "$50.00"],
];

const h2Style = {
  fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 17,
  color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 10,
};
const h3Style = { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14.5, color: "var(--text-primary)", margin: "16px 0 6px" };
const pStyle = { fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.7, marginBottom: 10 };
const ulStyle = { ...pStyle, paddingLeft: 18 };
const liStyle = { marginBottom: 8 };
const cardStyle = { padding: "20px 20px" };

// Small layout helpers: every card drops the top margin of its first heading
// and the bottom margin of its last block.
const Card = ({ title, children }) => (
  <div className="card" style={cardStyle}>
    {title && <h2 style={h2Style}>{title}</h2>}
    <div className="faq-card-body">{children}</div>
  </div>
);
const P = ({ children }) => <p style={pStyle}>{children}</p>;
const Lead = ({ lead, children }) => <p style={pStyle}><strong>{lead}</strong> {children}</p>;
const H3 = ({ children }) => <h3 style={h3Style}>{children}</h3>;
const List = ({ items, ordered = false }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag style={ulStyle}>
      {items.map(([lead, text], i) => (
        <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
      ))}
    </Tag>
  );
};

function DataTable({ headers, rows, rowHeads = false }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 300 }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{rowHeads && j === 0 ? <strong>{cell}</strong> : cell}</td>)}</tr>
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

export default function RaidCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: SCHEMA_QUESTION_OVERRIDES[item.q] ?? item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is a RAID Array and What Is It Used For?">
        <P>
          RAID stands for Redundant Array of Independent Disks. Older sources say “Inexpensive” instead of “Independent,” and both appear in print.
          A RAID array combines several physical drives so the computer sees them as one logical disk. (The phrase “RAID array” is technically
          redundant, since the “A” already means array, but everyone says it, so this page does too.)
        </P>
        <P>
          The idea started when large, expensive drives were the norm and cheaper drives were less reliable. Engineers found they could link many
          cheap drives together and get better speed, better protection, or both. Today RAID is used to:
        </P>
        <List items={[
          ["", "Keep a system running when a drive fails"],
          ["", "Speed up reads and writes by spreading work across several drives"],
          ["", "Present several smaller drives as one large volume"],
        ]} />
        <P>RAID levels are built from three techniques:</P>
        <List items={[
          ["Striping", "splits data across drives so they work in parallel."],
          ["Mirroring", "writes identical copies to more than one drive."],
          ["Parity", "stores calculated recovery data, so a failed drive’s contents can be rebuilt from the survivors."],
        ]} />
        <P>
          Every level mixes these differently, and every mix trades capacity, speed or safety for something else. A RAID calculator makes those
          trade-offs visible before you buy drives.
        </P>
        <H3>Standard RAID vs. Nested RAID</H3>
        <P>
          Standard levels (RAID 0, 1, 5 and 6) use one technique. Nested levels combine two. RAID 10 stripes across mirrored pairs, RAID 50 stripes
          across RAID 5 groups, and RAID 60 stripes across RAID 6 groups. Nested levels need more drives, but they handle bigger arrays with better
          speed and protection.
        </P>
        <H3>Mirror vs. Parity: What’s the Difference?</H3>
        <P>
          A mirror keeps a full second copy of the data, so recovery is simple, but you pay with 50% of your raw space (or more, with extra
          mirrors). Parity stores a compact piece of calculated data that can rebuild a missing block. It costs one or two drives of capacity no
          matter how large the array is, so it is far more space-efficient. The catch is that parity writes require extra math, and rebuilds take
          longer.
        </P>
      </Card>

      <Card title="Is RAID Only for Servers, or Is It Worth It at Home?">
        <P>
          RAID started in data centers, but home and small-office users now run it often, usually in a NAS or a desktop with several drives. It is
          worth considering at home when:
        </P>
        <List items={[
          ["", "You want to keep working when a drive dies instead of waiting on a restore"],
          ["", "You store a large media library, photo archive or video projects"],
          ["", "You want one big volume instead of several separate drives"],
        ]} />
        <P>
          Some experienced users advise against RAID in a basic home NAS. Their reasons are fair. RAID adds cost and complexity, and it gives some
          people false confidence. It does not protect against deleted files, malware, power surges or theft. A single external backup drive is
          often a better first purchase than a second internal disk. If your main fear is data loss, build backups first. Add RAID if uptime and
          capacity matter too. The calculator helps with that decision, because it shows how much usable space and money each level costs.
        </P>
      </Card>

      <Card title="How to Use This RAID Calculator">
        <List ordered items={[
          ["Choose a RAID level.", "Pick from RAID 0, 1, 1E, 10, 5, 50 (5+0), 5E, 5EE, 6 or 60."],
          ["Enter the single disk size.", "Pick your unit from MB, GB, TB, MiB, GiB or TiB."],
          ["Enter the number of disks.", ""],
          ["Add disk cost (optional).", "Enter the price of one disk and choose a currency. This gives you cost per usable TB and total disk cost."],
          ["Click Calculate.", "Use Clear to start over."],
        ]} />
        <P>
          The calculator assumes every disk is the same size. If your disks differ, enter the smallest one, because an array treats every member as
          if it matches the smallest.
        </P>
        <H3>What the Results Mean</H3>
        <List items={[
          ["Usable capacity:", "the space you can actually store data in, shown in several units."],
          ["Unavailable capacity:", "the space used for mirroring or parity."],
          ["Capacity utilization:", "usable capacity as a percentage of raw capacity."],
          ["Read speed gain (max) and write speed gain (max):", "theoretical multipliers compared with a single disk."],
          ["Fault tolerance:", "how many disks can fail without data loss."],
          ["Cost per usable TB and total disk cost:", "what your disks cost, and what each usable terabyte costs after redundancy overhead."],
        ]} />
        <P>The cost figures count disks only. They do not include a RAID controller, NAS enclosure or other hardware.</P>
      </Card>

      <Card title="RAID Levels Explained: Capacity, Speed and Fault Tolerance">
        <P>Below, n is the number of disks.</P>
        <Lead lead="RAID 0 (striping).">
          Usable capacity is the full n × disk size. Reads and writes both scale to about n times a single disk. There is no redundancy, so one
          failed disk loses everything. It suits scratch space and temporary caches, never the only copy of important data.
        </Lead>
        <Lead lead="RAID 1 (mirroring).">
          Capacity equals one disk. Writes run at about single-disk speed. In theory reads can scale with the number of disks, but real-world gains
          depend heavily on your controller or software. It is simple and resilient, so it is common for boot drives and small servers. Adding a
          third or fourth mirror raises the cost per usable terabyte quickly, and other levels protect data for less.
        </Lead>
        <Lead lead="RAID 1E.">
          An enhanced mirror that works with an odd number of disks (minimum three). Usable capacity is 50% of raw space. It is useful when you have
          three or five disks, but with an even count RAID 10 is usually the better pick.
        </Lead>
        <Lead lead="RAID 10 (1+0).">
          Mirrored pairs striped together. It needs an even number of disks and at least four. Usable capacity is always 50%. Theoretically read
          speed scales with n, and write speed scales with n ÷ 2 because each block is written twice. It can lose one disk per mirrored pair, so it
          survives two failures only if they hit different pairs. Two failures in the same pair lose the data. Rebuilds are fast because only the
          mirror partner needs copying.
        </Lead>
        <Lead lead="RAID 5 (single parity).">
          Needs at least three disks. Capacity is (n − 1) × disk size, and one disk can fail. Reads scale to about n − 1 times a single disk. Writes
          see little gain because parity must be calculated for each stripe.
        </Lead>
        <Lead lead="RAID 6 (double parity).">
          Needs at least four disks. Capacity is (n − 2) × disk size, and any two disks can fail. Read gain is about n − 2. Writes are slower than
          RAID 5 because of the second parity calculation.
        </Lead>
        <Lead lead="RAID 50 (5+0).">
          Several RAID 5 groups striped together, with a six-disk minimum. Capacity is the total minus one disk per group, and one disk per group can
          fail. It rebuilds faster and writes better than one large RAID 5.
        </Lead>
        <Lead lead="RAID 60.">
          Several RAID 6 groups striped together, with an eight-disk minimum. Capacity is the total minus two disks per group, and two disks per
          group can fail. It suits large arrays where safety and throughput both matter.
        </Lead>
        <Lead lead="RAID 5E and RAID 5EE.">
          These are RAID 5 with a built-in hot spare, so they need at least four disks. 5E puts the spare space at the end of each disk. 5EE spreads
          it through the array. If a disk fails, the array can start rebuilding into the spare space right away, without waiting for someone to
          swap hardware. Capacity is (n − 2) × disk size. Support varies by controller, so check your hardware before choosing either.
        </Lead>
        <H3>RAID 10 vs. RAID 01</H3>
        <P>
          RAID 01 stripes first and then mirrors the stripes. RAID 10 mirrors first and then stripes. With the same disks they offer the same
          capacity, but RAID 10 is more resilient. In RAID 01, one failed disk takes down its whole stripe set. In RAID 10, only that one mirrored
          pair is affected, so a rebuild touches one disk. That is why RAID 10 is the standard choice.
        </P>
        <H3>Minimum Disks per Level</H3>
        <DataTable headers={MIN_HEADERS} rows={MIN_ROWS} />
      </Card>

      <Card title="Worked Example: RAID 6 vs. RAID 10 vs. RAID 5">
        <P>Say you have six 4 TB disks at $100 each, a $600 total.</P>
        <DataTable headers={EXAMPLE_HEADERS} rows={EXAMPLE_ROWS} rowHeads />
        <P>
          RAID 5 gives the most space at the lowest cost per terabyte, but it survives only one failure. RAID 6 costs 4 TB of capacity to survive any
          two failures. RAID 10 costs the most per terabyte but writes three times faster and rebuilds more quickly. The right answer depends on how
          much you read versus write, and how bad a lost array would be. Run your own numbers in the calculator and compare.
        </P>
      </Card>

      <Card title="When and Why You Need a RAID Capacity Calculator">
        <P>Most people use a RAID capacity calculator just before spending money, which is the right time. Common situations include:</P>
        <List items={[
          ["Building a home NAS.", "With four 8 TB drives, RAID 5 gives 24 TB and RAID 6 gives 16 TB. That 8 TB gap is better to see before you build."],
          ["Specifying a small-business file server.", "Comparing RAID 10 and RAID 6 cost per TB helps justify a budget."],
          ["Upgrading drives.", "Swapping 4 TB disks for 12 TB disks changes both capacity and price per terabyte."],
          ["Planning a video editing or database workstation.", "Speed matters most here, so the read and write gain decide between levels like RAID 0 and RAID 10."],
          ["Studying for IT certifications.", "A RAID level calculator checks your manual math and shows how nested levels behave."],
        ]} />
      </Card>

      <Card title="Cost per TB, Units and Real Usable Capacity">
        <P>
          Raw capacity and usable capacity are very different numbers, and cost per usable TB shows the gap. Protection is paid for in capacity. In
          the example above, moving from RAID 5 to RAID 6 costs $7.50 more per usable terabyte and buys a second layer of failure tolerance.
        </P>
        <P>
          Units matter too. Drives are sold in decimal terabytes (1 TB = 1,000,000,000,000 bytes), while many operating systems show binary
          tebibytes (TiB). A 16 TB array may appear as roughly 14.5 TiB in your file manager. That is a unit difference, not lost space. File system
          formatting takes a little more. The calculator accepts both decimal and binary units, so you can match what your operating system
          reports.
        </P>
      </Card>

      <Card title="Which RAID Level Should You Choose?">
        <Lead lead="Fastest configuration:">
          RAID 0 has the highest theoretical speed, but no protection. For speed with redundancy, RAID 10 is the usual choice.
        </Lead>
        <Lead lead="Most redundancy:">
          RAID 1 with extra mirrors can survive all but one disk failing, but wastes the most space. For a good balance of redundancy and
          efficiency, RAID 6 or RAID 60 is more practical.
        </Lead>
        <P>Typical use cases:</P>
        <List items={[
          ["Scratch space, temporary editing cache:", "RAID 0, with the real data stored elsewhere."],
          ["Boot drives and small servers:", "RAID 1."],
          ["Databases, virtual machines, write-heavy work:", "RAID 10."],
          ["Home or office file storage and media libraries:", "RAID 5 for modest drive sizes, RAID 6 for large drives."],
          ["Large arrays of eight or more disks:", "RAID 50 or RAID 60."],
          ["Odd disk counts:", "RAID 1E, or RAID 5E and 5EE where your controller supports them."],
        ]} />
      </Card>

      <Card title="Are RAID 5 and RAID 6 Dead? Rebuilds and Simultaneous Failures">
        <P>
          You will often hear that RAID 5 is dead. It is better to say RAID 5 is riskier than it used to be. When a disk fails, the array must read
          every remaining disk in full to rebuild. With multi-terabyte drives that can take many hours or days, and during that time the array has
          no protection. If a second disk fails or hits an unreadable sector, the array is lost.
        </P>
        <P>
          Simultaneous failure is more likely than it sounds. Drives bought together often come from the same batch and have the same age and
          wear. A rebuild also puts heavy stress on every disk at once. Many administrators move to RAID 6 or RAID 10 once drives pass roughly 4 to
          8 TB. RAID 6 is not dead. It is the common choice for large arrays, and the fault tolerance output makes the difference clear: one disk
          for RAID 5, two for RAID 6. A capacity calculator cannot predict rebuild time, because that depends on the controller, workload and drive
          speed.
        </P>
      </Card>

      <Card title="What Happens When a Drive in a RAID Array Fails?">
        <P>
          In every level except RAID 0, the array keeps working in a “degraded” state. Your data stays available, but performance usually drops and
          you have lost some or all of your safety margin. Replace the failed drive promptly. The array then rebuilds, copying or recalculating data
          onto the new drive. Arrays with a hot spare (including 5E and 5EE) can begin rebuilding without waiting for a manual swap. With RAID 0, a
          single failure means the data is gone.
        </P>
        <H3>Signs a RAID Array May Be Failing</H3>
        <List items={[
          ["", "Degraded or warning alerts from your controller or NAS"],
          ["", "Drives dropping offline and coming back"],
          ["", "Clicking or grinding noises"],
          ["", "SMART warnings or growing bad-sector counts"],
          ["", "Sudden slowdowns or file errors"],
          ["", "Rebuilds that keep restarting"],
        ]} />
        <P>If you see these, back up immediately before doing anything else.</P>
      </Card>

      <Card title="RAID with SSDs, Mixed Drives and Different Sizes">
        <Lead lead="SSDs.">
          RAID works with SSDs and can deliver excellent speed, but there are challenges. Parity levels create extra writes, which wear flash cells
          faster. Identical SSDs in one array tend to wear at the same rate, so they can fail close together. Some controllers do not pass TRIM
          commands through to the drives, which can hurt long-term performance. The controller, network or CPU can also become the bottleneck
          before the SSDs do, so real speed gains often fall short of the calculator’s theoretical maximums.
        </Lead>
        <Lead lead="Mixing HDDs and SSDs.">
          It is possible in some setups, but the array generally runs at the pace of the slowest drive. Some software RAID options let you mirror an
          SSD with a hard drive and favor the faster one for reads. In general, keep each array to one drive type.
        </Lead>
        <Lead lead="Different sizes.">
          Technically allowed, but the extra space on larger drives is wasted, because every drive is treated as the smallest. This applies to RAID
          1 too, where the mirror is limited to the smaller drive. That is why the calculator asks for the smallest disk size.
        </Lead>
        <Lead lead="Commodity drives and USB drives.">
          You can build RAID from ordinary consumer hard drives, and that was the original idea. For always-on arrays, drives rated for NAS use are
          usually a safer choice. You can also make a small RAID from external USB drives using software RAID, but USB hubs and connections add
          failure points and can be unreliable. Treat it as a convenience setup, not a protected one.
        </Lead>
      </Card>

      <Card title="Setting Up, Expanding and Managing a RAID Array">
        <Lead lead="Setting up.">
          After picking a level in the calculator, you configure the array through a hardware RAID controller, your NAS software, or your operating
          system’s software RAID tools. Creating an array erases the drives involved, so back up first. Use drives of matching size.
        </Lead>
        <Lead lead="Installing Windows.">
          Windows can usually be installed on a hardware RAID volume, because the controller presents it as one disk. You may need to load the
          controller’s driver during setup. Windows’ built-in software RAID is typically used for data volumes rather than the system drive. If
          Windows is already installed, creating an array normally means reinstalling or cloning, since the drives are wiped.
        </Lead>
        <Lead lead="Adding a drive.">
          Many controllers and NAS systems can expand an array online, though it triggers a long reshape. Others require rebuilding from scratch.
          Check your hardware first. Once you know the new disk count, enter it in the calculator to see the new capacity.
        </Lead>
        <Lead lead="Deleting an array.">
          Deleting a RAID array removes its configuration, and the data on it should be treated as gone. Recovery is sometimes possible but never
          guaranteed.
        </Lead>
        <Lead lead="Improving performance.">
          More drives help striped levels. RAID 10 improves write speed over parity levels. SSDs, matched drives, a controller with cache and a
          healthy (non-degraded) array all help.
        </Lead>
      </Card>

      <Card title="Backups and Recovery: What RAID Cannot Do">
        <P>
          RAID is not a backup. It protects against drive failure, not accidental deletion, ransomware, corruption, fire or theft. Follow the 3-2-1
          approach: three copies, on two types of media, with one offsite. That could mean an external drive, a second array, cloud storage, or
          tape.
        </P>
        <P>
          Rebuilding a damaged array is a hardware replacement job. Recovering one that has failed beyond its tolerance is much harder. The hardest
          cases include RAID 0 after any failure, parity arrays that lost more drives than they could survive, nested arrays with many drives, and
          arrays using controller-specific layouts like 5E or 5EE where the original controller is gone. Professional recovery is costly and not
          guaranteed. A good backup is cheaper.
        </P>
      </Card>

      <Card title="How Accurate Is This RAID Calculator? Privacy and Cost">
        <P>
          The calculator is free to use. You only type in numbers such as disk size, disk count and price, so you do not need to upload files or
          share personal details about your systems. Capacity figures follow the standard formula for each level and are reliable for planning.
          Speed gains are theoretical maximums compared with one disk. Real throughput depends on your controller, drives, cache, file system and
          workload, so use them as a relative guide, not a benchmark. Vendor implementations of levels like 5E and 5EE may differ, so check your
          hardware documentation before buying.
        </P>
      </Card>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Frequently Asked Questions</h2>
        {FAQ_ITEMS.map((item, i) => (
          <FaqRow key={item.q} item={item} open={openIndex === i} onToggle={() => setOpenIndex(openIndex === i ? -1 : i)} />
        ))}
      </div>
    </div>
  );
}
