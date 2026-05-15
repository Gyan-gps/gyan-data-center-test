import React, { useMemo, useState } from "react";

import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type TSearchResults = {
  title: string;
  url: string;
  page_summary?: string | null;
};

function get_website_logo(url: string): string {
  return `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
}

function ResultsModal({
  open,
  onClose,
  results,
}: {
  open: boolean;
  onClose: () => void;
  results: TSearchResults[];
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const filteredResults = useMemo(() => {
    return results.filter((result) =>
      result.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  const totalPages = Math.ceil(filteredResults.length / pageSize) || 1;

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResults.slice(start, start + pageSize);
  }, [filteredResults, currentPage]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-medium">Results</DialogTitle>
        </DialogHeader>

        <input
          className="mb-4 w-full rounded border px-3 py-2 text-sm"
          placeholder="Search results..."
          type="text"
          value={searchTerm}
          onChange={handleSearch}
        />

        <div className="flex h-[400px] flex-col gap-3 overflow-y-auto border-t pt-2">
          {paginatedResults.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              No matching results found.
            </div>
          ) : (
            paginatedResults.map((result, index) => (
              <div
                key={index}
                className="flex items-start justify-start gap-3 rounded-lg border border-gray-300 bg-white p-4"
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
                    target="_blank"
                  >
                    {result.title}
                  </a>
                  <p className="mt-2 break-all text-sm font-light text-gray-500">
                    {result.page_summary || result.url}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            disabled={currentPage === 1}
            variant="outline"
            onClick={handlePrevPage}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            disabled={currentPage === totalPages}
            variant="outline"
            onClick={handleNextPage}
          >
            Next
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ResultsModal;
