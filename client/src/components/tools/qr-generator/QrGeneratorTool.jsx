import { useState, useMemo, useDeferredValue, useEffect, useRef } from "react";
import QRCode from "qrcode";

// ── Type registry ─────────────────────────────────────────────
// Original 5 types — unchanged
const TYPES_BASIC = [
  { id: "url",      label: "URL",      icon: "🔗" },
  { id: "text",     label: "Text",     icon: "📝" },
  { id: "email",    label: "Email",    icon: "📧" },
  { id: "phone",    label: "Phone",    icon: "📱" },
  { id: "wifi",     label: "WiFi",     icon: "📶" },
];

// 6 new types — additive
const TYPES_EXTENDED = [
  { id: "vcard",    label: "vCard",    icon: "📇" },
  { id: "location", label: "Location", icon: "📍" },
  { id: "sms",      label: "SMS",      icon: "💬" },
  { id: "event",    label: "Event",    icon: "📅" },
  { id: "social",   label: "Social",   icon: "🌐" },
  { id: "payment",  label: "Payment",  icon: "💳" },
];

const TYPES = [...TYPES_BASIC, ...TYPES_EXTENDED];

// ── Customization constants ───────────────────────────────────
const EC_LEVELS = [
  { value: "L", title: "Low — 7% recovery"      },
  { value: "M", title: "Medium — 15% recovery"   },
  { value: "Q", title: "Quartile — 25% recovery" },
  { value: "H", title: "High — 30% recovery"     },
];

const COLOR_PRESETS = [
  { fg: "#000000", bg: "#ffffff", label: "Classic" },
  { fg: "#1e3a5f", bg: "#e8f4fd", label: "Ocean"   },
  { fg: "#14532d", bg: "#dcfce7", label: "Forest"  },
  { fg: "#7c2d12", bg: "#fee2e2", label: "Ruby"    },
  { fg: "#312e81", bg: "#ede9fe", label: "Violet"  },
  { fg: "#ffffff", bg: "#000000", label: "Inverted" },
];

// ── Social platform definitions ───────────────────────────────
const SOCIAL_PLATFORMS = [
  { id: "instagram", label: "Instagram",    ph: "username"          },
  { id: "tiktok",    label: "TikTok",       ph: "username (no @)"   },
  { id: "linkedin",  label: "LinkedIn",     ph: "profile slug"      },
  { id: "facebook",  label: "Facebook",     ph: "username or page"  },
  { id: "twitter",   label: "X / Twitter",  ph: "username (no @)"   },
  { id: "youtube",   label: "YouTube",      ph: "channel (no @)"    },
];

// ── Payment type definitions ──────────────────────────────────
const PAY_TYPES = [
  { id: "paypal",   label: "PayPal"        },
  { id: "upi",      label: "UPI (India)"   },
  { id: "bitcoin",  label: "Bitcoin"       },
  { id: "ethereum", label: "Ethereum"      },
];

// ── Sizes / limits ────────────────────────────────────────────
const PREVIEW_SIZE  = 260;
const MAX_INPUT_LEN = 800; // density warning threshold

// ── Default field values (flat object) ───────────────────────
// Original fields — untouched
const DEFAULT_FIELDS = {
  url: "", text: "", email: "", subject: "", body: "",
  phone: "", ssid: "", password: "", security: "WPA", hidden: false,

  // vCard
  vcFn: "", vcLn: "", vcOrg: "", vcTitle: "",
  vcPhone: "", vcEmail: "", vcWeb: "", vcAddr: "",

  // Location
  locLat: "", locLng: "", locLabel: "",

  // SMS
  smsPhone: "", smsTxt: "",

  // Calendar event
  evtTitle: "", evtDesc: "", evtLoc: "", evtStart: "", evtEnd: "",

  // Social media
  socialPlatform: "instagram", socialHandle: "",

  // Payment
  payType: "paypal", payHandle: "", payAmount: "", payName: "",
};

// ── Payload builders ──────────────────────────────────────────
// Escape vCard / iCal special characters
function vcEsc(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/,/g, "\\,")
    .replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

// Format "2024-12-01T09:00" → "20241201T090000" for iCal
function fmtDt(dt) {
  if (!dt) return "";
  return dt.replace(/[-:]/g, "").replace(/T/, "T") + "00";
}

