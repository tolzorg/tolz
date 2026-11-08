import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  {
    q: "What does chmod 755 mean?",
    a: "The owner can read, write and execute (7 = rwx), while the group and everyone else can read and execute but not write (5 = r-x). In symbolic form it's rwxr-xr-x, and in binary 111101101. It's the usual setting for scripts and directories.",
  },
  {
    q: "What does chmod 777 mean?",
    a: "Everybody (owner, group and others) can read, write and execute the file: rwxrwxrwx, or 111111111 in binary. It's rarely a good idea, because anyone can change or delete the file.",
  },
  {
    q: "What is the fourth digit in chmod, like 4755?",
    a: "With four digits, the first one sets the special modes: 4 = setuid, 2 = setgid, 1 = sticky bit (add them for combinations). 4755 is 755 with setuid, shown symbolically as rwsr-xr-x.",
  },
  {
    q: "Is my information kept private?",
    a: "Yes. Every calculation runs in your browser. Nothing you enter is sent anywhere or stored, and you don't need to sign up.",
  },
];

const CHART = [
  ["read, write and execute", "rwx", "111", "7"], ["read and write", "rw-", "110", "6"], ["read and execute", "r-x", "101", "5"],
  ["read only", "r--", "100", "4"], ["write and execute", "-wx", "011", "3"], ["write only", "-w-", "010", "2"],
  ["execute only", "--x", "001", "1"], ["none", "---", "000", "0"],
];
const SPECIAL = [["0", "no", "no", "no"], ["1", "no", "no", "yes"], ["2", "no", "yes", "no"], ["3", "no", "yes", "yes"], ["4", "yes", "no", "no"], ["5", "yes", "no", "yes"], ["6", "yes", "yes", "no"], ["7", "yes", "yes", "yes"]];

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

export default function ChmodCalculatorFaqSection() {
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
        <h2 style={h2Style}>Chmod Calculator</h2>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          With the {link("/", "Tolz")} chmod calculator you can quickly work out how to set the permissions of your files. Below we explain what
          chmod is, walk through a chmod example and show a Linux permission chart. You can also decode those mysterious numbers next to the
          chmod command.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>What Is the Chmod Command?</h2>
        <p style={pStyle}>
          <em>chmod</em> is short for <em>change mode</em>, the Unix and Linux command that changes the permissions of files and directories.
          Permissions are set for three classes:
        </p>
        <ul style={listStyle}>
          <li><strong>User / owner</strong>: the owner of the file or directory;</li>
          <li><strong>Group</strong>: users who are members of the file&apos;s group; and</li>
          <li><strong>Others</strong>: everyone who is neither the owner nor in the group.</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}>Each class&apos;s permissions can be written symbolically (rwx) or as a number, in binary or octal:</p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>Permission</th><th>Symbolic</th><th>Binary</th><th>Octal</th></tr></thead>
            <tbody>{CHART.map(([p, s, b, o]) => <tr key={o}><td>{p}</td><td style={{ ...center, ...mono }}>{s}</td><td style={{ ...center, ...mono }}>{b}</td><td style={center}>{o}</td></tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          This is the Unix (Linux) permission chart. An extra letter may appear on the left for the file type, e.g. drwxrwxrwx for a directory or
          -rwxrwxrwx for a regular file. In binary, 1 means on and 0 off: a read-only file is r--, or 100.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Chmod Example</h2>
        <p style={pStyle}>Say the owner should be able to do everything with a file, and everybody else only read and execute it:</p>
        <ol style={olStyle}>
          <li>The owner gets read, write and execute: rwx, 111 in binary, 7 in octal.</li>
          <li>The group gets read and execute but not write: r-x, 101 in binary, 5 in octal.</li>
          <li>The others get the same as the group: r-x, 101, 5.</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Put the octal digits together and you have <code style={mono}>chmod 755 file_name</code>, which is rwxr-xr-x in symbolic form and
          111101101 in binary.
        </p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>Chmod Permissions: Special Modes</h2>
        <p style={pStyle}>
          Sometimes you see four digits. The three on the right are still the owner, group and others permissions; the leftmost digit sets
          the special modes:
        </p>
        <ul style={listStyle}>
          <li><strong>Setuid</strong> (set user ID): in symbolic notation the user&apos;s x becomes s (and - becomes S);</li>
          <li><strong>Setgid</strong> (set group ID): the group&apos;s x becomes s (and - becomes S); and</li>
          <li><strong>Sticky bit</strong> (restricted deletion): the others&apos; x becomes t (and - becomes T).</li>
        </ul>
        <p style={{ ...pStyle, marginBottom: 6 }}>
          Setuid and setgid grant different privileges than usual (e.g. for changing passwords); the sticky bit is mostly used on directories
          such as /tmp to stop users from moving or deleting other users&apos; files.
        </p>
        <div style={{ overflowX: "auto", marginBottom: 10 }}>
          <table className="data-table data-table-head" style={tableStyle}>
            <thead><tr><th>1st digit (of 4)</th><th>Setuid?</th><th>Setgid?</th><th>Sticky bit?</th></tr></thead>
            <tbody>{SPECIAL.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} style={center}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
        <p style={{ ...pStyle, marginBottom: 0 }}>Open the <em>Special modes</em> section of the calculator to set them.</p>
      </div>

      <div className="card" style={cardStyle}>
        <h2 style={h2Style}>How to Use the Chmod Calculator</h2>
        <p style={pStyle}>The calculator does two things: it finds the command for the permissions you want, and it explains what an octal mode means (e.g. chmod 777, chmod 400, chmod 4664). To decode one:</p>
        <ol style={olStyle}>
          <li>Choose <em>decode octal number next to chmod</em>.</li>
          <li>Enter the value, for example 777.</li>
          <li>See who can read, write and execute, and the value in binary (111111111) and symbolic form (rwxrwxrwx).</li>
        </ol>
        <p style={{ ...pStyle, marginBottom: 0 }}>
          Keep in mind that chmod 777 makes a file readable, writable and executable by everybody, which is rarely what you want. More tools are
          in the {link("/calculators/tech-electronics", "tech and electronics calculators")}.
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
