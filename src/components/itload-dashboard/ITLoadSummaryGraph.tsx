import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Zap, Database, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Loading } from '@/components/ui';
import { getITLoadSummary } from '@/network/datacenter/datacenter.api';
import { convertFilterStateToITLoadFilters } from '@/utils';
import type { FilterState } from '@/network';

interface ITLoadSummaryGraphProps {
  filters: FilterState;
  searchValue: string;
}

// Query function for fetching IT load summary
const fetchITLoadSummary = async (filters: FilterState, searchValue: string) => {
  // Convert FilterState to ITLoadFilters (excluding page/limit)
  const itLoadFilters = convertFilterStateToITLoadFilters(filters, searchValue);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page, limit, ...summaryFilters } = itLoadFilters;
  
  return await getITLoadSummary(summaryFilters);
};

export const ITLoadSummaryGraph: React.FC<ITLoadSummaryGraphProps> = ({ 
  filters, 
  searchValue 
}) => {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  // Use React Query for data fetching and caching
  const {
    data: summaryData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['itLoadSummary', filters, searchValue],
    queryFn: () => fetchITLoadSummary(filters, searchValue),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Convert error to string for display
  const errorMessage = error ? (error instanceof Error ? error.message : 'Failed to load summary data') : null;

  // Format tooltip values
  const formatTooltip = (value: number) => {
    return [`${value.toFixed(2)} MW`, 'Total IT Load'];
  };

  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k MW`;
    }
    return `${value.toFixed(0)} MW`;
  };

  if (isLoading) {
    return (
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Loading />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !summaryData) {
    return (
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>{errorMessage || 'No data available'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Summary
            </CardTitle>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === 'bar' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  chartType === 'line' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Line
              </button>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 " />
                <span className="text-sm font-medium">Total Records</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {summaryData.totalRecords.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 " />
                <span className="text-sm font-medium ">Total Capacity</span>
              </div>
              <p className="text-xl font-bold text-green-900 mt-1">
                {summaryData.totalCapacity.toLocaleString()} MW
              </p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 " />
                <span className="text-sm font-medium">Avg per Year</span>
              </div>
              <p className="text-xl font-bold mt-1">
                {(summaryData.totalCapacity / summaryData.yearlyData.length).toFixed(1)} MW
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={summaryData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="totalLoad" 
                    fill="#3b82f6" 
                    radius={[4, 4, 0, 0]}
                    name="Total IT Load"
                  />
                </BarChart>
              ) : (
                <LineChart data={summaryData.yearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="year" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={formatYAxis}
                  />
                  <Tooltip 
                    formatter={formatTooltip}
                    labelFormatter={(label) => `Year: ${label}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalLoad" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#1d4ed8' }}
                    name="Total IT Load"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};