import { getAllGeography } from "@/network";
import { type Geography } from "@/network/datacenter/datacenter.types";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type ChildrenProps = {
  regions: string[];
  countries: string[];
  cities: string[];
  isCountriesEnabled: boolean;
  isCitiesEnabled: boolean;
};

type GeographyFilters = {
  regions?: string[];
  countries?: string[];
  cities?: string[];
};

type GeographyOptions = {
  regions: string[];
  countries: string[];
  cities: string[];
  excludedCities?: string[];
};

export function GeographySelect({
  children,
  filters,
  options,
}: {
  children: (props: ChildrenProps) => React.ReactNode;
  filters: GeographyFilters;
  options?: GeographyOptions;
}) {
  const {
    data: geographies,
    isLoading,
    isSuccess,
  } = useQuery<Geography[]>({
    queryKey: ["geographies"],
    queryFn: getAllGeography,
    staleTime: Infinity,
    enabled: true, // ← always fetch, needed for cascading regardless of options
  });

  const [regions, setRegions] = useState<string[]>(options?.regions ?? []);
  const [countries, setCountries] = useState<string[]>(
    options?.countries ?? [],
  );
  const [cities, setCities] = useState<string[]>(options?.cities ?? []);

  // Set base lists from options or full geographies
  useEffect(() => {
    if (options) {
      setRegions(options.regions);
      // Don't reset countries/cities here — cascading effect below handles it
      return;
    }

    if (!isSuccess || !geographies) return;

    const r = new Set<string>();
    const c = new Set<string>();
    const ci = new Set<string>();
    for (const geo of geographies) {
      r.add(geo.region);
      c.add(geo.country);
      ci.add(geo.city);
    }
    setRegions(Array.from(r).sort());
    setCountries(Array.from(c).sort());
    setCities(Array.from(ci).sort());
  }, [options, isSuccess, geographies]);

  // Cascading — always uses raw geographies for accurate narrowing
  useEffect(() => {
    if (!geographies) return;

    const selectedRegions = filters.regions ?? [];
    const selectedCountries = filters.countries ?? [];

    // Narrow countries
    if (selectedRegions.length > 0) {
      const set = new Set<string>();
      for (const geo of geographies) {
        if (selectedRegions.includes(geo.region)) set.add(geo.country);
      }
      setCountries(Array.from(set).sort());
    } else {
      // No region selected — show full list (from options or all geographies)
      if (options) {
        setCountries(options.countries);
      } else {
        const set = new Set<string>();
        for (const geo of geographies) set.add(geo.country);
        setCountries(Array.from(set).sort());
      }
    }

    // Narrow cities
    if (selectedCountries.length > 0) {
      const set = new Set<string>();
      for (const geo of geographies) {
        if (
          selectedCountries.includes(geo.country) &&
          !options?.excludedCities?.includes(geo.city)
        )
          set.add(geo.city);
      }
      setCities(Array.from(set).sort());
    } else if (selectedRegions.length > 0) {
      const set = new Set<string>();
      for (const geo of geographies) {
        if (
          selectedRegions.includes(geo.region) &&
          !options?.excludedCities?.includes(geo.city)
        )
          set.add(geo.city);
      }
      setCities(Array.from(set).sort());
    } else {
      if (options) {
        setCities(options.cities);
      } else {
        const set = new Set<string>();
        for (const geo of geographies) {
          if (!options?.excludedCities?.includes(geo.city)) set.add(geo.city);
        }
        setCities(Array.from(set).sort());
      }
    }
  }, [filters, geographies, options]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {children({
        regions,
        countries,
        cities,
        isCountriesEnabled: Boolean(
          filters.regions && filters.regions.length > 0,
        ),
        isCitiesEnabled: Boolean(
          filters.countries && filters.countries.length > 0,
        ),
      })}
    </>
  );
}
