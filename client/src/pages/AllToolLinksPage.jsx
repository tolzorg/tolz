import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { TOOLS } from "../utils/tools";
import TOOL_DATES from "../data/toolCreationDates.json";

const SITE_URL = "https://www.tolz.org";

// Every available tool in the registry, newest first. Dates come from
// src/data/toolCreationDates.json (generated before each build by
// scripts/generate-tool-dates.js). A tool not in that file yet is brand new,
// so it goes to the top. Tools added at the same moment keep the reverse of
// their registry order.
function toolsNewestFirst() {
  const seen = new Set();
  return TOOLS
    .map((tool, index) => ({ tool, index, date: TOOL_DATES[tool.path] }))
    .filter(({ tool }) => tool.available && !seen.has(tool.path) && seen.add(tool.path))
    .sort((a, b) => {
      if (!a.date !== !b.date) return a.date ? 1 : -1;
      if (a.date !== b.date) return a.date < b.date ? 1 : -1;
      return b.index - a.index;
    });
}

export default function AllToolLinksPage() {
  const list = toolsNewestFirst();

  return (
    <div style={{ background: "var(--bg-base)" }}>
      <SEO
        title="All Tool Page Links"
        description="A complete list of every tool page on Tolz, with the newest tools first."
        path="/our-all-tool-pages-links"
      />
      <div className="container" style={{ maxWidth: 760, padding: "48px 24px 80px" }}>
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {list.map(({ tool }) => (
            <li key={tool.path} style={{ padding: "4px 0", fontSize: 14 }}>
              <Link
                to={tool.path}
                style={{ color: "var(--accent)", textDecoration: "none", wordBreak: "break-all" }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
              >
                {SITE_URL}{tool.path}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
