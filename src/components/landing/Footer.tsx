import React from 'react';
import { APP_NAME } from '@/utils';

export const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="h-8 w-12">
                <img src="/Logo.png" alt={APP_NAME} className="h-8 w-full" />
              </div>
              <span className="text-sm font-semibold">{APP_NAME}</span>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Global projects & assets intelligence for data centers. Structured, benchmarkable, export-ready.
            </p>
          </div>
        </div>
        <div className="mt-8 text-xs text-slate-400">
          © {currentYear}. All Rights Reserved to Mordor Intelligence.
        </div>
      </div>
    </footer>
  );
};
