import React, { useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  Badge,
} from "@/components/ui";
import type { DataCenterAsset, NewsArticle } from "@/network";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ChartLine, MapPin, Newspaper, Star, Download } from "lucide-react";
import {
  formatDataCenterStatus,
  formatToMillions,
  formatValue,
  getCurrentYearItLoadCapacity,
} from "@/utils";
import { useAuthStore } from "@/store";
import { BlurMask, FieldTooltip } from "@/components/common";
import { trackFileDownload } from "@/utils/ga";
import { useMemo, useState } from "react";
// Fix for the default marker icons in Leaflet with Vite
// We need to set up the marker icons manually
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface DataCenterDetailProps {
  datacenter: DataCenterAsset;
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
}

export const DataCenterDetail: React.FC<DataCenterDetailProps> = ({
  datacenter,
  loading = false,
  error = null,
  onBack,
}) => {
  const { user, updateUserFavoriteDataCenters, shouldBlur } = useAuthStore();
  const isTrialUser = shouldBlur();
  const [chartWidth, setChartWidth] = useState(0);
  
  
  // Check if current data center is favorited
  const isFavorited = user?.favouriteDataCenters?.some(
    (fav) => fav === datacenter?.id
  );

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (!datacenter?.id || !user) return;
    updateUserFavoriteDataCenters(datacenter.id);
  }, [datacenter.id, updateUserFavoriteDataCenters, user]);

  // Handle export to PDF
  const handleExportToPDF = useCallback(() => {
    const originalTitle = document.title;
    document.title = `MI _Data_Center_Intelligence_${datacenter["data_center_facility_name"]}`;
    window.print();
    trackFileDownload(user?.id, user?.email, document.title, "pdf");
    document.title = originalTitle;
  }, []);

  // Helper function to render value or N/A badge
  const renderValueOrNA = (value: unknown) => {
    const formattedValue = formatValue(value);
    return formattedValue ? (
      formattedValue
    ) : (
      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
        N/A
      </span>
    );
  };
  //converting  the IT load capacity data into a format suitable for recharts, while also handling quarterly data if available
  const chartData = useMemo(() => {
    if (!datacenter || !datacenter.it_load_capacity_by_year) return [];

  const flattened: { label: string; value: number }[] = [];

  datacenter.it_load_capacity_by_year
    .sort((a, b) => a.year - b.year)
    .forEach((item) => {
      const { year, capacity_mw, q1_mw, q2_mw, q3_mw, q4_mw } = item;

      const hasQuarterData =
        q1_mw != null || q2_mw != null || q3_mw != null || q4_mw != null;

      if (hasQuarterData) {
        if (q1_mw != null)
          flattened.push({ label: `${year} Q1`, value: q1_mw });
        if (q2_mw != null)
          flattened.push({ label: `${year} Q2`, value: q2_mw });
        if (q3_mw != null)
          flattened.push({ label: `${year} Q3`, value: q3_mw });
        if (q4_mw != null)
          flattened.push({ label: `${year} Q4`, value: q4_mw });
      } else if (capacity_mw != null) {
        flattened.push({ label: `${year}`, value: capacity_mw });
      }
    });

  return flattened;
}, [datacenter]);

