import React from "react";
import { Badge } from "@/components/ui";
import { FieldTooltip } from "@/components/common";
import { formatDataCenterStatus } from "@/utils";
import type { DataCenterMap } from "@/network";

interface DataCenterPopupProps {
  datacenter: DataCenterMap;
  onViewDetails: (id: string) => void;
}

export const DataCenterPopup: React.FC<DataCenterPopupProps> = ({
  datacenter,
  onViewDetails,
}) => {
  return (
    <div>
      <div className="mb-3">
        <button
          onClick={() => onViewDetails(datacenter.dc_id || datacenter.id)}
          className="font-medium text-blue-600 hover:underline text-sm sm:text-base text-left w-full"
        >
          {datacenter["data_center_facility_name"]}
        </button>
        <div className="text-xs text-gray-500 mt-1">{datacenter.dc_id}</div>
      </div>

      {/* Key Information Grid */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600">Operator:</span>
            <FieldTooltip fieldName="Data Center Operator" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900 text-right max-w-[50%] truncate">
            {Array.isArray(datacenter.data_center_operator)
              ? datacenter.data_center_operator[0]?.company || "N/A"
              : datacenter.data_center_operator}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm text-gray-600">Location:</span>
          <span className="text-xs sm:text-sm font-medium text-gray-900 text-right max-w-[50%] truncate">
            {Array.isArray(datacenter.city)
              ? datacenter.city[0]?.city || "N/A"
              : datacenter.city}
            ,{" "}
            {Array.isArray(datacenter.country)
              ? datacenter.country[0] || "N/A"
              : datacenter.country}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600">Status:</span>
            <FieldTooltip fieldName="Data Center Status" />
          </div>
          <div className="text-right">
            <Badge
              variant={formatDataCenterStatus(
                datacenter["data_center_status"] || ""
              )}
              className="text-xs px-2 py-1"
            >
              {datacenter["data_center_status"] || "N/A"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600">
              IT Load:
            </span>
            <FieldTooltip fieldName="Current IT Load Capacity" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {datacenter["current_it_load_capacity"]} MW
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600">
              Tier Certification:
            </span>
            <FieldTooltip fieldName="Tier Certification" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900">
            {datacenter["data_center_tier_level"]}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600">
              Facility Type:
            </span>
            <FieldTooltip fieldName="Data Center Type" />
          </div>
          <span className="text-xs sm:text-sm font-medium text-gray-900 text-right max-w-[50%] truncate">
            {datacenter["data_center_type"]}
          </span>
        </div>

        {datacenter["year_of_commission"] ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-xs sm:text-sm text-gray-600">
                Commissioned:
              </span>
              <FieldTooltip fieldName="Year of Commission" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-gray-900">
              {datacenter["year_of_commission"]}
            </span>
          </div>
        ) : null}
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          onClick={() => onViewDetails(datacenter.dc_id || datacenter.id)}
          className="w-full bg-blue-600 text-white text-xs sm:text-sm px-3 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};
