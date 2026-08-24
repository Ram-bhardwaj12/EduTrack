// Deterministic subject-coded colors for course tiles, cycling through a small
// fixed palette so the same course always gets the same color.
const PALETTE = [
  { headerBg: "#4463C4", spine: "#4463C4", tint: "#EEF2FD" }, // blue
  { headerBg: "#31A390", spine: "#31A390", tint: "#E6F6F3" }, // teal
  { headerBg: "#C86943", spine: "#C86943", tint: "#FBF0EC" }, // terracotta
  { headerBg: "#7C53C5", spine: "#7C53C5", tint: "#F3EDFC" }, // purple
  { headerBg: "#D4952A", spine: "#D4952A", tint: "#FAF3E6" }, // gold
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function colorFor(id) {
  const idx = hashString(String(id)) % PALETTE.length;
  return PALETTE[idx];
}

export function initials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
