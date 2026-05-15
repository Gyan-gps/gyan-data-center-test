import React, { FC, useMemo } from "react";

interface DataItem {
  data_center_status?: string;
}

interface KpiCardProps {
  data: DataItem[];
  loading: boolean;
}

const KPICard: FC<KpiCardProps> = ({ data = [], loading }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        commissioned: 0,
        underConstruction: 0,
        announced: 0,
        operationalPercent: 0,
      };
    }

    const total = data.length;

    const commissioned = data.filter(
      (item) =>
        item.data_center_status?.toLowerCase().trim() === "commissioned"
    ).length;

    const underConstruction = data.filter(
      (item) =>
        item.data_center_status?.toLowerCase().trim() === "under construction"
    ).length;

    const announced = data.filter(
      (item) => item.data_center_status?.toLowerCase().trim() === "announced"
    ).length;

    const operationalPercent =
      total > 0 ? Math.round((commissioned / total) * 100) : 0;

    return {
      total,
      commissioned,
      underConstruction,
      announced,
      operationalPercent,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="w-full h-full bg-white shadow-lg rounded-xl p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading Overview</p>
      </div>
    );
  }

  const kpiStyle =
    "  p-4 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ";

  return (
    <div className="w-full bg-white shadow-lg rounded-xl p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
        
        <div className={kpiStyle}>
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-lg font-semibold">{stats.total}</p>
        </div>

        <div className={kpiStyle}>
          <p className="text-xs text-gray-500">Commissioned</p>
          <p className="text-lg font-semibold text-green-600">
            {stats.commissioned}
          </p>
        </div>

        <div className={kpiStyle}>
          <p className="text-xs text-gray-500">Under Construction</p>
          <p className="text-lg font-semibold text-yellow-600">
            {stats.underConstruction}
          </p>
        </div>

        <div className={kpiStyle}>
          <p className="text-xs text-gray-500">Announced</p>
          <p className="text-lg font-semibold text-blue-600">
            {stats.announced}
          </p>
        </div>

        <div className={kpiStyle}>
          <p className="text-xs text-gray-500">Operational %</p>
          <p className="text-lg font-semibold text-indigo-600">
            {stats.operationalPercent}%
          </p>
        </div>

      </div>
    </div>
  );
};

export default KPICard;