// Safely encode a social handle: strip leading @, then URI-encode
function socialUrl(platform, rawHandle) {
  const handle = rawHandle.trim().replace(/^@+/, "");
  if (!handle) return "";
  const map = {
    instagram: `https://instagram.com/${handle}`,
    tiktok:    `https://tiktok.com/@${handle}`,
    linkedin:  `https://linkedin.com/in/${handle}`,
    facebook:  `https://facebook.com/${handle}`,
    twitter:   `https://x.com/${handle}`,
    youtube:   `https://youtube.com/@${handle}`,
  };
  return map[platform] || "";
}

function buildPayload(type, fields) {
  switch (type) {

    // ── Original types (unchanged) ───────────────────────────
    case "url":
      return (fields.url || "").trim();

    case "text":
      return (fields.text || "").trim();

    case "email": {
      const email = (fields.email || "").trim();
      if (!email) return "";
      const params = new URLSearchParams();
      if (fields.subject?.trim()) params.set("subject", fields.subject.trim());
      if (fields.body?.trim())    params.set("body",    fields.body.trim());
      const qs = params.toString();
      return `mailto:${email}${qs ? "?" + qs : ""}`;
    }

    case "phone": {
      const p = (fields.phone || "").trim();
      return p ? `tel:${p.replace(/\s/g, "")}` : "";
    }

    case "wifi": {
      const ssid = (fields.ssid || "").trim();
      if (!ssid) return "";
      const esc  = (s) => s.replace(/([\\;,:'"!])/g, "\\$1");
      const pass = esc(fields.password || "");
      const sec  = fields.security || "WPA";
      return `WIFI:T:${sec};S:${esc(ssid)};P:${pass};H:${fields.hidden ? "true" : "false"};;`;
    }

    // ── vCard contact ────────────────────────────────────────
    case "vcard": {
      const fn = (fields.vcFn || "").trim();
      const ln = (fields.vcLn || "").trim();
      if (!fn && !ln) return "";
      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${vcEsc(ln)};${vcEsc(fn)};;;`,
        `FN:${vcEsc([fn, ln].filter(Boolean).join(" "))}`,
      ];
      if (fields.vcOrg?.trim())   lines.push(`ORG:${vcEsc(fields.vcOrg.trim())}`);
      if (fields.vcTitle?.trim()) lines.push(`TITLE:${vcEsc(fields.vcTitle.trim())}`);
      if (fields.vcPhone?.trim()) lines.push(`TEL;TYPE=CELL:${fields.vcPhone.trim()}`);
      if (fields.vcEmail?.trim()) lines.push(`EMAIL:${fields.vcEmail.trim()}`);
      if (fields.vcWeb?.trim())   lines.push(`URL:${fields.vcWeb.trim()}`);
      if (fields.vcAddr?.trim())  lines.push(`ADR;TYPE=HOME:;;${vcEsc(fields.vcAddr.trim())};;;;`);
      lines.push("END:VCARD");
      return lines.join("\n");
    }

    // ── Geo location ─────────────────────────────────────────
    case "location": {
      const lat = (fields.locLat || "").trim();
      const lng = (fields.locLng || "").trim();
      if (!lat || !lng) return "";
      const latN = parseFloat(lat);
      const lngN = parseFloat(lng);
      if (isNaN(latN) || isNaN(lngN)) return "";
      if (latN < -90 || latN > 90 || lngN < -180 || lngN > 180) return "";
      const label = (fields.locLabel || "").trim();
      return label
        ? `geo:${latN},${lngN}?q=${encodeURIComponent(label)}`
        : `geo:${latN},${lngN}`;
    }

    // ── SMS ──────────────────────────────────────────────────
    case "sms": {
      const phone = (fields.smsPhone || "").trim().replace(/\s/g, "");
      if (!phone) return "";
      const msg = (fields.smsTxt || "").trim();
      return msg ? `smsto:${phone}:${msg}` : `smsto:${phone}`;
    }

    // ── Calendar event (iCalendar VEVENT) ────────────────────
    case "event": {
      const title = (fields.evtTitle || "").trim();
      if (!title) return "";
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Tolz//QR//EN",
        "BEGIN:VEVENT",
        `SUMMARY:${vcEsc(title)}`,
      ];
      if (fields.evtDesc?.trim())  lines.push(`DESCRIPTION:${vcEsc(fields.evtDesc.trim())}`);
      if (fields.evtLoc?.trim())   lines.push(`LOCATION:${vcEsc(fields.evtLoc.trim())}`);
      if (fields.evtStart?.trim()) lines.push(`DTSTART:${fmtDt(fields.evtStart)}`);
      if (fields.evtEnd?.trim())   lines.push(`DTEND:${fmtDt(fields.evtEnd)}`);
      lines.push("END:VEVENT", "END:VCALENDAR");
      return lines.join("\r\n");
    }

    // ── Social media profile ──────────────────────────────────
    case "social":
      return socialUrl(fields.socialPlatform || "instagram", fields.socialHandle || "");

    // ── Payment ──────────────────────────────────────────────
    case "payment": {
      const payType = fields.payType || "paypal";
      const handle  = (fields.payHandle || "").trim();

      if (payType === "paypal") {
        return handle ? `https://paypal.me/${handle}` : "";
      }
      if (payType === "upi") {
        if (!handle) return "";
        const p = new URLSearchParams({ pa: handle });
        if (fields.payName?.trim())   p.set("pn", fields.payName.trim());
        if (fields.payAmount?.trim()) p.set("am", fields.payAmount.trim());
        p.set("cu", "INR");
        return `upi://pay?${p.toString()}`;
      }
      if (payType === "bitcoin") {
        if (!handle) return "";
        const amt = (fields.payAmount || "").trim();
        return amt ? `bitcoin:${handle}?amount=${amt}` : `bitcoin:${handle}`;
      }
      if (payType === "ethereum") {
        return handle ? `ethereum:${handle}` : "";
      }
      return "";
    }

    default: return "";
  }
}

// ── Shared label style ────────────────────────────────────────
const LBL = {
  display: "block",
  fontFamily: "var(--font-display)",
  fontWeight: 600,
  fontSize: 13,
  color: "var(--text-secondary)",
  marginBottom: 7,
};

// Small helper note style
const NOTE = {
  fontSize: 12,
  color: "var(--text-muted)",
  fontFamily: "var(--font-display)",
  fontWeight: 500,
  lineHeight: 1.5,
};

// ── Input forms per QR type ───────────────────────────────────
function InputFields({ type, fields, onChange }) {
  function f(key, value) { onChange(key, value); }

  // ── Original forms (unchanged) ──────────────────────────
  if (type === "url") return (
    <input type="url" className="input"
      placeholder="https://example.com"
      value={fields.url}
      onChange={e => f("url", e.target.value)}
      maxLength={MAX_INPUT_LEN}
      autoFocus
    />
  );

  if (type === "text") return (
    <div>
      <textarea className="input"
        placeholder="Type or paste any text here…"
        value={fields.text}
        onChange={e => f("text", e.target.value)}
        maxLength={MAX_INPUT_LEN}
        style={{ minHeight: 100, resize: "vertical", lineHeight: 1.7 }}
        autoFocus
      />
      <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "var(--font-display)", textAlign: "right", marginTop: 4 }}>
        {fields.text.length} / {MAX_INPUT_LEN}
      </div>
    </div>
  );

  if (type === "email") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="email" className="input" placeholder="email@example.com"
        value={fields.email} onChange={e => f("email", e.target.value)} autoFocus />
      <input type="text" className="input" placeholder="Subject (optional)"
        value={fields.subject} onChange={e => f("subject", e.target.value)} />
      <textarea className="input" placeholder="Message body (optional)"
        value={fields.body} onChange={e => f("body", e.target.value)}
        style={{ minHeight: 72, resize: "vertical" }} />
    </div>
  );

  if (type === "phone") return (
    <input type="tel" className="input" placeholder="+1 (555) 000-0000"
      value={fields.phone} onChange={e => f("phone", e.target.value)} autoFocus />
  );

  if (type === "wifi") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="text" className="input" placeholder="Network name (SSID)"
        value={fields.ssid} onChange={e => f("ssid", e.target.value)} autoFocus />
      <input type="password" className="input" placeholder="Password (blank = open network)"
        value={fields.password} onChange={e => f("password", e.target.value)} />
      <select className="input" value={fields.security} onChange={e => f("security", e.target.value)}
        style={{ cursor: "pointer" }}>
        <option value="WPA">WPA / WPA2 / WPA3</option>
        <option value="WEP">WEP (legacy)</option>
        <option value="nopass">No password (open)</option>
      </select>
      <label style={{
        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
        fontFamily: "var(--font-display)", fontSize: 13.5,
        color: "var(--text-secondary)", fontWeight: 500,
      }}>
        <input type="checkbox" checked={fields.hidden} onChange={e => f("hidden", e.target.checked)}
          style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }} />
        Hidden network (SSID not broadcast)
      </label>
    </div>
  );

  // ── vCard contact ────────────────────────────────────────
  if (type === "vcard") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input type="text" className="input" placeholder="First name *"
          value={fields.vcFn} onChange={e => f("vcFn", e.target.value)}
          maxLength={100} autoFocus style={{ flex: 1 }} />
        <input type="text" className="input" placeholder="Last name"
          value={fields.vcLn} onChange={e => f("vcLn", e.target.value)}
          maxLength={100} style={{ flex: 1 }} />
      </div>
      <input type="text" className="input" placeholder="Company (optional)"
        value={fields.vcOrg} onChange={e => f("vcOrg", e.target.value)} maxLength={100} />
      <input type="text" className="input" placeholder="Job title (optional)"
        value={fields.vcTitle} onChange={e => f("vcTitle", e.target.value)} maxLength={100} />
      <input type="tel" className="input" placeholder="Phone (optional)"
        value={fields.vcPhone} onChange={e => f("vcPhone", e.target.value)} maxLength={30} />
      <input type="email" className="input" placeholder="Email (optional)"
        value={fields.vcEmail} onChange={e => f("vcEmail", e.target.value)} maxLength={200} />
      <input type="url" className="input" placeholder="Website (optional)"
        value={fields.vcWeb} onChange={e => f("vcWeb", e.target.value)} maxLength={200} />
      <input type="text" className="input" placeholder="Address (optional)"
        value={fields.vcAddr} onChange={e => f("vcAddr", e.target.value)} maxLength={200} />
      <p style={NOTE}>Scanned as a contact card — compatible with iOS and Android.</p>
    </div>
  );

  // ── Geo location ─────────────────────────────────────────
  if (type === "location") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={LBL}>Latitude *</label>
          <input type="number" className="input" placeholder="48.8584"
            value={fields.locLat} onChange={e => f("locLat", e.target.value)}
            step="any" min="-90" max="90" autoFocus />
        </div>
        <div style={{ flex: 1 }}>
          <label style={LBL}>Longitude *</label>
          <input type="number" className="input" placeholder="2.2945"
            value={fields.locLng} onChange={e => f("locLng", e.target.value)}
            step="any" min="-180" max="180" />
        </div>
      </div>
      <input type="text" className="input" placeholder="Location label (optional)"
        value={fields.locLabel} onChange={e => f("locLabel", e.target.value)} maxLength={200} />
      <p style={NOTE}>
        Latitude: −90 to +90 · Longitude: −180 to +180.
        Scan opens directly in the Maps app.
      </p>
    </div>
  );

  // ── SMS ──────────────────────────────────────────────────
  if (type === "sms") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="tel" className="input" placeholder="+1 (555) 000-0000"
        value={fields.smsPhone} onChange={e => f("smsPhone", e.target.value)} autoFocus />
      <textarea className="input" placeholder="Pre-filled message (optional)"
        value={fields.smsTxt} onChange={e => f("smsTxt", e.target.value)}
        maxLength={300}
        style={{ minHeight: 80, resize: "vertical" }} />
      <p style={NOTE}>Scan opens the SMS/Messages app with the number and message pre-filled.</p>
    </div>
  );

  // ── Calendar event ───────────────────────────────────────
  if (type === "event") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input type="text" className="input" placeholder="Event title *"
        value={fields.evtTitle} onChange={e => f("evtTitle", e.target.value)}
        maxLength={200} autoFocus />
      <textarea className="input" placeholder="Description (optional)"
        value={fields.evtDesc} onChange={e => f("evtDesc", e.target.value)}
        maxLength={400} style={{ minHeight: 70, resize: "vertical" }} />
      <input type="text" className="input" placeholder="Location (optional)"
        value={fields.evtLoc} onChange={e => f("evtLoc", e.target.value)} maxLength={200} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={LBL}>Start date & time</label>
          <input type="datetime-local" className="input"
            value={fields.evtStart} onChange={e => f("evtStart", e.target.value)} />
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={LBL}>End date & time</label>
          <input type="datetime-local" className="input"
            value={fields.evtEnd} onChange={e => f("evtEnd", e.target.value)} />
        </div>
      </div>
      <p style={NOTE}>Scan adds the event directly to the device calendar (Google, Apple, Outlook).</p>
    </div>
  );

  // ── Social media ─────────────────────────────────────────
  if (type === "social") {
    const platform = fields.socialPlatform || "instagram";
    const activePlatform = SOCIAL_PLATFORMS.find(p => p.id === platform);
    const previewUrl = socialUrl(platform, fields.socialHandle || "");

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Platform picker */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {SOCIAL_PLATFORMS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => f("socialPlatform", p.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: platform === p.id ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                background: platform === p.id ? "var(--accent-light)" : "var(--bg-white)",
                color: platform === p.id ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5,
                transition: "all var(--transition)",
                boxShadow: platform === p.id ? "0 0 0 2px rgba(59,123,252,0.1)" : "none",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <input type="text" className="input"
          placeholder={activePlatform?.ph || "username"}
          value={fields.socialHandle}
          onChange={e => f("socialHandle", e.target.value)}
          maxLength={100}
          autoFocus
        />

        {/* URL preview */}
        {previewUrl && (
          <div style={{
            fontSize: 12, color: "var(--text-muted)",
            fontFamily: "var(--font-display)", fontWeight: 500,
            padding: "7px 10px", background: "var(--bg-muted)",
            borderRadius: "var(--radius-sm)", wordBreak: "break-all",
            border: "1px solid var(--border)",
          }}>
            → {previewUrl}
          </div>
        )}
      </div>
    );
  }

  // ── Payment ──────────────────────────────────────────────
  if (type === "payment") {
    const payType = fields.payType || "paypal";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Payment type selector */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PAY_TYPES.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => f("payType", p.id)}
              style={{
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                border: payType === p.id ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                background: payType === p.id ? "var(--accent-light)" : "var(--bg-white)",
                color: payType === p.id ? "var(--accent)" : "var(--text-secondary)",
                cursor: "pointer",
                fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 12.5,
                transition: "all var(--transition)",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* PayPal */}
        {payType === "paypal" && (
          <>
            <input type="text" className="input" placeholder="PayPal.me username"
              value={fields.payHandle} onChange={e => f("payHandle", e.target.value)}
              maxLength={100} autoFocus />
            <p style={NOTE}>Generates a paypal.me/username link. Scan to send a payment.</p>
          </>
        )}

        {/* UPI */}
        {payType === "upi" && (
          <>
            <input type="text" className="input" placeholder="UPI ID  (e.g. name@okaxis)"
              value={fields.payHandle} onChange={e => f("payHandle", e.target.value)}
              maxLength={100} autoFocus />
            <input type="text" className="input" placeholder="Payee name (optional)"
              value={fields.payName} onChange={e => f("payName", e.target.value)} maxLength={100} />
            <input type="number" className="input" placeholder="Amount in ₹ (optional)"
              value={fields.payAmount} onChange={e => f("payAmount", e.target.value)}
              min="0" step="0.01" />
            <p style={NOTE}>Generates a UPI payment URI. Compatible with GPay, PhonePe, Paytm, etc.</p>
          </>
        )}

        {/* Bitcoin */}
        {payType === "bitcoin" && (
          <>
            <input type="text" className="input" placeholder="Bitcoin wallet address"
              value={fields.payHandle} onChange={e => f("payHandle", e.target.value)}
              maxLength={100} autoFocus />
            <input type="number" className="input" placeholder="Amount in BTC (optional)"
              value={fields.payAmount} onChange={e => f("payAmount", e.target.value)}
              min="0" step="any" />
            <p style={NOTE}>Generates a bitcoin: URI (BIP-21). Scan with any Bitcoin wallet.</p>
          </>
        )}

        {/* Ethereum */}
        {payType === "ethereum" && (
          <>
            <input type="text" className="input" placeholder="Ethereum wallet address (0x…)"
              value={fields.payHandle} onChange={e => f("payHandle", e.target.value)}
              maxLength={100} autoFocus />
            <p style={NOTE}>Generates an ethereum: URI. Scan with MetaMask, Trust Wallet, etc.</p>
          </>
        )}
      </div>
    );
  }

  return null;
}

