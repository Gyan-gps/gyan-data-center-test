import React from 'react'

function SearchQueries({ queries }: { queries: string[] }) {
  return (
    <div className="my-4">
      <h3 className="my-3 px-3 text-sm font-normal text-gray-700">
        Analyzing market intelligence
      </h3>
      <div className="flex flex-wrap items-center justify-start gap-2">
        {queries.map((query: string, index: number) => (
          <p
            key={index}
            className="w-fit rounded-full border border-primary bg-white px-3 py-1.5 text-xs text-primary sm:px-2 sm:py-1 sm:text-sm"
          >
            {query}
          </p>
        ))}
      </div>
    </div>
  )
}

export default SearchQueries
