import React from "react";

import dropdownIcon from "@/assets/icons/dropdown.svg";

import SearchResults from "../ui/search-results";

type TBrowseReportCatalog = {
  catalog_search_results: [];
};

function BrowseReportCatalog({ catalog_search_results }: TBrowseReportCatalog) {
  if (!catalog_search_results || catalog_search_results.length === 0) {
    return null;
  }

  return (
    <details className="group my-3 rounded-xl border border-gray-400 p-3">
      <summary className="remove-dropdown-icon relative flex cursor-pointer select-none list-none items-center justify-between">
        <span className="text-xs font-normal text-gray-700">
          Browse Report Catalog
        </span>
        <img alt="icon" height={20} src={dropdownIcon} width={20} />
      </summary>

      <div className="mt-2">
        <p className="text-right text-xs text-gray-600">
          Total reports browsed:{" "}
          <strong>{catalog_search_results.length}</strong>
        </p>
        <SearchResults search_results={catalog_search_results} />
      </div>
    </details>
  );
}

export default BrowseReportCatalog;