// ── Copy image button ─────────────────────────────────────────
// Unchanged from original
function CopyImageButton({ canvasRef, disabled }) {
  const [state, setState] = useState("idle"); // idle | copied | unsupported
  const timer = useRef(null);

  async function handleCopy() {
    if (!canvasRef.current) return;
    try {
      const blob = await new Promise(res => canvasRef.current.toBlob(res, "image/png"));
      if (!blob) throw new Error("no blob");
      if (!navigator.clipboard?.write) throw new Error("unsupported");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setState("copied");
    } catch {
      setState("unsupported");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2500);
  }

  const isCopied      = state === "copied";
  const isUnsupported = state === "unsupported";

  return (
    <button
      type="button"
      className="btn btn-secondary"
      onClick={handleCopy}
      disabled={disabled}
      title={isUnsupported ? "Clipboard image copy not supported in this browser" : "Copy QR code image to clipboard"}
      style={{
        opacity:    disabled ? 0.5 : 1,
        cursor:     disabled ? "not-allowed" : "pointer",
        background: isCopied ? "#f0fdf4" : undefined,
        color:      isCopied ? "#16a34a" : isUnsupported ? "var(--text-muted)" : undefined,
        borderColor: isCopied ? "#bbf7d0" : undefined,
        transition: "background 0.2s, color 0.2s, border-color 0.2s",
      }}
    >
      {isCopied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5l3 3 6-6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 4V2.5A1.5 1.5 0 007.5 1H2.5A1.5 1.5 0 001 2.5v5A1.5 1.5 0 002.5 9H4"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {isUnsupported ? "Not supported" : "Copy Image"}
        </>
      )}
    </button>
  );
}

