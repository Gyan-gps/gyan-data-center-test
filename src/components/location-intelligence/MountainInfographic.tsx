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

interface MountainInfographicProps {
  data: BarData[];
  tooltipFields: TooltipField[];
}

const ROW_COLORS = [
  { peak: "#3AAEDC", dark: "#1A7FAD", light: "#A8DEFF" },
  { peak: "#1AC8A0", dark: "#0E8A6E", light: "#8EEEDD" },
  { peak: "#88C840", dark: "#5A9020", light: "#C8EE90" },
  { peak: "#E8A020", dark: "#B07010", light: "#FDDEA0" },
  { peak: "#E84040", dark: "#A82020", light: "#FFAAAA" },
  { peak: "#9848CC", dark: "#6820A0", light: "#D8AAFF" },
];

const PIN_SIZE = 56;

const LocationPin: React.FC<{ color: string; label: string | number }> = ({
  color,
  label,
}) => {
  // Format large numbers with commas if they aren't string.
  // Let's also round to 1 decimal to avoid too long strings in the pin.
  const formattedLabel =
    typeof label === "number"
      ? (label % 1 !== 0 ? label.toFixed(1) : label)
          .toString()
          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : label;

  return (
    <svg
      width={PIN_SIZE}
      height={PIN_SIZE + 10}
      viewBox="0 0 56 66"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Pin circle */}
      <circle
        cx="28"
        cy="28"
        r="26"
        fill="#fff"
        stroke={color}
        strokeWidth="2.5"
      />
      <circle cx="28" cy="28" r="20" fill={color} opacity="0.15" />
      {/* Pin tail */}
      <path d="M28 54 L22 41 Q28 46 34 41 Z" fill={color} />
      {/* Label */}
      <text
        x="28"
        y="32"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontSize="10"
        fontWeight="700"
        fill={color}
      >
        {formattedLabel}
      </text>
    </svg>
  );
};

const MountainSpike: React.FC<{
  item: BarData;
  index: number;
  maxValue: number;
  tooltipFields: TooltipField[];
}> = ({ item, index, maxValue, tooltipFields }) => {
  const [hovered, setHovered] = useState(false);
  const color = ROW_COLORS[index % ROW_COLORS.length];

  const MAX_HEIGHT = 200;
  const MIN_HEIGHT = 70;
  const spikeHeight =
    MIN_HEIGHT + (item.value / maxValue) * (MAX_HEIGHT - MIN_HEIGHT);
  const spikeWidth = 80;

  // Format pin label — show value with K/M suffix if large
  const pinLabel =
    item.value >= 1000 ? `${(item.value / 1000).toFixed(0)}K` : `${item.value}`;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
        flex: 1,
        minWidth: 0,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hover tooltip */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: `${spikeHeight + PIN_SIZE + 20}px`,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            padding: "10px 14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.13)",
            zIndex: 9999,
            // minWidth: 180,
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
                background: color.peak,
                color: "#fff",
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
                  {val}
                  {f.suffix ?? ""}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Pin on top */}
      <div style={{ marginBottom: -6, zIndex: 2 }}>
        <LocationPin color={color.peak} label={item.value} />
      </div>

      {/* Mountain spike SVG */}
      <svg
        width="100%"
        height={spikeHeight}
        viewBox={`0 0 ${spikeWidth} ${spikeHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", cursor: "pointer" }}
      >
        <defs>
          {/* Left face — lighter */}
          <linearGradient id={`lg-left-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color.light} />
            <stop offset="100%" stopColor={color.peak} />
          </linearGradient>
          {/* Right face — darker */}
          <linearGradient id={`lg-right-${index}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color.peak} />
            <stop offset="100%" stopColor={color.dark} />
          </linearGradient>
        </defs>

        {/* Left face of mountain */}
        <path
          d={`M ${spikeWidth / 2} 0 L 0 ${spikeHeight} L ${spikeWidth / 2} ${spikeHeight * 0.75} Z`}
          fill={`url(#lg-left-${index})`}
        />
        {/* Right face of mountain */}
        <path
          d={`M ${spikeWidth / 2} 0 L ${spikeWidth} ${spikeHeight} L ${spikeWidth / 2} ${spikeHeight * 0.75} Z`}
          fill={`url(#lg-right-${index})`}
        />
        {/* Base curve — left swoop */}
        <path
          d={`M 0 ${spikeHeight} Q ${spikeWidth * 0.15} ${spikeHeight * 0.82} ${spikeWidth / 2} ${spikeHeight * 0.75}`}
          fill="none"
          stroke={color.light}
          strokeWidth="1.5"
        />
        {/* Base curve — right swoop */}
        <path
          d={`M ${spikeWidth} ${spikeHeight} Q ${spikeWidth * 0.85} ${spikeHeight * 0.82} ${spikeWidth / 2} ${spikeHeight * 0.75}`}
          fill="none"
          stroke={color.dark}
          strokeWidth="1.5"
        />
      </svg>

      {/* Label below */}
      <div
        style={{
          marginTop: 10,
          textAlign: "center",
          padding: "0 4px",
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            marginBottom: 3,
          }}
        >
          {/* <span style={{ width: 8, height: 8, borderRadius: "50%", background: color.peak, display: "inline-block", flexShrink: 0 }} /> */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: color.peak,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 50,
            }}
          >
            {item.label}
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#9ca3af",
            lineHeight: 1.4,
            maxWidth: 100,
          }}
        >
          {tooltipFields
            .map((f) => {
              const val = item[f.key];
              if (val == null || val === "" || val === 0) return null;
              return `${val}${f.suffix ?? ""}`;
            })
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    </div>
  );
};

export const MountainInfographic: React.FC<MountainInfographicProps> = ({
  data,
  tooltipFields,
}) => {
  const items = data.slice(0, 6);
  const maxValue = Math.max(...items.map((d) => d.value), 1);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "visible",
        minHeight: 300,
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
        <>
          {/* Mountains row */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 4,
              padding: "0 8px",
              overflow: "visible",
              paddingBottom: 80, // Space for absolute text below
            }}
          >
            {items.map((item, i) => (
              <MountainSpike
                key={i}
                item={item}
                index={i}
                maxValue={maxValue}
                tooltipFields={tooltipFields}
              />
            ))}
          </div>

          {/* Base line */}
          {/* <div style={{ height: 2, background: "#e5e7eb", borderRadius: 1, margin: "0 8px" }} /> */}
        </>
      )}
    </div>
  );
};
