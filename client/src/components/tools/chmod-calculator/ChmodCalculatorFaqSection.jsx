import { useState } from "react";
import { Link } from "react-router-dom";
import JsonLd from "../../JsonLd";

const FAQ_ITEMS = [
  { q: "What does chmod 755 mean?", a: "It gives the owner read, write and execute permission, and gives the group and others read and execute only. It is the common setting for directories and executable scripts." },
  { q: "What do the numbers mean in the Linux chmod command?", a: "Each digit represents one class: owner, group and others, in that order. A digit is the sum of read (4), write (2) and execute (1). A fourth leading digit sets special modes." },
  { q: "What is the difference between chmod 644 and 755?", a: "Both give the owner read and write access, but 755 adds the execute bit for everyone. Use 644 for ordinary files and 755 for folders and programs." },
  { q: "What is the difference between chmod 777 and 775?", a: "With 777, others can read, write and execute. With 775, others can only read and execute. The owner and group have full access in both." },
  { q: "How do I convert chmod permissions to octal?", a: "Assign read 4, write 2 and execute 1, then add the values for the owner, group and others separately. For example, rwxr-x--- becomes 750." },
  { q: "What does chmod 4755 do?", a: "The leading 4 sets the setuid bit, so the program runs with its owner’s privileges. The remaining 755 sets the normal permissions." },
  { q: "What is the difference between = and + in chmod?", a: "The plus sign adds a permission and leaves the rest unchanged. The equals sign sets the permissions to exactly what you specify and removes anything else." },
  { q: "What does chmod u+x do?", a: "It adds execute permission for the file’s owner and changes nothing else. It is the usual way to make a personal script runnable." },
  { q: "Is chmod 777 dangerous?", a: "It can be, because anyone on the system can read, change and run the file. Fix ownership or group access instead whenever possible." },
  { q: "What is the sticky bit used for?", a: "On a shared directory, it stops users from deleting or renaming files that belong to others. /tmp uses it at mode 1777." },
  { q: "Can chmod corrupt a file?", a: "No. Chmod only changes permission bits, not file contents. If a file seems broken afterward, restore its permissions, usually 644 for files and 755 for directories and scripts." },
  { q: "Does chmod work on Windows?", a: "Not natively. Windows uses a different permission model, though chmod works under WSL and, in a limited way, in Git Bash. For Windows servers, use icacls instead." },
];

// The supplied FAQ schema matches the list above with straight apostrophes.
const straight = (s) => s.replace(/’/g, "'");

const CLASS_HEADERS = ["Class", "Symbol", "Who it covers"];
const CLASS_ROWS = [
  ["User / owner", "u", "The person who owns the file or directory"],
  ["Group", "g", "Users who belong to the file’s assigned group"],
  ["Others", "o", "Everyone else on the system"],
];

const OCTAL_HEADERS = ["Octal", "Binary", "Symbolic", "Meaning"];
const OCTAL_ROWS = [
  ["7", "111", "rwx", "Read, write and execute"],
  ["6", "110", "rw-", "Read and write"],
  ["5", "101", "r-x", "Read and execute"],
  ["4", "100", "r--", "Read only"],
  ["3", "011", "-wx", "Write and execute"],
  ["2", "010", "-w-", "Write only"],
  ["1", "001", "--x", "Execute only"],
  ["0", "000", "---", "No permissions"],
];

