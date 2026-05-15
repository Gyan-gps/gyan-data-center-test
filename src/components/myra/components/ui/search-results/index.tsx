import React, { useState } from "react";

import ResultsModal from "../../../components/browse-report-catalog/results-modal";

import { Button } from "../button";

type TSearchResults = {
  title: string;
  url: string;
  relevancy?: "not_relevant" | "relevant";
  page_summary?: string | null;
};

function SearchResults({
  search_results,
}: {
  search_results: TSearchResults[];
}) {
  const [showModal, setShowModal] = useState(false);

  function filtered_5_relevant_results(
    search_results: TSearchResults[]
  ): TSearchResults[] {
    if (!search_results) {
      return [];
    }

    if (search_results?.length <= 5) {
      return search_results;
    }

    // if not internet search return the first five results
    if (!search_results?.[0]?.relevancy) {
      return search_results.slice(0, 5);
    }

    const filtered_results: TSearchResults[] = [];

    for (let i = 0; i < search_results.length; i++) {
      if (search_results[i].relevancy === "relevant") {
        filtered_results.push(search_results[i]);
        if (filtered_results.length === 5) break;
      }
    }

    return filtered_results;
  }

  function extractDomain(url: string): string {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname;
    } catch (error) {
      console.error("Invalid URL:", error);
      return "";
    }
  }

  const get_website_logo = (url: string) => {
    return `https://icons.duckduckgo.com/ip3/${extractDomain(url)}.ico`;
  };

  return (
    <>
      <div className="my-3 flex flex-col items-stretch justify-start gap-3">
        {filtered_5_relevant_results(search_results).map(
          (result: TSearchResults, index: number) => (
            <div
              key={index}
              className="flex flex-col items-start justify-start gap-3 rounded-lg border border-gray-300 bg-white p-4 sm:flex-row"
            >
              <img
                alt="company-logo"
                height={30}
                src={get_website_logo(result.url)}
                width={30}
              />

              <div className="flex-1">
                <a
                  className="text-base font-medium text-black hover:underline"
                  href={result.url}
                >
                  {result.title}
                </a>
                <p className="mt-2 break-all text-sm font-light text-gray-500">
                  {result.page_summary || result.url}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      <Button variant="link" onClick={() => setShowModal(true)}>
        {`View all ${
          search_results?.length ? search_results?.length + " " : ""
        }${search_results?.[0]?.relevancy ? "sources" : "browsed reports"}`}
      </Button>

      {showModal ? (
        <ResultsModal
          open={showModal}
          results={search_results}
          onClose={() => setShowModal(false)}
        />
      ) : null}
    </>
  );
}

export default SearchResults;
