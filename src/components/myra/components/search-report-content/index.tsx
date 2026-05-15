import React from 'react'

import SearchQueries from '../ui/search-queries'

type TSearchReportContent = {
  data: {
    queries: string[]
  }
}

function SearchReportContent({ data }: TSearchReportContent) {
  return (
    <div>
      <SearchQueries queries={data.queries} />
    </div>
  )
}

export default SearchReportContent
