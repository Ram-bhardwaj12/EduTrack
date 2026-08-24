import React from "react";

export default function Logo({ size = "md" }) {
  const isLarge = size === "lg";
  const isSmall = size === "sm";

  const iconSize = isLarge ? 32 : isSmall ? 20 : 26;
  const fontSize = isLarge ? 20 : isSmall ? 15 : 17;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, userSelect: "none" }}>
      <div
        style={{
          width: iconSize,
          height: iconSize,
          borderRadius: 7,
          background: "#1E293B",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          width={iconSize * 0.55}
          height={iconSize * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>

      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: fontSize,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
        }}
      >
        Edu<span style={{ color: "#4463C4" }}>Track</span>
      </div>
    </div>
  );
}