//transforms x-axis tick to show year and quarter in two lines if quarter data is available, otherwise just shows year. Memoized for performance.
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;

  const value = payload.value; // example: "2025 Q1"

  const [year, quarter] = value.split(" ");

  return (
    <g transform={`translate(${x},${y+2})`}>
      <text textAnchor="end" fill="#666" fontSize={12} transform="rotate(-45)">
        <tspan x="0" dy="0">
          {year} {quarter}
        </tspan>
        {/* <tspan x="0" dy="14">
          {quarter}
        </tspan> */}
      </text>
    </g>
  );
};

  // Fix Leaflet icon issues
  React.useEffect(() => {
    // This is needed to fix Leaflet marker icon issues
    // @ts-expect-error: _getIconUrl is not in the type definition but exists at runtime
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!datacenter) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 sm:py-12 text-gray-500 px-4">
            Data center not found
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header with back button */}
      <div className="flex sm:items-center justify-between gap-3 my-4 sm:my-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
            {datacenter["data_center_facility_name"]}
          </h1>
          <p className="text-gray-600 text-sm mt-1">Data Center Details</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportToPDF}
            className="p-2 rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 transition-colors no-print"
            title="Export as PDF"
          >
            <Download className="w-5 h-5" />
          </button>

          {user && (
            <button
              onClick={handleFavoriteToggle}
              className={`p-2 rounded-full transition-colors no-print ${
                isFavorited
                  ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
              }`}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Star
                className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
              />
            </button>
          )}

          {onBack && (
            <button
              onClick={onBack}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm no-print"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Overview Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    Data Center Operator:
                  </h4>
                  <FieldTooltip fieldName="Data Center Operator" />
                </div>
                <p className="text-sm font-medium">
                  {renderValueOrNA(datacenter["operator_details"])}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  City / Country / Region
                </h4>
                <p className="text-sm font-medium">
                  {formatValue(datacenter.city) &&
                  formatValue(datacenter.country) &&
                  formatValue(datacenter.region)
                    ? `${datacenter.city}, ${datacenter.country}, ${datacenter.region}`
                    : ""}
                </p>
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">Status:</h4>
                  <FieldTooltip fieldName="Data Center Status" />
                </div>
                <div className="flex items-center">
                  <BlurMask shouldBlur={isTrialUser}>
                  <Badge
                    variant={formatDataCenterStatus(
                      datacenter["data_center_status"] || ""
                    )}
                    size="sm"
                  >
                    {formatValue(datacenter["data_center_status"]) || "Unknown"}
                  </Badge>
                  </BlurMask>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    Commissioning Year:
                  </h4>
                  <FieldTooltip fieldName="Year of Commission" />
                </div>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {renderValueOrNA(datacenter["year_of_commission"])}
                </p>
                </BlurMask>
              </div>

              {/* <div>
                <h4 className="text-sm font-medium text-gray-500">Location:</h4>
                <p className="text-sm font-medium">
                  {datacenter.city && datacenter.country && datacenter.region
                    ? `${datacenter.city}, ${datacenter.country}, ${datacenter.region}`
                    : datacenter.address || "N/A"}
                </p>
              </div> */}
            </div>
          </CardContent>
        </Card>

        {/* Specifications Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              Specifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    Current IT Load (MW): 
                  </h4>
                  <FieldTooltip fieldName="Current IT Load Capacity" />
                </div>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {formatValue(
                    getCurrentYearItLoadCapacity(
                      datacenter["it_load_capacity_by_year"]
                    )
                  )
                    ? `${formatValue(
                        getCurrentYearItLoadCapacity(
                          datacenter["it_load_capacity_by_year"]
                        )
                      )} MW`
                    : renderValueOrNA(
                        getCurrentYearItLoadCapacity(
                          datacenter["it_load_capacity_by_year"]
                        )
                      )}
                </p>
                </BlurMask>
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    Expected IT Load (MW):
                  </h4>
                  <FieldTooltip fieldName="Expected IT Load Capacity (MW)" />
                </div>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {formatValue(datacenter["expected_it_load_capacity_mw"])
                    ? `${formatValue(
                        datacenter["expected_it_load_capacity_mw"]
                      )} MW`
                    : renderValueOrNA(
                        datacenter["expected_it_load_capacity_mw"]
                      )}
                </p>
                </BlurMask>
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    PUE Rating:
                  </h4>
                  <FieldTooltip fieldName="PUE Rating" />
                </div>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {renderValueOrNA(datacenter["pue_rating"])}
                </p>
                </BlurMask>
              </div>

              <div>
                <div className="flex items-center">
                  <h4 className="text-sm font-medium text-gray-500">
                    Tier Certification:
                  </h4>
                  <FieldTooltip fieldName="Tier Certification" />
                </div>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {renderValueOrNA(datacenter["data_center_tier_level"])}
                </p>
                </BlurMask>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Coordinates:
                </h4>
                <BlurMask shouldBlur={isTrialUser}>
                <p className="text-sm font-medium">
                  {formatValue(datacenter.latitude) &&
                  formatValue(datacenter.longitude)
                    ? `${formatValue(datacenter.latitude)}, ${formatValue(
                        datacenter.longitude
                      )}`
                    : renderValueOrNA(null)}
                </p>
                </BlurMask>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Details Card */}
        <Card className="shadow-sm md:col-span-2">
          {/* <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              Additional Details
            </CardTitle>
          </CardHeader> */}
          <CardContent>
            <div className="space-y-6">
              {/* Facility Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Facility Information
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50 w-1/3">
                          <div className="flex items-center">
                            Facility Type
                            <FieldTooltip fieldName="Data Center Type" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["data_center_type"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Size Type
                            <FieldTooltip fieldName="Data Center Size" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["data_center_size"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Project Investment (USD M)
                            <FieldTooltip fieldName="Project Investment Value (USD)" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatToMillions(
                            datacenter["project_investment_value_usd"]
                          ) || "N/A"}{" "}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          Net Rentable Capacity (SqFt)
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(
                            datacenter["net_rentable_capacity_sq_ft"]
                          )
                            ? `${Number(
                                formatValue(
                                  datacenter["net_rentable_capacity_sq_ft"]
                                )
                              ).toLocaleString()}`
                            : ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          Number of Racks
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["number_of_racks"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Rack Density
                            <FieldTooltip fieldName="Rack Density" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["dc_rack_density_kw"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          PUE Rating
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["pue_rating"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Redundancy Levels Power
                            <FieldTooltip fieldName="Redundancy Levels Power" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["redundancy_levels_power"]) ||
                            ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Redundancy Levels Cooling
                            <FieldTooltip fieldName="Redundancy Levels Cooling" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(
                            datacenter["redundancy_levels_cooling"]
                          ) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          <div className="flex items-center">
                            Power Backup Type
                            <FieldTooltip fieldName="Power Backup Type" />
                          </div>
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["power_backup_type"]) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      {formatValue(
                        datacenter["cybersecurity_certification"]
                      ) && (
                        <tr>
                          <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                            <div className="flex items-center">
                              Cybersecurity Certification
                              <FieldTooltip fieldName="Cybersecurity Certification" />
                            </div>
                          </td>
                          <BlurMask shouldBlur={isTrialUser}>
                          <td className="py-3 px-2 sm:px-4 text-gray-900">
                            {formatValue(
                              datacenter["cybersecurity_certification"]
                            ) || ""}
                          </td>
                          </BlurMask>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Location Information
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50 w-1/3">
                          Full Address
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(
                            datacenter["dc_operator_facility_address"]
                          ) || ""}
                        </td>
                        </BlurMask>
                      </tr>
                      {/* <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          Location Zone
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter["loc"]) || ""}
                        </td>
                      </tr> */}
                      <tr>
                        <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                          City / Country / Region
                        </td>
                        <BlurMask shouldBlur={isTrialUser}>
                        <td className="py-3 px-2 sm:px-4 text-gray-900">
                          {formatValue(datacenter.city) &&
                          formatValue(datacenter.country) &&
                          formatValue(datacenter.region)
                            ? `${datacenter.city}, ${datacenter.country}, ${datacenter.region}`
                            : ""}
                        </td>
                        </BlurMask>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Company Information */}
              {(formatValue(datacenter["dc_operator_website"]) ||
                formatValue(datacenter["parent_comp"]) ||
                formatValue(datacenter["dc_operator_email_id"])) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Company Information
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        {datacenter["dc_operator_website"] &&
                          datacenter["dc_operator_website"].length > 0 && (
                            <tr>
                              <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50 w-1/3">
                                Company Website
                              </td>
                              <td className="py-3 px-2 sm:px-4 text-gray-900">
                                <a
                                  href={datacenter["dc_operator_website"][0]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {datacenter["dc_operator_website"][0]}
                                </a>
                              </td>
                            </tr>
                          )}
                        <tr>
                          <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                            Parent Company
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-900">
                            {formatValue(datacenter["parent_comp"]) || ""}
                          </td>
                        </tr>
                        {/* <tr>
                          <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                            Company Location
                          </td>
                          <td className="py-3 px-2 sm:px-4 text-gray-900">
                            {formatValue(datacenter["Comp Country"]) &&
                            formatValue(datacenter["Comp Region"])
                              ? `${datacenter["Comp Country"]}, ${datacenter["Comp Region"]}`
                              : formatValue(datacenter["Comp Country"]) ||
                                formatValue(datacenter["Comp Region"]) ||
                                ""}
                          </td>
                        </tr> */}
                        {datacenter["dc_operator_email_id"] &&
                          datacenter["dc_operator_email_id"].length > 0 && (
                            <tr>
                              <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                                Company Email
                              </td>
                              <td className="py-3 px-2 sm:px-4 text-gray-900">
                                <a
                                  href={`mailto:${datacenter["dc_operator_email_id"][0]}`}
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  {datacenter["dc_operator_email_id"][0]}
                                </a>
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Key Person Information */}
              {/* {(formatValue(datacenter["Key Person Email"]) || formatValue(datacenter["Key Person Phone"]) || formatValue(datacenter["Key Person LinkedIn"])) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Key Person Information</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        {formatValue(datacenter["Key Person Email"]) && (
                          <tr>
                            <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50 w-1/3">
                              Key Person Email
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-gray-900">
                              <a 
                                href={`mailto:${datacenter["Key Person Email"]}`}
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {datacenter["Key Person Email"]}
                              </a>
                            </td>
                          </tr>
                        )}
                        {formatValue(datacenter["Key Person Phone"]) && (
                          <tr>
                            <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                              Key Person Phone
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-gray-900">
                              <a 
                                href={`tel:${datacenter["Key Person Phone"]}`}
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {datacenter["Key Person Phone"]}
                              </a>
                            </td>
                          </tr>
                        )}
                        {formatValue(datacenter["Key Person LinkedIn"]) && (
                          <tr>
                            <td className="py-3 px-2 sm:px-4 font-medium text-gray-500 bg-gray-50">
                              Key Person LinkedIn
                            </td>
                            <td className="py-3 px-2 sm:px-4 text-gray-900">
                              <a 
                                href={datacenter["Key Person LinkedIn"]} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                LinkedIn Profile
                              </a>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )} */}
            </div>
          </CardContent>
        </Card>

        {/* IT Load Timeline Chart */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              <div className="flex items-center">
                <ChartLine className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                IT Load Timeline
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[250px] sm:h-[300px] md:h-[400px]">
                <ResponsiveContainer width="100%" height="100%" onResize={(width) => setChartWidth(width)}>
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 30,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    
                    <XAxis
                      dataKey="label"
                      {...(chartWidth > 600 && { interval: 0 })} //hides xaxis labels if chart width is less than 600px to avoid clutter, otherwise shows all labels
                      tick={!user?.trial ? <CustomXAxisTick /> : false}
                      axisLine={!user?.trial}
                      tickLine={!user?.trial}
                      label={
                        !user?.trial
                          ? { value: "Year", position: "insideBottomRight", offset: -30 }
                          : undefined
                      }
                    />
                    <YAxis
                      tick={user?.trial ? false : undefined}
                      axisLine={!user?.trial}
                      tickLine={!user?.trial}
                      label={
                        !user?.trial
                          ? {
                            value: "IT Load (MW)",
                            angle: -90,
                            position: "insideLeft",
                            style: { textAnchor: "middle" },
                          }
                          : undefined
                      }
                    />
                    {!user?.trial && <Tooltip
                      formatter={(value) => [
                        `${Number(value).toFixed(2)} MW`,
                        "IT Load",
                      ]}
                      labelFormatter={(label) => `Year: ${label}`}
                      
                    />}
                    <Legend 
                    verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20 }}/>
                    <Line
                      type="monotone"
                      dataKey="value"
                      name="Current IT Load Capacity (MW)"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      activeDot={user?.trial ? false : { r: 8 }}
                      dot={user?.trial ? false : true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="bg-gray-100 rounded h-[150px] sm:h-[240px] flex items-center justify-center">
                <div className="text-center text-gray-500 px-4">
                  No IT load data available for this data center
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Card with Map */}
        <Card className="shadow-sm md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {datacenter.city && datacenter.country && datacenter.region
                  ? `${datacenter.city}, ${datacenter.country}, ${datacenter.region}`
                  : "-"}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {datacenter.latitude && datacenter.longitude ? (
              <div className="h-[250px] sm:h-[300px] md:h-[400px] rounded overflow-hidden">
                <MapContainer
                  center={[datacenter.latitude, datacenter.longitude]}
                  zoom={12}
                  minZoom={2}
                  maxZoom={18}
                  style={{ width: "100%", height: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    subdomains="abcd"
                    noWrap={true}
                  />
                  <Marker
                    position={[datacenter.latitude, datacenter.longitude]}
                    icon={defaultIcon}
                  >
                    <Popup>
                      <strong>{datacenter["data_center_facility_name"]}</strong>
                      <br />
                      {datacenter["operator_details"] || "N/A"}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="bg-gray-100 rounded h-[150px] sm:h-[240px] flex items-center justify-center">
                <div className="text-center text-gray-500 px-4">
                  No coordinates available to display map
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent News Section */}

        {datacenter.news && datacenter.news.length > 0 && (
          <Card className="shadow-sm md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-medium">
                <div className="flex items-center">
                  <Newspaper className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Recent News
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Title
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {datacenter.news!.map(
                      (newsItem: NewsArticle, index: number) => (
                        <tr key={newsItem._id || index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(
                              newsItem.publishedDate
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <a
                              href={newsItem.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {newsItem.title}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {newsItem.source.title}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meta Information */}
        <div className="text-sm">
          <p className="text-gray-500">
            Last Modified:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Print source header */}
      <div className="print-source">
        Source: Data Center Intelligence | Mordor Intelligence
      </div>
    </div>
  );
};
