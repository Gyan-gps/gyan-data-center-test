import React from "react";
import type {
  GetKpiCardsResponse,
  KpiCardMetric,
} from "@/network/operator-intelligence/operator-intelligence.types";

interface KpiCardProps {
  card: KpiCardMetric;
  icon: React.ReactNode;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  card,
}) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
        {icon}
      </div>

      <span className="text-xs text-gray-400 font-medium">
        {card.label}
      </span>
    </div>

    <div className="flex items-baseline gap-1 flex-wrap">
      <span className="text-lg sm:text-2xl font-bold text-gray-900 break-all">
        {card.value?.toLocaleString()}
      </span>

      <span className="text-xs sm:text-sm text-gray-400">
        {card.unit}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 border border-gray-100 bg-gray-50 px-2 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />

        {`${card.changeValue >= 0 ? "+" : ""}${
          card.changeValue
        } ${card.changeUnit} ${card.changeLabel}`}
      </span>
    </div>
  </div>
);

interface KpiSectionProps {
  cards?: GetKpiCardsResponse;
  loading?: boolean;
}

export const KpiSection: React.FC<
  KpiSectionProps
> = ({
  cards,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse"
            >
              <div className="h-4 w-32 bg-gray-100 rounded mb-4" />

              <div className="h-8 w-24 bg-gray-100 rounded mb-3" />

              <div className="h-6 w-20 bg-gray-100 rounded" />
            </div>
          )
        )}
      </div>
    );
  }

  if (!cards) {
    return null;
  }

  const kpis: KpiCardProps[] = [
    {
      card: cards.currentITLoad,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
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
      card: cards.forecast2033,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
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
      card: cards.countriesPresence,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            stroke="currentColor"
            strokeWidth="2"
          />

          <circle
            cx="12"
            cy="11"
            r="2"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>
      ),
    },

    {
      card: cards.dataCenters,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            x="4"
            y="4"
            width="16"
            height="6"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
          />

          <rect
            x="4"
            y="14"
            width="16"
            height="6"
            rx="1"
            stroke="currentColor"
            strokeWidth="2"
          />

          <path
            d="M8 7h.01M8 17h.01"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ),
    },

    {
      card: cards.averagePUE,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
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
    {
      card: cards.averageRackDensity
,

      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
        >
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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
      {kpis.map((kpi, i) => (
        <KpiCard key={i} {...kpi} />
      ))}
    </div>
  );
};