/**
 * Country Code Dropdown Component
 * A dropdown for selecting country codes for phone numbers
 */

import React, { useState, useEffect } from "react";
import { Select } from "@/components/ui";
import {
  fetchCountryList,
  type CountryCodeOption,
} from "@/network/contact/contact.api";

interface CountryCodeDropdownProps {
  value: string;
  onChange: (value: string, countryName?: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const CountryCodeDropdown: React.FC<CountryCodeDropdownProps> = ({
  value,
  onChange,
  error,
  placeholder = "Country code",
  className = "",
  disabled = false,
}) => {
  const [countries, setCountries] = useState<CountryCodeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        setLoading(true);
        const countryList = await fetchCountryList();
        setCountries(countryList);
      } catch (error) {
        console.error("Failed to load countries:", error);
        // If API fails, we should still get fallback countries from fetchCountryList
        // But let's add an extra fallback just in case
        const fallbackCountries = [
          { code: "+91", country: "IN", name: "India" },
          { code: "+1", country: "US", name: "United States" },
          { code: "+44", country: "GB", name: "United Kingdom" },
          { code: "+49", country: "DE", name: "Germany" },
          { code: "+33", country: "FR", name: "France" },
        ];
        setCountries(fallbackCountries);
      } finally {
        setLoading(false);
      }
    };

    loadCountries();
  }, []);

  // For testing - let's use hardcoded options to see if Select works
  const testOptions = [
    { value: "+91", label: "+91 India", ogLabel: "India", code: "+91" },
    {
      value: "+1",
      label: "+1 United States",
      ogLabel: "United States",
      code: "+1",
    },
    {
      value: "+44",
      label: "+44 United Kingdom",
      ogLabel: "United Kingdom",
      code: "+44",
    },
    { value: "+49", label: "+49 Germany", ogLabel: "Germany", code: "+49" },
    { value: "+33", label: "+33 France", ogLabel: "France", code: "+33" },
  ];

  const options =
    countries.length > 0
      ? countries.map((country) => ({
          value: country.code,
          label: country.name,

          code: country.code,
        }))
      : testOptions;

  if (loading) {
    return (
      <div className={`flex flex-col ${className}`}>
        <div className="w-full h-10 bg-gray-100 rounded animate-pulse" />
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  // If no countries loaded, show a simple input instead
  if (countries.length === 0) {
    return (
      <div className={`flex flex-col ${className}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#007ea7] focus:border-transparent"
        />
        {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <Select
        value={value}
        onChange={(selectedValue) => {
          if (typeof selectedValue === "string") {
            const selectedCountry = countries.find(c => c.code === selectedValue);
            onChange(selectedValue, selectedCountry?.name);
          }
        }}
        from="country-code-dropdown"
        placeholder={placeholder}
        options={options}
        searchable
        disabled={loading || disabled}
        className="md:w-full"
      />
      {error && <span className="mt-1 text-sm text-red-500">{error}</span>}
    </div>
  );
};

export default CountryCodeDropdown;