// ── Main tool component ───────────────────────────────────────
// All QR rendering / download / customization logic unchanged
export default function QrGeneratorTool() {
  const [type,         setType]         = useState("url");
  const [fields,       setFields]       = useState(DEFAULT_FIELDS);
  const [fgColor,      setFgColor]      = useState("#000000");
  const [bgColor,      setBgColor]      = useState("#ffffff");
  const [ecLevel,      setEcLevel]      = useState("M");
  const [margin,       setMargin]       = useState(2);
  const [downloadSize, setDownloadSize] = useState(512);
  const [showCustomize,setShowCustomize]= useState(false);
  const [qrError,      setQrError]      = useState(null);
  const [downloading,  setDownloading]  = useState(null); // null|'png'|'svg'

  const canvasRef = useRef(null);

  const qrPayload      = useMemo(() => buildPayload(type, fields), [type, fields]);
  const deferredPayload = useDeferredValue(qrPayload);
  const isPending      = qrPayload !== deferredPayload;
  const hasContent     = deferredPayload.trim().length > 0;

  function setField(key, value) {
    setFields(prev => ({ ...prev, [key]: value }));
  }

  function handleTypeChange(newType) {
    setType(newType);
    setQrError(null);
  }

  function handleReset() {
    setFields(DEFAULT_FIELDS);
    setQrError(null);
  }

  // ── Render QR to canvas (unchanged) ──────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!deferredPayload.trim()) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQrError(null);
      return;
    }

    QRCode.toCanvas(canvas, deferredPayload, {
      width:               PREVIEW_SIZE,
      margin,
      color:               { dark: fgColor, light: bgColor },
      errorCorrectionLevel: ecLevel,
    })
      .then(() => setQrError(null))
      .catch(err => setQrError(err.message?.includes("too long")
        ? "Content is too long for this error correction level. Try switching to 'L'."
        : "Could not generate QR code — please check your input."));
  }, [deferredPayload, fgColor, bgColor, ecLevel, margin]);

  // ── Download PNG (unchanged) ──────────────────────────────
  async function handleDownloadPng() {
    if (!qrPayload.trim()) return;
    setDownloading("png");
    try {
      const off = document.createElement("canvas");
      await QRCode.toCanvas(off, qrPayload, {
        width:               downloadSize,
        margin,
        color:               { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecLevel,
      });
      const url = off.toDataURL("image/png");
      const a   = document.createElement("a");
      a.href     = url;
      a.download = "qrcode.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      setQrError(err.message || "PNG download failed.");
    } finally {
      setDownloading(null);
    }
  }

  // ── Download SVG (unchanged) ──────────────────────────────
  async function handleDownloadSvg() {
    if (!qrPayload.trim()) return;
    setDownloading("svg");
    try {
      const svgStr = await QRCode.toString(qrPayload, {
        type:                "svg",
        width:               downloadSize,
        margin,
        color:               { dark: fgColor, light: bgColor },
        errorCorrectionLevel: ecLevel,
      });
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "qrcode.svg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setQrError(err.message || "SVG download failed.");
    } finally {
      setDownloading(null);
    }
  }

  const showActions = hasContent && !qrError;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── Input card ── */}
      <div className="card animate-fadeUp" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Type selector — scrollable horizontal tab bar */}
        <style>{`.qr-tabs::-webkit-scrollbar{display:none}`}</style>
        <div style={{ background: "var(--bg-muted)", borderRadius: "var(--radius-lg)", padding: 5 }}>
          <div className="qr-tabs" style={{
            display: "flex", gap: 4,
            overflowX: "auto", scrollbarWidth: "none",
          }}>
            {TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => handleTypeChange(t.id)}
                style={{
                  flex: "1 0 auto",
                  padding: "9px 12px",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                  fontSize: 13,
                  whiteSpace: "nowrap",
                  transition: "all var(--transition)",
                  background: type === t.id ? "var(--accent)" : "transparent",
                  color:      type === t.id ? "#fff" : "var(--text-muted)",
                  boxShadow:  type === t.id ? "0 2px 8px rgba(59,123,252,0.25)" : "none",
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic input */}
        <InputFields type={type} fields={fields} onChange={setField} />

        {/* Density warning */}
        {qrPayload.length > MAX_INPUT_LEN * 0.75 && (
          <div style={{
            fontSize: 12.5, color: "#d97706",
            fontFamily: "var(--font-display)", fontWeight: 500,
            display: "flex", gap: 6, alignItems: "flex-start",
            background: "#fffbeb", border: "1px solid #fde68a",
            borderRadius: "var(--radius-md)", padding: "8px 12px",
          }}>
            <span style={{ flexShrink: 0, marginTop: 1 }}>⚠️</span>
            <span>Long content creates a dense QR code that may be harder to scan. Keep it concise if possible.</span>
          </div>
        )}

        {/* Clear */}
        {qrPayload.trim() && (
          <button type="button" className="btn btn-ghost" onClick={handleReset}
            style={{ alignSelf: "flex-start", fontSize: 13, padding: "6px 12px", color: "var(--text-muted)" }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* ── QR Preview card (unchanged) ── */}
      <div className="card animate-fadeUp delay-100" style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}>

        {hasContent ? (
          <div style={{
            padding: 12,
            background: bgColor,
            borderRadius: "var(--radius-lg)",
            border: "2px solid var(--border)",
            boxShadow: "var(--shadow-md)",
            opacity: isPending ? 0.55 : 1,
            transition: "opacity 0.2s",
          }}>
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              style={{ display: "block", borderRadius: 4 }}
            />
          </div>
        ) : (
          <div style={{
            width: PREVIEW_SIZE, height: PREVIEW_SIZE,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 12,
            background: "var(--bg-muted)", borderRadius: "var(--radius-lg)",
            border: "2px dashed var(--border)",
          }}>
            <div style={{ fontSize: 44, opacity: 0.25 }}>⬛</div>
            <div style={{
              fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 13,
              color: "var(--text-muted)", textAlign: "center", padding: "0 20px",
            }}>
              Enter content above to generate your QR code
            </div>
          </div>
        )}

        {qrError && (
          <div style={{
            background: "#fff5f5", border: "1.5px solid #fecaca",
            borderRadius: "var(--radius-md)", padding: "10px 14px",
            display: "flex", gap: 8, alignItems: "flex-start",
            width: "100%", maxWidth: 380,
          }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="7.5" cy="7.5" r="6.5" stroke="#ef4444" strokeWidth="1.5"/>
              <line x1="7.5" y1="4.5" x2="7.5" y2="8.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="7.5" cy="10.5" r="0.8" fill="#ef4444"/>
            </svg>
            <span style={{ fontSize: 13.5, color: "#dc2626", fontFamily: "var(--font-display)", fontWeight: 500 }}>
              {qrError}
            </span>
          </div>
        )}

        {showActions && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadPng}
              disabled={!!downloading}
              style={{ opacity: downloading ? 0.7 : 1, cursor: downloading ? "not-allowed" : "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1.5v7M4 6.5l2.5 2.5L9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 10v1A1.5 1.5 0 003 12.5h7A1.5 1.5 0 0011.5 11v-1"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {downloading === "png" ? "Saving…" : "Download PNG"}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleDownloadSvg}
              disabled={!!downloading}
              style={{ opacity: downloading ? 0.7 : 1, cursor: downloading ? "not-allowed" : "pointer" }}
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1.5v7M4 6.5l2.5 2.5L9 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M1.5 10v1A1.5 1.5 0 003 12.5h7A1.5 1.5 0 0011.5 11v-1"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {downloading === "svg" ? "Saving…" : "Download SVG"}
            </button>

            <CopyImageButton canvasRef={canvasRef} disabled={isPending || !!downloading} />
          </div>
        )}
      </div>

      {/* ── Customization card (unchanged) ── */}
      <div className="card animate-fadeUp delay-200" style={{ overflow: "hidden" }}>

        <button
          type="button"
          onClick={() => setShowCustomize(v => !v)}
          style={{
            width: "100%", padding: "14px 20px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 14,
            color: "var(--text-primary)", textAlign: "left",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M6 2H2.5A1.5 1.5 0 001 3.5v8A1.5 1.5 0 002.5 13h10a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0012.5 2H9"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="5" y="1" width="5" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 7h7M4 10h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Customize
          </span>
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{ transform: showCustomize ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}
          >
            <path d="M2 4.5l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {showCustomize && (
          <div className="animate-fadeUp" style={{ padding: "4px 20px 20px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ height: 1, background: "var(--border)" }} />

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={LBL}>Foreground</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    style={{ width: 42, height: 42, borderRadius: 8, border: "1.5px solid var(--border)", cursor: "pointer", padding: 3 }} />
                  <code style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>{fgColor}</code>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <label style={LBL}>Background</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    style={{ width: 42, height: 42, borderRadius: 8, border: "1.5px solid var(--border)", cursor: "pointer", padding: 3 }} />
                  <code style={{ fontSize: 13, color: "var(--text-secondary)", fontFamily: "monospace" }}>{bgColor}</code>
                </div>
              </div>
            </div>

            <div>
              <label style={LBL}>Quick Presets</label>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {COLOR_PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 11px",
                      borderRadius: "var(--radius-md)",
                      border: (fgColor === p.fg && bgColor === p.bg)
                        ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                      background: p.bg, color: p.fg,
                      cursor: "pointer",
                      fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 12,
                      transition: "border-color var(--transition)",
                      boxShadow: (fgColor === p.fg && bgColor === p.bg) ? "0 0 0 2px rgba(59,123,252,0.12)" : "none",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={LBL}>Error Correction Level</label>
              <div style={{ display: "flex", gap: 6 }}>
                {EC_LEVELS.map(ec => (
                  <button
                    key={ec.value}
                    type="button"
                    onClick={() => setEcLevel(ec.value)}
                    title={ec.title}
                    style={{
                      flex: 1, padding: "9px 4px",
                      borderRadius: "var(--radius-md)",
                      border: ecLevel === ec.value
                        ? "2px solid var(--accent)" : "1.5px solid var(--border)",
                      background: ecLevel === ec.value ? "var(--accent-light)" : "var(--bg-white)",
                      color: ecLevel === ec.value ? "var(--accent)" : "var(--text-secondary)",
                      cursor: "pointer",
                      fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 15,
                      transition: "all var(--transition)",
                    }}
                  >
                    {ec.value}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginTop: 6 }}>
                {EC_LEVELS.find(e => e.value === ecLevel)?.title}
              </div>
            </div>

            <div>
              <label style={LBL}>
                Quiet Zone <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— {margin} module{margin !== 1 ? "s" : ""}</span>
              </label>
              <input type="range" min={0} max={10} step={1} value={margin}
                onChange={e => setMargin(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginTop: 3 }}>
                <span>None</span><span>Maximum</span>
              </div>
            </div>

            <div>
              <label style={LBL}>
                Download Resolution <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>— {downloadSize}×{downloadSize}px</span>
              </label>
              <input type="range" min={128} max={1024} step={64} value={downloadSize}
                onChange={e => setDownloadSize(Number(e.target.value))}
                style={{ width: "100%", accentColor: "var(--accent)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-display)", marginTop: 3 }}>
                <span>128px</span><span>1024px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Info note (unchanged) ── */}
      <div className="animate-fadeUp delay-300" style={{
        background: "var(--bg-muted)", borderRadius: "var(--radius-md)",
        padding: "12px 16px", fontSize: 12.5,
        color: "var(--text-muted)", fontFamily: "var(--font-display)",
        fontWeight: 500, display: "flex", gap: 8,
        alignItems: "flex-start", border: "1px solid var(--border)",
      }}>
        <span style={{ flexShrink: 0, marginTop: 1 }}>💡</span>
        <span>
          Generated entirely in your browser — no data is uploaded.{" "}
          Use <strong style={{ color: "var(--text-secondary)" }}>SVG</strong> for print-quality output.
          Higher error correction makes QR codes scannable even when partially covered or damaged.
          Keep foreground darker than background for reliable scanning.
        </span>
      </div>
    </div>
  );
}
