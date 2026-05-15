import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  Badge,
  Pagination,
} from "@/components/ui";
import type { CompanyDetailsData } from "./types";
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
import {
  ChartLine,
  Building2,
  // Users,
  Globe,
  Mail,
  Star,
} from "lucide-react";
import { formatDataCenterStatus, formatToMillions, formatValue } from "@/utils";
import { useMemo, useCallback, useState } from "react";
import { Link } from "react-router";
import { useAuthStore } from "@/store/authStore";
import { BlurMask, FieldTooltip } from "@/components/common";

interface CompanyDetailProps {
  companyDetails?: CompanyDetailsData;
  loading?: boolean;
  error?: string | null;
  onBack?: () => void;
}

export const CompanyDetail: React.FC<CompanyDetailProps> = ({
  companyDetails,
  loading = false,
  error = null,
  onBack,
}) => {
  const { user, updateUserFavoriteCompanies,shouldBlur } = useAuthStore();
  const isTrialUser = shouldBlur();
  const [chartWidth, setChartWidth] = useState(0);
  // Pagination state for Projects section
  const [projectsPage, setProjectsPage] = useState(1);
  const projectsPerPage = 10;

  const isFavorited = user?.favouriteCompanies?.some(
    (fav) => fav === companyDetails?.companyInfo?.id
  );

  // Handle favorite toggle
  const handleFavoriteToggle = useCallback(() => {
    if (!companyDetails?.companyInfo?.id || !user) return;
    updateUserFavoriteCompanies(companyDetails.companyInfo.id);
  }, [companyDetails?.companyInfo?.id, updateUserFavoriteCompanies, user]);

  // Transform IT Load data for the chart - sum across all assets for each year (memoized)
  const itLoadData = useMemo(() => {
  if (!companyDetails?.assets?.length) return [];

  const timeline: Record<string, number> = {};

  companyDetails.assets.forEach((asset) => {
    const capacityArray = asset.it_load_capacity_by_year;

    if (!Array.isArray(capacityArray)) return;

    capacityArray.forEach((entry: any) => {
      const { year, capacity_mw, q1_mw, q2_mw, q3_mw, q4_mw } = entry;

      const hasQuarterData =
        q1_mw != null || q2_mw != null || q3_mw != null || q4_mw != null;

      if (hasQuarterData) {
        if (q1_mw != null)
          timeline[`${year} Q1`] =
            (timeline[`${year} Q1`] || 0) + Number(q1_mw);

        if (q2_mw != null)
          timeline[`${year} Q2`] =
            (timeline[`${year} Q2`] || 0) + Number(q2_mw);

        if (q3_mw != null)
          timeline[`${year} Q3`] =
            (timeline[`${year} Q3`] || 0) + Number(q3_mw);

        if (q4_mw != null)
          timeline[`${year} Q4`] =
            (timeline[`${year} Q4`] || 0) + Number(q4_mw);
      } else if (capacity_mw != null) {
        timeline[`${year}`] =
          (timeline[`${year}`] || 0) + Number(capacity_mw);
      }
    });
  });

  return Object.entries(timeline)
    .map(([year, value]) => ({ year, value }))
    .sort((a, b) => {
      const getSortKey = (label: string) => {
        const [y, q] = label.split(" ");
        return q
          ? parseInt(y) * 10 + parseInt(q.replace("Q", ""))
          : parseInt(y) * 10;
      };

      return getSortKey(a.year) - getSortKey(b.year);
    });
}, [companyDetails?.assets]);


//transforms x-axis tick to show year and quarter in two lines if quarter data is available, otherwise just shows year. Memoized for performance.
const CustomXAxisTick = (props: any) => {
  const { x, y, payload } = props;

  const value = payload.value; // example: "2025 Q1"

  const [year, quarter] = value.split(" ");

  return (
    <g transform={`translate(${x},${y+10})`}>
      <text textAnchor="end" fill="#666" fontSize={12} transform="rotate(-45)">
        <tspan x="0" dy="0">
          {year}{quarter}
        </tspan>
        {/* <tspan x="0" dy="14">
          {quarter}
        </tspan> */}
      </text>
    </g>
  );
};

  // Paginated assets for Projects section
  const paginatedAssets = useMemo(() => {
    if (!companyDetails?.assets) return [];
    const startIndex = (projectsPage - 1) * projectsPerPage;
    const endIndex = startIndex + projectsPerPage;
    return companyDetails.assets.slice(startIndex, endIndex);
  }, [companyDetails?.assets, projectsPage, projectsPerPage]);

  // Handle page change for Projects section
  const handleProjectsPageChange = useCallback((newPage: number) => {
    setProjectsPage(newPage);
    // Scroll to projects section
    document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const formatNumber = (num: number | string) => {
    const n = typeof num === "string" ? parseInt(num) : num;
    return isNaN(n) ? "0" : n.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8 sm:py-12 min-h-[100vh]">
        <Loading text="Loading company details..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8 sm:py-12">
            <div className="text-red-600 mb-4">Error: {error}</div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Go Back
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
<div className="space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto px-4 sm:px-6 mb-6 overflow-hidden"> 
       {/* Header with back button */}
      <div className="flex sm:items-center justify-between gap-3 my-4 sm:my-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">
                {companyDetails?.companyInfo.company || "Company Details"}
              </h1>
            </div>
            <p className="text-gray-600 text-sm mt-1">Company Details</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
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
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center text-sm self-start sm:self-auto"
            >
              ← Back
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Company Overview Card */}
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              Company Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                {/* <div>
                  <label className="text-sm font-medium text-gray-500">
                    Parent Company
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatValue(companyDetails?.companyInfo?.parent_company)}
                  </p>
                </div> */}
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Company Type
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatValue(companyDetails?.assets[0].data_center_type)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    {companyDetails?.companyInfo?.generic_email ? (
                      <>
                        <Mail className="w-4 h-4" />
                        <a
                          href={`mailto:${companyDetails.companyInfo.generic_email}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {companyDetails.companyInfo.generic_email}
                        </a>
                      </>
                    ) : (
                      formatValue(null)
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Website
                  </label>
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    {companyDetails?.companyInfo?.website ? (
                      <>
                        <Globe className="w-4 h-4" />
                        <a
                          href={companyDetails.companyInfo.website.startsWith('http') ? companyDetails.companyInfo.website : `https://${companyDetails.companyInfo.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 break-all"
                        >
                          {companyDetails.companyInfo.website}
                        </a>
                      </>
                    ) : (
                      formatValue(null)
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HQ City
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatValue(companyDetails?.companyInfo?.HQ_City)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HQ Country
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatValue(companyDetails?.companyInfo?.HQ_Country)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    HQ Region
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatValue(companyDetails?.companyInfo?.HQ_Region)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg font-medium">
              Key Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">No. of Countries</span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {new Set(companyDetails?.assets.map((asset) => asset.country[0]))
                    .size || 0}
                </span>
                </BlurMask>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  No. of Data Centers
                </span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {companyDetails?.assets.length || 0}
                </span>
                </BlurMask>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Current IT Load Capacity
                </span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {companyDetails?.assets && companyDetails.assets.length > 0
                    ? `${companyDetails.assets
                        .reduce((sum, asset) => {
                          const itLoad =
                            asset["current_it_load_capacity"] ||
                            0;
                          return (
                            sum + (typeof itLoad === "number" ? itLoad : 0)
                          );
                        }, 0)
                        .toFixed(1)} MW`
                    : "0 MW"}
                </span>
                </BlurMask>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Total Project Investment (USD M)
                </span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {companyDetails?.assets.reduce(
                    (sum, asset) =>
                      sum + (asset["project_investment_value_usd"] || 0),
                    0
                  )
                    ? formatToMillions(
                        companyDetails.assets.reduce(
                          (sum, asset) =>
                            sum + (asset["project_investment_value_usd"] || 0),
                          0
                        )
                      )
                    : formatValue(null)}
                </span>
                </BlurMask>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Net Rentable Capacity
                </span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {companyDetails?.assets.reduce(
                    (sum, asset) =>
                      sum + (asset["net_rentable_capacity_sq_ft"] || 0),
                    0
                  )
                    ? `${formatNumber(
                        companyDetails.assets.reduce(
                          (sum, asset) =>
                            sum + (asset["net_rentable_capacity_sq_ft"] || 0),
                          0
                        )
                      )} sq ft`
                    : formatValue(null)}
                </span>
                </BlurMask>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average PUE</span>
                <BlurMask shouldBlur={isTrialUser}>
                <span className="text-sm font-medium">
                  {companyDetails?.assets && companyDetails.assets.length > 0
                    ? (() => {
                        const validPueRatings = companyDetails.assets
                          .map((asset) => asset["pue_rating"])
                          .filter(
                            (rating) => rating != null && !isNaN(Number(rating))
                          );

                        if (validPueRatings.length === 0)
                          return formatValue(null);

                        const averagePue =
                          validPueRatings.reduce<number>(
                            (sum, rating) => sum + Number(rating),
                            0
                          ) / validPueRatings.length;
                        return averagePue.toFixed(2);
                      })()
                    : formatValue(null)}
                </span>
                </BlurMask>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* IT Load Graph */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-medium">
            <div className="flex items-center">
              <ChartLine className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              IT Load Capacity Timeline
              <FieldTooltip fieldName="Current IT Load Capacity" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%" onResize={(width) => setChartWidth(width)}>
              <LineChart
                data={itLoadData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 30,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="year"
                  {...(chartWidth > 600 && { interval: 0 })}
                  tick={<CustomXAxisTick />}
                  axisLine={true}
                  tickLine={true}
                  label={{ value: "Year", position: "insideBottomRight", offset: -30 }}
                />
                <YAxis
                  axisLine={true}
                  tickLine={true}
                  label={{
                    value: "IT Load Capacity (MW)",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)} MW`,
                    "IT Load Capacity",
                  ]}
                  labelFormatter={(label) => `Year: ${label}`}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ paddingTop: 20 }}
                />    
                            <Line
                  type="monotone"
                  dataKey="value"
                  name="IT Load Capacity (MW)"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                  dot={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Section */}
      {/* <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-medium">
            <div className="flex items-center">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Contacts
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    City
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyDetails?.contacts &&
                companyDetails.contacts.length > 0 ? (
                  companyDetails.contacts.map((contact, index) => (
                    <tr key={contact.id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Contact_Person)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Contact_Person_Email)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Contact_Person_Designation)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Contact_Person_Phone)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Contact_Person_City?.[0])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.Country_Name?.[0])}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatValue(contact.region?.[0])}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No contacts available at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}

      {/* Projects Section */}
      <div id="projects-section">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base sm:text-lg font-medium">
                <div className="flex items-center">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Projects
                  {companyDetails?.assets && companyDetails.assets.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500 font-normal">
                      ({companyDetails.assets.length} total)
                    </span>
                  )}
                </div>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Center Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IT Load (MW)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Commissioned Year
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedAssets && paginatedAssets.length > 0 ? (
                  paginatedAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <Link
                          to={`/datacenter/${asset.dc_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {asset["data_center_facility_name"] || asset.dc_id}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <BlurMask shouldBlur={isTrialUser}>
                        <Badge
                          variant={formatDataCenterStatus(
                            asset["data_center_status"]
                          )}
                          size="sm"
                        >
                          {asset["data_center_status"]}
                        </Badge>
                        </BlurMask>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {asset.city}, {asset.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <BlurMask shouldBlur={isTrialUser}>
                        {asset["current_it_load_capacity"]
                          ? `${asset["current_it_load_capacity"]} MW`
                          : formatValue(0)}
                        </BlurMask>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <BlurMask shouldBlur={isTrialUser}>
                        {asset["project_investment_value_usd"]
                          ? formatCurrency(
                              asset["project_investment_value_usd"]
                            )
                          : formatValue(null)}
                        </BlurMask>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <BlurMask shouldBlur={isTrialUser}>
                        {asset["year_of_commission"] ||
                          asset["year_of_commission"]}
                        </BlurMask>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No projects available at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {companyDetails?.assets && companyDetails.assets.length > 0 && (
            <Pagination
              currentPage={projectsPage}
              totalCount={companyDetails.assets.length}
              itemsPerPage={projectsPerPage}
              onPageChange={handleProjectsPageChange}
              loading={loading}
              className="mt-4"
            />
          )}
        </CardContent>
      </Card>
      </div>

      {/* News Section */}
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg font-medium">
            <div className="flex items-center">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Recent News
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Headline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companyDetails?.news && companyDetails.news.length > 0 ? (
                  companyDetails.news.map((news, index) => (
                    <tr key={news._id || index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(news.publishedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {news.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <a
                          href={`https://${news.source.uri}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {news.source.title}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {news.tags?.[0] || "News"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No recent news available at this time.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
