import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Calendar } from 'lucide-react';
import { fetchAdminNews } from '@/network/admin/admin.api';
import { AdminNewsTable } from '@/components/admin/AdminNewsTable';
import { Pagination, Input } from '@/components/ui';
import { useAdminNewsStore } from '@/store/adminNewsStore';
import AdminAnalytics from './AdminAnalytics';

interface NewsResponse {
  news: any[];
  total: number;
  page: number;
  limit: number;
}

export const AdminNews: React.FC = () => {
  const {
    currentPage,
    searchQuery,
    debouncedSearch,
    pageLimit,
    startDate,
    endDate,
    appliedStartDate,
    appliedEndDate,
    activeTab,
    news,
    total,
    setState,
  } = useAdminNewsStore();

  const today = new Date().toISOString().split('T')[0];

  const getDateValidationError = (): string | null => {
    if (!startDate && !endDate) return null;
    if (startDate && startDate > today) return 'Start date cannot be in the future';
    if (endDate && endDate > today) return 'End date cannot be in the future';
    if (startDate && endDate && startDate > endDate)
      return 'Start date cannot be after end date';
    return null;
  };

  const validationError = getDateValidationError();
  const isApplyDisabled = !!validationError || (!startDate && !endDate);

  const { data, isLoading, isFetching } = useQuery<NewsResponse>({
    queryKey: [
      'admin-news',
      currentPage,
      pageLimit,
      debouncedSearch,
      appliedStartDate,
      appliedEndDate,
    ],
    queryFn: () =>
      fetchAdminNews({
        page: currentPage,
        limit: pageLimit,
        search: debouncedSearch,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
      }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data) return;
    setState({
      news: data.news,
      total: data.total,
    });
  }, [data, setState]);

  const handlePageChange = (newPage: number) => {
    setState({ currentPage: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = () => {
    setState({ currentPage: 1, debouncedSearch: searchQuery });
  };

  const handleLimitChange = (newLimit: number) => {
    setState({ pageLimit: newLimit, currentPage: 1 });
  };

  const handleApplyDateFilter = () => {
    if (validationError) return;
    setState({
      currentPage: 1,
      appliedStartDate: startDate,
      appliedEndDate: endDate,
    });
  };

  const handleClearAll = () => {
    setState({
      searchQuery: '',
      debouncedSearch: '',
      startDate: '',
      endDate: '',
      appliedStartDate: '',
      appliedEndDate: '',
      currentPage: 1,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">News Management</h2>
        <p className="text-gray-600 text-sm">
          Browse and manage all news articles in the system
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setState({ activeTab: 'news' })}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'news'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          News
        </button>

        <button
          onClick={() => setState({ activeTab: 'analytics' })}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'analytics'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'news' && (
        <div className="space-y-4">
          {/* ---------- Filter Bar ---------- */}
          <div className="bg-white rounded-lg shadow p-2 sm:p-3">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setState({ searchQuery: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-8 pr-3 text-sm"
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">From</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={startDate}
                    max={today}
                    onChange={(e) => setState({ startDate: e.target.value })}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex-1">
                <label className="text-xs text-gray-600 block mb-1">To</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={endDate}
                    max={today}
                    onChange={(e) => setState({ endDate: e.target.value })}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleApplyDateFilter}
                disabled={isApplyDisabled}
                className="px-3 sm:px-4 py-2 bg-green-600 text-white text-sm rounded disabled:opacity-50"
              >
                Apply
              </button>

              <select
                value={pageLimit}
                onChange={(e) => handleLimitChange(parseInt(e.target.value))}
                className="px-2 py-2 text-sm border rounded"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>

              {(debouncedSearch || appliedStartDate || appliedEndDate) && (
                <button
                  onClick={handleClearAll}
                  className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Status */}
            <div className="text-xs text-gray-600 mt-2">
              Page {currentPage} • {total} total
            </div>
          </div>

          {/* ---------- Table ---------- */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <AdminNewsTable news={news} isLoading={isLoading || isFetching} />
          </div>

          {/* ---------- Pagination ---------- */}
          {!isLoading && news.length > 0 && total > 0 && (
            <Pagination
              currentPage={currentPage}
              totalCount={total}
              itemsPerPage={pageLimit}
              onPageChange={handlePageChange}
              loading={isFetching}
              hasMore={currentPage * pageLimit < total}
              className="pt-4"
            />
          )}
        </div>
      )}

      {activeTab === 'analytics' && <AdminAnalytics />}
    </div>
  );
};
