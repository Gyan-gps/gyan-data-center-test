import React, { useState } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/utils/cn'
import { trackSiteSearch } from '@/utils/ga'
import { useAuthStore } from '@/store/authStore'

interface SearchBoxProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
  defaultValue?: string
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  onSearch,
  placeholder = 'Search...',
  className,
  defaultValue = ''
}) => {
  const [query, setQuery] = useState(defaultValue)
  const { user } = useAuthStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedQuery = query.trim()
    
    // Track search event
    if (trimmedQuery && user) {
      trackSiteSearch(trimmedQuery, user.id.toString(), user.email)
    }
    
    onSearch(trimmedQuery)
  }

  const handleClear = () => {
    setQuery('')
    onSearch('')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
