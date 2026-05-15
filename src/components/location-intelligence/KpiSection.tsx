import React from "react";
import type { LocationIntelligenceSummary } from "@/network/location-intelligence/location-intelligence.types";

const SparkLine: React.FC<{ points: number[] }> = ({ points }) => {
  const d = React.useMemo(() => {
    if (!points.length) return "";

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    return points
      .map((point, index) => {
        const x = (index / Math.max(points.length - 1, 1)) * 100;
        const normalized = (point - min) / range;
        const y = 24 - normalized * 16;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [points]);

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      className="w-16 h-6 text-blue-500 opacity-70"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
};

interface KpiCardProps {
  card: LocationIntelligenceSummary["cards"]["available"];
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, card }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
        {icon}
      </div>
      <span className="text-xs text-gray-400 font-medium">{card.label}</span>
    </div>
    <div className="flex items-baseline gap-1 flex-wrap">
      <span className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
        {card.value.toLocaleString()}
      </span>
      <span className="text-xs sm:text-sm text-gray-400">{card.unit}</span>
    </div>
    {card.showQoQ && (
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-100 bg-gray-50 px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
          {`${card.changeValue >= 0 ? "+" : ""}${card.changeValue}% ${card.changeLabel}`}
        </span>
        <SparkLine points={card.sparkline || []} />
      </div>
    )}
  </div>
);

interface KpiSectionProps {
  cards?: LocationIntelligenceSummary["cards"];
  loading?: boolean;
}

export const KpiSection: React.FC<KpiSectionProps> = ({
  cards,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse"
          >
            <div className="h-4 w-32 bg-gray-100 rounded mb-4" />
            <div className="h-8 w-24 bg-gray-100 rounded mb-3" />
            <div className="h-6 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!cards) {
    return null;
  }

  const kpis: KpiCardProps[] = [
    {
      card: cards.available,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 19V5M8 19V9M12 19V12M16 19V7M20 19V10"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      card: cards.absorbed,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M3 17l6-6 4 4 7-7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21 7v6h-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
    {
      card: cards.forecast,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v18M7 8l5-5 5 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      card: cards.powerConsumption,
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M13 2S6 9 6 14a6 6 0 0 0 12 0c0-5-5-9-5-12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M10 14a2 2 0 0 0 4 0"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
};
