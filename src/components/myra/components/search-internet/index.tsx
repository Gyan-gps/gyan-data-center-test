import React from 'react'

import SearchQueries from '../ui/search-queries'
import SearchResults from '../ui/search-results'

type TSearchInternet = {
  heading: string
  time_taken: string
  data: { queries: string[]; search_results: TSearchInternetSearchResults[] }
}

type TSearchInternetSearchResults = {
  title: string
  url: string
  relevancy: 'not_relevant' | 'relevant'
  page_summary?: string | null
}

function SearchInternet({
  heading,
  time_taken,
  data: { queries, search_results }
}: TSearchInternet) {
  return (
    <div>
      <details>
        <summary>
          <p>{heading}</p>
          <span>{time_taken}</span>
        </summary>
        <div>
          {/* Queries */}
          <SearchQueries queries={queries} />
          <hr />
          {/* Search Results Wrapper */}
          <SearchResults search_results={search_results} />
        </div>
      </details>
    </div>
  )
}

export default SearchInternet
