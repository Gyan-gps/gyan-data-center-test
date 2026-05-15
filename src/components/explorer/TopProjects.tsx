import React, { FC, useMemo } from "react";

interface DataItem {
  data_center_facility_name?: string;
  country?: string[];
  current_it_load_capacity?: number;
  year_of_commission?: number;
  data_center_status?: string;
}

interface TopProjectsProps {
  data: DataItem[];
  loading: boolean;
}

const TopProjects: FC<TopProjectsProps> = ({ data = [], loading }) => {
  const topThree = useMemo(() => {
    if (!data || data.length === 0) return [];
    const sorted = [...data].sort(
      (a, b) => (b.current_it_load_capacity || 0) - (a.current_it_load_capacity || 0)
    );
    return sorted.slice(0, 3);
  }, [data]);

  if (loading) {
    return (
      <div className="bg-gray-100 shadow-lg rounded-xl p-4">
        <p className="text-gray-500 text-sm">Loading Top Projects...</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    commissioned: "text-green-600",
    "under construction": "text-yellow-600",
    announced: "text-blue-600",
    cancelled: "text-red-600",
  };

  return (
    <div className="bg-gray-100 shadow-lg rounded-xl p-5">
      <h2 className="text-base font-semibold mb-4 text-gray-800">
        Top 3 Projects
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topThree.map((project, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl px-4 py-5 text-center shadow-md border border-gray-100 cursor-pointer
            transition-all duration-300 transform
            hover:-translate-y-2 hover:shadow-xl hover:border-gray-200"
          >
            <p className="font-semibold text-sm truncate">
              {project.data_center_facility_name || "N/A"}
            </p>

            <p className="text-xs mt-1 text-gray-500">
              {project.country?.[0] || "N/A"}
            </p>

            <p className="text-xs mt-2 font-medium text-gray-700">
              {project.current_it_load_capacity || 0} MW
            </p>

            <p
              className={`text-xs mt-2 font-medium ${
                statusColors[
                  project.data_center_status?.toLowerCase() || ""
                ] || "text-gray-600"
              }`}
            >
              {project.data_center_status || "N/A"}
            </p>

            {project.year_of_commission && (
              <p className="text-xs mt-1 text-gray-400">
                {project.year_of_commission}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProjects;