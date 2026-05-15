import React from 'react'
import { Link, useLocation } from 'react-router'
import { 
  Home, 
  Map, 
  Building2, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Newspaper 
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { ROUTES } from '@/utils/constants'

const sidebarItems = [
  { name: 'Home', icon: Home, path: ROUTES.HOME },
  { name: 'Explorer', icon: Map, path: ROUTES.EXPLORER },
  { name: 'Companies', icon: Building2, path: ROUTES.COMPANIES },
  { name: 'IT Load', icon: TrendingUp, path: ROUTES.IT_LOAD },
  { name: 'Analytics', icon: BarChart3, path: ROUTES.ANALYTICS },
  { name: 'Reports', icon: FileText, path: ROUTES.REPORTS },
  { name: 'News', icon: Newspaper, path: ROUTES.NEWS },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()

  return (
    <aside className="h-full overflow-y-auto w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="mt-6 px-4">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
              >
                <Icon className={cn(
                  'w-5 h-5 mr-3',
                  isActive ? 'text-primary-600' : 'text-gray-400'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
