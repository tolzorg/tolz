import { Link } from "react-router-dom";
import SEO from "../components/SEO";

export default function NotFoundPage() {
  return (
    <>
      <SEO
        title="404 — Page Not Found"
        description="This page doesn't exist or has been moved."
        path="/"
        robots="noindex, nofollow"
      />
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 80,
            color: "var(--border-hover)",
            lineHeight: 1,
            marginBottom: 16,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: 22,
            color: "var(--text-primary)",
            marginBottom: 10,
          }}
        >
          Page not found
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 28, maxWidth: 340 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          ← Back to Home
        </Link>
      </div>
    </>
  );
}
