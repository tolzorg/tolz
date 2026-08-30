// A colored tile with a per-item emoji, standing in for the reference
// calculator's per-item game-render icons. Those icons are proprietary
// "Grow a Garden" (Roblox) game art and are not reproduced here — the
// emoji comes from growAGardenIcons.js's plantEmoji()/petEmoji() maps
// (a real Unicode emoji chosen for thematic fit per item, no copyright
// risk), and the background color is still a deterministic per-id hash
// for extra visual variety.

function hashHue(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return hash % 360;
}

export default function GrowAGardenIcon({ id, emoji = "🌱", size = 40 }) {
  const hue = hashHue(id);
  return (
    <div
      aria-hidden="true"
      style={{
        width: size, height: size, borderRadius: 8,
        background: `linear-gradient(135deg, hsl(${hue} 45% 28%), hsl(${hue} 45% 18%))`,
        border: "1px solid hsl(0 0% 100% / 0.08)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.5, flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}
