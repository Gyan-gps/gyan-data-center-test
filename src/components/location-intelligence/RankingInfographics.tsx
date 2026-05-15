import React, { useState } from "react";

interface BarData {
  [key: string]: string | number | undefined;
  label: string;
  value: number;
  sites?: number;
  site?: string;
  status?: string;
  rank?: number;
}

interface TooltipField {
  key: keyof BarData;
  label: string;
  suffix?: string;
  color?: string;
}

interface TrophyInfographicProps {
  data: BarData[];
  tooltipFields: TooltipField[];
}

const ROW_COLORS = [
  { bg: "#E85A2A", text: "#fff", sub: "#FFCFB8" },
  { bg: "#F0821A", text: "#fff", sub: "#FFD8A8" },
  { bg: "#E8B800", text: "#4A3200", sub: "#6B4A00" },
  { bg: "#3BAA55", text: "#fff", sub: "#C8F0D0" },
  { bg: "#1AA8A8", text: "#fff", sub: "#B0EEF0" },
  { bg: "#2468CC", text: "#fff", sub: "#B0CCFF" },
];

const TrophySVG: React.FC = () => (
  <svg viewBox="0 0 250 320" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M62 60 Q54 60 51 72 L46 130 Q44 165 72 182 Q90 191 110 193 L110 218 L88 224 L88 236 L162 236 L162 224 L140 218 L140 193 Q160 191 178 182 Q206 165 204 130 L199 72 Q196 60 188 60 Z"
      fill="#D4A017" stroke="#B8860B" strokeWidth="1.5"
    />
    <path d="M51 78 Q28 78 26 98 Q24 118 48 118" fill="none" stroke="#D4A017" strokeWidth="10" strokeLinecap="round"/>
    <path d="M199 78 Q222 78 224 98 Q226 118 202 118" fill="none" stroke="#D4A017" strokeWidth="10" strokeLinecap="round"/>
    <rect x="46" y="52" width="158" height="14" rx="5" fill="#C8960A" stroke="#A07800" strokeWidth="1"/>
    <path d="M78 74 Q84 64 98 67 Q90 86 78 74Z" fill="#F5D060" opacity="0.7"/>
    <polygon
      points="125,110 129,123 143,123 132,131 136,144 125,136 114,144 118,131 107,123 121,123"
      fill="#FFF0A0" stroke="#C8960A" strokeWidth="0.5"
    />
    <rect x="108" y="218" width="34" height="20" rx="3" fill="#C8960A" stroke="#A07800" strokeWidth="1"/>
    <rect x="88" y="236" width="74" height="12" rx="3" fill="#C8960A" stroke="#A07800" strokeWidth="1"/>
    <rect x="78" y="246" width="94" height="10" rx="3" fill="#B8860B" stroke="#A07800" strokeWidth="1"/>
    <rect x="68" y="254" width="114" height="10" rx="3" fill="#A07800" stroke="#8B6914" strokeWidth="1"/>
    </svg>
);

const ArrowBanner: React.FC<{
  item: BarData;
  index: number;
  tooltipFields: TooltipField[];
}> = ({ item, index, tooltipFields }) => {
  const [hovered, setHovered] = useState(false);
  const color = ROW_COLORS[index % ROW_COLORS.length];
  const num = String(index + 1).padStart(2, "0");

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          background: color.bg,
          clipPath: "polygon(0% 0%, 94% 0%, 100% 50%, 94% 100%, 0% 100%, 4% 50%)",
          padding: "10px 40px 10px 28px",
          cursor: "pointer",
          transition: "filter 0.15s",
          filter: hovered ? "brightness(1.1)" : "brightness(1)",
          minHeight: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: color.text,
            opacity: 0.9,
            minWidth: 28,
            fontFamily: "sans-serif",
          }}
        >
          {num}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: color.text,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {item.label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: color.sub,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {tooltipFields
              .map((f) => {
                const val = item[f.key];
                if (val == null || val === "" || val === 0) return null;
                return `${f.label}: ${val}${f.suffix ?? ""}`;
              })
              .filter(Boolean)
              .join("  ·  ")}
          </div>
        </div>
      </div>

      {hovered && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -110%)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
            zIndex: 50,
            minWidth: 180,
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #e5e7eb",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
              padding: "5px 8px",
              background: "#f8fafc",
              borderRadius: 8,
            }}
          >
            <span
              style={{
                background: color.bg,
                color: color.text,
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              #{index + 1}
            </span>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0f172a" }}>
              {item.label}
            </div>
          </div>
          {tooltipFields.map((f) => {
            const val = item[f.key];
            if (val == null || val === "") return null;
            return (
              <div
                key={f.key as string}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  fontSize: 11,
                  color: f.color ?? "#6b7280",
                  padding: "2px 0",
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                  {val}{f.suffix ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const TrophyInfographic: React.FC<TrophyInfographicProps> = ({
  data,
  tooltipFields,
}) => {
  const items = data.slice(0, 6);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "stretch",
        borderRadius: 12,
        overflow: "visible",
        minHeight: 300,
      }}
    >
      {/* Left: trophy */}
      <div
        style={{
          width: 120,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "8px 4px",
        }}
      >
        <div style={{ width: 110, height: 180 }}>
          <TrophySVG />
        </div>
      </div>

      {/* Right: arrow banners */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          minWidth: 0,
          overflow: "visible",
        }}
      >
        {items.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 13,
              padding: "40px 0",
            }}
          >
            No data found
          </div>
        ) : (
          items.map((item, i) => (
            <ArrowBanner key={i} item={item} index={i} tooltipFields={tooltipFields} />
          ))
        )}
      </div>
    </div>
  );
};