import { navigationRoutes } from "@/components/layout/Header";

export const redirectUserToPageAfterLogin = (
  allowedPages: string[],
  defaultPage: string = "/profile"
) => {
  const pagesMap: { [key: string]: string } = navigationRoutes.reduce(
    (map, route) => {
      if (route.requiresPage) {
        map[route.requiresPage] = route.path;
      }
      return map;
    },
    {} as { [key: string]: string }
  );

  if (allowedPages.length === 0) {
    return "/profile";
  }

  if (allowedPages.includes("Home")) {
    return pagesMap["Home"] || defaultPage;
  }

  for (const page of allowedPages) {
    if (pagesMap[page]) {
      return pagesMap[page];
    }
  }

  return defaultPage;
};

export const scrollToTop = () => {
  window.scrollTo(0, 0);
};

export const formatValue = (value: unknown): string | null => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    String(value).toLowerCase() === "null"
  ) {
    return null;
  }
  // Handle arrays (like Company Type)
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(", ") : null;
  }
  return String(value);
};

export const formatToMillions = (value: unknown): string => {
  const numValue = Number(formatValue(value));
  if (isNaN(numValue) || numValue === 0) return "";

  const millions = numValue / 1000000;

  // Use Math.ceil to round up to 2 decimal places
  const ceiledMillions = Math.ceil(millions * 100) / 100;

  // Always show 2 decimal places with commas
  return `$${ceiledMillions.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} M`;
};

export const formatCompanyNameToRedirect = (name: string) => {
  // replace spaces and special characters with hyphens
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "")
    .toLowerCase();
};

export const formatDataCenterStatus = (
  status?: string
): "default" | "success" | "warning" | "error" | "info" => {
  if (!status) return "default";
  const statusMap: {
    [key: string]: "default" | "success" | "warning" | "error" | "info";
  } = {
    announced: "info",
    "under construction": "warning",
    commissioned: "success",
    cancelled: "error",
  };
  return statusMap[status.toLowerCase()] || "default";
};

export const getCurrentYearItLoadCapacity = (
  itLoadCapacities: { year: number; capacity_mw: number }[] | null
): number | null => {
  if(!itLoadCapacities) return null;
  const currentYear = new Date().getFullYear();
  const currentYearData = itLoadCapacities.find(
    (item) => item.year === currentYear
  );
  return currentYearData ? currentYearData.capacity_mw : null;
};

export const getExpectedItLoadCapacity = (
  itLoadCapacities: { year: number; capacity_mw: number }[] | null,
  targetYear: number
): number | null => {
  if(!itLoadCapacities) return null;
  const targetYearData = itLoadCapacities.find(
    (item) => item.year === targetYear
  );
  return targetYearData ? targetYearData.capacity_mw : null;
};
