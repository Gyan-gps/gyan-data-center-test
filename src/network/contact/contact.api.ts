/**
 * Contact Us API Functions
 * Handles contact form submissions to the public API
 */

import { publicApiClient } from "@/services/api";
import type {
  ContactUsRequest,
  ContactUsResponse,
  CountryCodeResponse,
  CountryListResponse,
  CountryFromBackend,
  CountryCodeOption,
} from "./contact.types";

// Re-export types for convenience
export type { CountryCodeOption } from "./contact.types";

/**
 * Submit contact us form
 */
export const submitContactForm = async (
  data: ContactUsRequest
): Promise<ContactUsResponse> => {

  const response = await publicApiClient.post<ContactUsResponse>(
    "/public/demo-request",
    data
  );
  return response.data;
};

/**
 * Get current country code based on IP
 */
export const getCurrentCountryCode = async (): Promise<CountryCodeResponse> => {
  try {
    // You can replace this with your actual IP geolocation service
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      country: data.country_code || "IN",
      countryCode: data.country_calling_code || "+91",
      countryName: data.country_name || "India",
    };
  } catch {
    // Default to India if geolocation fails
    return {
      country: "IN",
      countryCode: "+91",
      countryName: "India",
    };
  }
};

/**
 * Fetch all countries from backend
 */
export const fetchCountryList = async (): Promise<CountryCodeOption[]> => {
  try {
    const response = await publicApiClient.get<CountryListResponse>(
      "/public/country-flag-list"
    );
    // Transform backend data to frontend format
    return response.data.map((country: CountryFromBackend) => ({
      code: `+${country.calling_code}`,
      country: country.country_code,
      name: country.country_name,
    }));
  } catch (error) {
    console.error("Failed to fetch country list:", error);
    // Return fallback country list
    return FALLBACK_COUNTRY_CODES;
  }
};

// Fallback country codes for dropdown (used when API fails)
export const FALLBACK_COUNTRY_CODES: CountryCodeOption[] = [
  { code: "+1", country: "US", name: "United States" },
  { code: "+1", country: "CA", name: "Canada" },
  { code: "+44", country: "GB", name: "United Kingdom" },
  { code: "+49", country: "DE", name: "Germany" },
  { code: "+33", country: "FR", name: "France" },
  { code: "+39", country: "IT", name: "Italy" },
  { code: "+34", country: "ES", name: "Spain" },
  { code: "+31", country: "NL", name: "Netherlands" },
  { code: "+46", country: "SE", name: "Sweden" },
  { code: "+47", country: "NO", name: "Norway" },
  { code: "+45", country: "DK", name: "Denmark" },
  { code: "+41", country: "CH", name: "Switzerland" },
  { code: "+43", country: "AT", name: "Austria" },
  { code: "+32", country: "BE", name: "Belgium" },
  { code: "+81", country: "JP", name: "Japan" },
  { code: "+82", country: "KR", name: "South Korea" },
  { code: "+86", country: "CN", name: "China" },
  { code: "+91", country: "IN", name: "India" },
  { code: "+65", country: "SG", name: "Singapore" },
  { code: "+61", country: "AU", name: "Australia" },
  { code: "+64", country: "NZ", name: "New Zealand" },
  { code: "+55", country: "BR", name: "Brazil" },
  { code: "+52", country: "MX", name: "Mexico" },
  { code: "+27", country: "ZA", name: "South Africa" },
];

// For backward compatibility - use fetchCountryList() instead
export const COUNTRY_CODES = FALLBACK_COUNTRY_CODES;