const SPECIAL_HEADERS = ["First digit", "Setuid", "Setgid", "Sticky bit"];
const SPECIAL_ROWS = [
  ["0", "No", "No", "No"], ["1", "No", "No", "Yes"], ["2", "No", "Yes", "No"], ["3", "No", "Yes", "Yes"],
  ["4", "Yes", "No", "No"], ["5", "Yes", "No", "Yes"], ["6", "Yes", "Yes", "No"], ["7", "Yes", "Yes", "Yes"],
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
const codeStyle = { fontFamily: "var(--font-mono, monospace)", fontSize: 12.5, color: "var(--text-primary)" };
const formulaStyle = {
  fontFamily: "var(--font-mono, monospace)", fontSize: 13, color: "var(--text-primary)",
  background: "var(--bg-muted)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)",
  padding: "10px 14px", marginBottom: 10, textAlign: "center", lineHeight: 1.8,
};

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
const C = ({ children }) => <code style={codeStyle}>{children}</code>;
const Formula = ({ children }) => <div style={formulaStyle}>{children}</div>;
const Ext = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="inline-home-link">{children}</a>;
const List = ({ items }) => (
  <ul style={ulStyle}>
    {items.map(([lead, text], i) => (
      <li key={i} style={liStyle}>{lead && <strong>{lead}</strong>}{lead && text ? " " : ""}{text}</li>
    ))}
  </ul>
);

function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: "auto", margin: "4px 0 12px" }}>
      <table className="data-table data-table-head" style={{ borderCollapse: "collapse", fontSize: 13, color: "var(--text-primary)", width: "100%", minWidth: 320 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
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

export default function ChmodCalculatorFaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: straight(item.a) },
    })),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <JsonLd data={faqSchema} />
      <style>{".faq-card-body > :first-child { margin-top: 0 !important; } .faq-card-body > :last-child { margin-bottom: 0 !important; }"}</style>

      <Card>
        <P>This tool is by <Link to="/" className="inline-home-link">tolz.org</Link></P>
      </Card>

      <Card title="What Is the Chmod Command?">
        <P>
          The name chmod is short for “change mode.” It is a command in Unix and Unix-like systems, including Linux, Ubuntu and macOS, that changes
          the permissions of files and directories. In Unix terms, the permissions attached to a file are its mode, which is where the name comes
          from.
        </P>
        <P>
          On Ubuntu and most other Linux distributions, chmod is part of the GNU coreutils package, so it is installed by default. You don’t need
          to install anything. Open a terminal and run it. The command works the same way on Ubuntu, Debian, Fedora, CentOS and other systems, and
          it behaves almost identically on macOS and BSD.
        </P>
        <P>
          Only the owner of a file or the root user can change its permissions. If you try to run chmod on a file that belongs to someone else, you
          will get an “Operation not permitted” error. On Ubuntu, that usually means you need to add <C>sudo</C> in front of the command.
        </P>
      </Card>

      <Card title="Purpose and Significance of the Chmod Command">
        <P>
          Linux is a multi-user system, and chmod is one of the main tools that keeps users and programs from interfering with each other. Without
          it, any user or process could read private files, edit system configuration or run any script.
        </P>
        <P>Here is what chmod controls in practice:</P>
        <List items={[
          ["Privacy.", "You decide who can read a file, such as a private key or a config file with passwords."],
          ["Integrity.", "You decide who can modify or delete files, which protects system and application files from accidental or malicious changes."],
          ["Execution.", "A script or program only runs if its execute bit is set, so chmod is how you make a file runnable."],
          ["Shared access.", "Teams can share folders safely by granting access to a group without opening it to everyone."],
        ]} />
        <P>
          Because one wrong digit can lock users out or expose private files, getting chmod right matters for both security and for keeping
          applications working.
        </P>
      </Card>

      <Card title="What Happens When Chmod Is Applied to a File">
        <P>
          Chmod changes a small piece of metadata stored with the file, called the mode bits. It doesn’t touch the file’s contents, its owner or
          its group. Once the bits change, the system applies the new rules the next time anyone tries to read, write or run the file.
        </P>
        <P>
          This also answers a common worry. A chmod command can’t corrupt a file or damage its data. If a file seems “broken” after a permission
          change, it is almost always because someone can no longer read it or run it. To fix that, set the permissions back to what they should
          be. For most regular files, that is 644, and for directories and scripts, it is 755.
        </P>
        <P>
          You can see the current mode of any file with <C>ls -l</C>. The first column shows something like <C>-rwxr-xr-x</C>. The first character
          is the file type (<C>-</C> for a regular file, <C>d</C> for a directory), and the next nine characters are three groups of permissions.
        </P>
      </Card>

      <Card title="Who Chmod Changes: Owner, Group and Others">
        <P>Permissions are set separately for three classes of users:</P>
        <DataTable headers={CLASS_HEADERS} rows={CLASS_ROWS} />
        <P>
          In symbolic commands, you can also use <C>a</C>, which means “all.” So <C>chmod a+x file</C> adds execute permission for the owner, the
          group and others in one step. The class you set is independent of the others. A file can be fully open to its owner, read-only for the
          group, and closed to everyone else.
        </P>
        <P>
          Linux checks these classes in order. If you are the owner, only the owner’s permissions apply to you, even if the group or others have
          more access. If you aren’t the owner but belong to the file’s group, the group permissions apply. Everyone else falls under “others.”
        </P>
      </Card>

      <Card title="What Do the Numbers Mean in the Chmod Command?">
        <P>
          Octal mode writes each class as a single digit from 0 to 7. Each permission has a fixed value: read is 4, write is 2 and execute is 1. You
          add up the permissions you want for each class.
        </P>
        <DataTable headers={OCTAL_HEADERS} rows={OCTAL_ROWS} />
        <P>
          The binary column shows why the system works. Each permission is either on (1) or off (0). Read-only is <C>r--</C>, which is 100 in
          binary, and that equals 4. Three digits cover the three classes, so 754 means the owner has 7 (rwx), the group has 5 (r-x) and others
          have 4 (r--). Written out, that is <C>rwxr-xr--</C>.
        </P>
        <P>
          Going the other way, <C>rw-r-----</C> converts to 6, 4 and 0, which is 640. The calculator does this conversion both ways, so you don’t
          have to add it up yourself.
        </P>
      </Card>

      <Card title="Octal Numbers vs. Permission Letters: Set (=) vs. Add (+)">
        <P>
          Chmod accepts two kinds of input. Octal mode uses numbers, and symbolic mode uses letters. They can produce the same result, but they work
          differently.
        </P>
        <P>
          An octal command such as <C>chmod 664 file</C> replaces the entire mode. Whatever the permissions were before, they now match 664 exactly.
        </P>
        <P>
          A symbolic command is built from three parts: the class (u, g, o or a), an operator, and the permissions (r, w, x). The operator is where
          people get confused:
        </P>
        <List items={[
          ["+", <>adds a permission and leaves everything else alone. <C>chmod g+w file</C> gives the group write access and changes nothing else.</>],
          ["-", <>removes a permission. <C>chmod o-rwx file</C> takes all access away from others.</>],
          ["=", <>sets the permissions for that class to exactly what you list, wiping out whatever was there. <C>chmod g=r file</C> leaves the group with read only, even if it previously had write and execute.</>],
        ]} />
        <P>
          Use octal when you want a known, exact final state. Use symbolic when you want a small, targeted change. If you need to combine changes,
          separate them with commas, as in <C>chmod u=rwx,g=rx,o= file</C>.
        </P>
      </Card>

      <Card title="Chmod Syntax and Options">
        <P>The general form is:</P>
        <Formula>chmod [options] mode file</Formula>
        <P>The mode can be octal or symbolic, and you can list several files after it. The options you will see most often are:</P>
        <List items={[
          ["", <><C>-R</C> or <C>--recursive</C> applies the change to a directory and everything inside it. These two forms are the same option. One is the short version and the other is the long version, and either one works.</>],
          ["", <><C>-v</C> or <C>--verbose</C> prints a line for every file it processes.</>],
          ["", <><C>-c</C> or <C>--changes</C> prints a line only when something actually changes.</>],
          ["", <><C>-f</C> or <C>--silent</C> suppresses most error messages.</>],
        ]} />
        <P>
          You can read the full list in the{" "}
          <Ext href="https://www.gnu.org/software/coreutils/manual/html_node/chmod-invocation.html">GNU coreutils chmod documentation</Ext>.
        </P>
      </Card>

      <Card title="How to Use This Chmod Calculator">
        <P>The tool has two modes, and you choose between them at the top.</P>
        <Lead lead="Find the chmod command.">
          Pick this mode when you know what access you want and need the command. The tool asks three questions: who can read, who can write and
          who can execute. For each one, you choose Yes or No for the User/owner, Group and Other classes. If you need special permissions, open
          the Special modes section and choose Yes or No for Setuid, Setgid and Sticky bit. Click Calculate, and the tool builds the chmod command
          for you. Click Clear to start over.
        </Lead>
        <Lead lead="Decode an octal number.">
          Pick this mode when you have a number and want to know what it does. Enter a value such as 755, 644 or 4755 next to “chmod,” then click
          Calculate. The tool shows the symbolic form, the binary form and a permissions table that lists what the owner, group and others can do.
        </Lead>
        <P>
          Once you have your result, replace the placeholder filename with your real path and run the command in your terminal. If you want to
          apply it to a whole folder, add <C>-R</C>, but read the section on recursive changes below first.
        </P>
      </Card>

      <Card title="A Chmod Example: How 755 Is Built">
        <P>Say you want the owner to read, write and execute a file, while everyone else can only read and execute it.</P>
        <List items={[
          ["Owner:", "read, write and execute is rwx, or 111 in binary. In octal, that is 4 + 2 + 1 = 7."],
          ["Group:", "read and execute, but no write, is r-x, or 101 in binary. In octal, that is 4 + 1 = 5."],
          ["Others:", "the same as the group, so 5 again."],
        ]} />
        <P>
          Put the three digits together and you get 755. The full command is <C>chmod 755 file_name</C>. In the calculator, you would choose Yes for
          all three owner permissions, then Yes for read and execute and No for write for both group and others.
        </P>
      </Card>

      <Card title="Common Chmod Values: 755, 644, 600 and 777">
        <P>A handful of modes cover most real work.</P>
        <List items={[
          ["755 (rwxr-xr-x)", "gives the owner full control and lets everyone else read and execute. It is the standard for directories, shell scripts and executables. This is the mode behind the common question “what is the chmod 755 command in Linux?”"],
          ["644 (rw-r--r--)", "lets the owner edit while everyone else can only read. It is the usual setting for regular files like HTML, CSS, images and config files on a web server."],
          ["600 (rw-------)", "limits access to the owner alone. SSH private keys need this, because the SSH client refuses to use a key that other users can read."],
          ["700 (rwx------)", "is the directory version, suited for something like ~/.ssh."],
          ["664 and 775", "add group write access, which works well for teams sharing a project folder."],
          ["400 (r--------)", "makes a file read-only, even for its owner. It is a sensible guard for certificates and critical config files."],
          ["777", "gives everyone full access. It shows up often in forum answers, but it is rarely the right fix."],
        ]} />
        <H3>What Is the Difference Between 777 and 775?</H3>
        <P>
          The only difference is the last digit. With 777, others get read, write and execute. With 775, others get read and execute only. In both
          cases the owner and group have full access. So 775 keeps the group’s shared write access but stops outside users from changing anything,
          which makes it the safer choice for shared folders.
        </P>
      </Card>

      <Card title="Chmod u+x, a+x and +x: Making a File Executable">
        <P>A new script file is created without the execute bit, so it won’t run until you add it. Three forms are common:</P>
        <List items={[
          ["", <><C>chmod u+x script.sh</C> adds execute for the owner only. This is usually all you need for a personal script.</>],
          ["", <><C>chmod a+x script.sh</C> adds execute for the owner, the group and others.</>],
          ["", <><C>chmod +x script.sh</C> with no class listed behaves like <C>a+x</C>, except that any bits set in your umask are left out. On a typical system with a umask of 022, it adds execute for everyone.</>],
        ]} />
        <P>
          After that, you can run the script with <C>./script.sh</C>. If you see “Permission denied” when running a script, a missing execute bit is
          the first thing to check.
        </P>
      </Card>

      <Card title="Special Modes: Setuid, Setgid and the Sticky Bit">
        <P>
          When a mode has four digits, the leftmost one controls special permissions. The three rightmost digits are still owner, group and others.
          Setuid is worth 4, setgid is worth 2 and the sticky bit is worth 1, and they add together the same way read, write and execute do.
        </P>
        <DataTable headers={SPECIAL_HEADERS} rows={SPECIAL_ROWS} />
        <Lead lead="Setuid (4xxx).">
          When set on an executable, the program runs with the privileges of the file’s owner instead of the person who launched it. This is how{" "}
          <C>passwd</C> can update protected system files for ordinary users. In <C>ls -l</C>, the owner’s x shows as s.
        </Lead>
        <Lead lead="Setgid (2xxx).">
          On an executable, the program runs with the group’s privileges. On a directory, which is its more common use, new files inherit the
          directory’s group instead of the creator’s primary group. A shared team folder at 2775 keeps group ownership consistent without manual
          fixes. The group’s x shows as s.
        </Lead>
        <Lead lead="Sticky bit (1xxx).">
          On a directory, it means users can delete or rename only the files they own, even if they have write access to the folder. The{" "}
          <C>/tmp</C> directory is the classic case, set to 1777. The others’ x shows as t.
        </Lead>
        <P>
          If you see a capital S or T instead, the special bit is set but the underlying execute bit is not. That is usually a sign of a mistake
          worth checking. Also, setuid on shell scripts is ignored by most modern Linux systems, and setuid on any program you haven’t audited is a
          security risk, so use it sparingly.
        </P>
      </Card>

      <Card title="Chmod vs. Chown, Touch and Umask">
        <P>Several commands show up alongside chmod, and they are easy to mix up.</P>
        <Lead lead="chmod vs. chown.">
          Chmod changes what people can do with a file. Chown changes who the owner and group are. If a web server can’t write to a folder, the fix
          is often chown, not a looser chmod. They are often used together, for example <C>chown www-data:www-data uploads</C> followed by{" "}
          <C>chmod 775 uploads</C>.
        </Lead>
        <Lead lead="chmod vs. touch.">
          Touch creates an empty file or updates a file’s timestamp. It has nothing to do with permissions on its own. The two commands often
          appear together, as in <C>touch deploy.sh</C> followed by <C>chmod +x deploy.sh</C>, which creates a new script and makes it runnable.
        </Lead>
        <Lead lead="chmod vs. umask.">
          Umask sets the default permissions for files and directories you create in the future. Chmod changes the permissions of files that
          already exist. New files start at 666 and new directories at 777, and the umask removes bits from those. A umask of 022 produces 644 for
          files and 755 for directories. Use umask to change your defaults and chmod to fix individual files.
        </Lead>
      </Card>

      <Card title="When You Need a Chmod Calculator: Practical Scenarios">
        <P>The need usually shows up in the middle of a task, not as a study exercise.</P>
        <List items={[
          ["Deploying a website.", "Uploaded files often arrive with the wrong modes. Setting directories to 755 and files to 644 fixes most 403 errors without opening anything unnecessarily."],
          ["Setting up a LAMP stack.", "Web files are typically 644 and directories 755, owned by your user or the web server user. Folders where the application must write, such as uploads or cache, usually need 775 with the group set to the web server’s group (www-data on Ubuntu and Debian, apache on CentOS and RHEL). Files holding database passwords are better at 640 or 600."],
          ["Making a script runnable.", "A new .sh file lacks the execute bit. Generating the chmod +x or 755 command takes seconds."],
          ["Securing SSH.", "Private keys should be 600 and the .ssh folder 700, or authentication can fail with a warning about unprotected files."],
          ["Managing files over FTP or SFTP.", "Most clients let you enter an octal value in a permissions dialog. Chmod doesn’t work on every server, though. Some hosts block it, Windows-based servers don’t use Unix permissions, and some servers restrict changes for accounts locked to a home directory. If the change fails, check with your host."],
          ["Setting up a shared project folder.", "A 2775 directory with a common group lets a team collaborate cleanly."],
          ["Reading someone else’s setup.", "When documentation says “set the file to 4750,” decoding it first tells you what you are actually allowing."],
          ["Learning or teaching.", "Students can switch each Yes/No answer and watch the octal value and rwx string change, which makes the relationship click faster than a static table."],
        ]} />
      </Card>

      <Card title="Chmod -R: Changing Permissions Recursively">
        <P>
          The <C>-R</C> option applies a mode to a folder and everything inside it. It saves time, but it is also where many mistakes happen. Files
          and directories rarely need the same mode. A blanket <C>chmod -R 755 folder</C> makes every file executable, which is unnecessary and
          sloppy.
        </P>
        <P>A safer pattern is to set directories and files separately:</P>
        <Formula>
          find folder -type d -exec chmod 755 {"{}"} +<br />
          find folder -type f -exec chmod 644 {"{}"} +
        </Formula>
        <P>
          Also check your working directory before running any recursive command. The same command run from the wrong location can change
          thousands of files you never meant to touch. The{" "}
          <Ext href="https://man7.org/linux/man-pages/man1/chmod.1.html">Linux man page for chmod</Ext> covers recursion and the other options in
          detail.
        </P>
      </Card>

      <Card title="Is Chmod 777 Safe? Permission Mistakes to Avoid">
        <P>
          Usually, no. Mode 777 lets any user on the system, and any compromised process, modify or replace the file. On a web server, that can let
          an attacker inject code into your site. It often “fixes” an error only because it hides the real cause, which is typically wrong
          ownership or a missing execute bit on a parent directory.
        </P>
        <P>
          Before reaching for 777, check who owns the file with <C>ls -l</C> and whether the service runs under the right user or group. Changing
          ownership with chown or adding the process to the proper group is almost always the better answer.
        </P>
        <P>Other common mistakes include:</P>
        <List items={[
          ["Removing the execute bit from a directory.", "This locks you out of its contents, even if the files inside are readable."],
          ["Making private keys too open.", "Anything looser than 600 can cause SSH to reject the key."],
          ["Removing execute from chmod itself.", <>Running something like <C>chmod -x /bin/chmod</C> strips the execute permission from the chmod program, so the command stops working. Fixing it requires root and another method, such as <C>sudo /lib64/ld-linux-x86-64.so.2 /bin/chmod +x /bin/chmod</C> on some systems, or booting into recovery mode. Don’t experiment with permissions on system binaries.</>],
          ["Running recursive commands from the wrong directory.", "Always confirm the path first."],
        ]} />
        <H3>How to Avoid Deleting Files in a Directory</H3>
        <P>
          Many people assume that making a file read-only protects it from deletion. It doesn’t. Whether you can delete a file depends on the write
          permission of the directory that contains it, not on the file’s own permissions. To protect files in a folder, remove write permission
          from the directory (for example, <C>chmod a-w folder</C>). For a shared folder where users should only be able to delete their own files,
          use the sticky bit, as in 1777.
        </P>
      </Card>

      <Card title="Using Chmod on Windows">
        <P>
          Windows doesn’t have a native chmod command. It uses a different permission system based on access control lists (ACLs) that are set
          through the file’s Properties window under the Security tab, or with the <C>icacls</C> command in Command Prompt or PowerShell. This is
          also the answer for a Windows server, where icacls is the closest equivalent to chmod.
        </P>
        <P>You can still run chmod on a Windows PC in a few environments:</P>
        <List items={[
          ["Windows Subsystem for Linux (WSL).", "Chmod works normally on files stored in the Linux filesystem. Files on your Windows drives, mounted under /mnt/c, may not keep Unix permissions unless WSL is configured to store them."],
          ["Git Bash.", <>The chmod command is available, but it has limited effect on regular Windows (NTFS) files. If you need Git to record a file as executable, use <C>git update-index --chmod=+x filename</C>.</>],
        ]} />
        <P>
          Windows doesn’t rely on an execute bit. It decides whether a file can run mainly by its extension, such as .exe or .bat. So there is
          nothing to fix on Windows if a file isn’t marked “executable.” The calculator is still useful on a Windows PC when you need the right
          command for a Linux server you manage remotely.
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
