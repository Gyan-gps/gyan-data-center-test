import React from 'react'
import { Input, Button } from '@/components/ui'
import { Search, Download, Plus } from 'lucide-react'

interface SearchBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchValue,
  onSearchChange
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search data centers with AI assistance..."
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 px-3 py-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          
          <Button 
            className="flex items-center gap-2 px-3 py-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
