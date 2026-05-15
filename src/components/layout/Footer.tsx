import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-container mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-6">
        <div className="flex flex-col items-center space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div className="flex items-center space-x-1 sm:space-x-2 text-center md:text-left">
            <div className="w-fit h-4 sm:w-6 sm:h-6 bg-primary-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">DC</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">
              © {currentYear}. All Rights Reserved to Mordor Intelligence.
            </span>
          </div>
          
          <div className="flex  gap-4 items-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-gray-500 no-print">
            <a href="https://www.mordorintelligence.com/privacy-policy" target='_blank' rel="nofollow noopener noreferrer" className="hover:text-gray-900 transition-colors">
              Privacy Policy
            </a>
            <a href="https://www.mordorintelligence.com/terms-and-conditions" target='_blank' rel="nofollow noopener noreferrer" className="hover:text-gray-900 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
