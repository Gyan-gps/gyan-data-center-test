import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Loading } from '@/components/ui'
import { MultiLineChart } from '@/components/charts'
import { getITLoadData } from '@/network'
import type { ITLoadData, ITLoadFilters } from '@/network'

interface ITLoadChartProps {
  filters?: ITLoadFilters
  title?: string
  height?: number
}

export const ITLoadChart: React.FC<ITLoadChartProps> = ({
  filters = {},
  title = "IT Load Analysis",
  height = 400
}) => {
  const [itLoadData, setItLoadData] = useState<ITLoadData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchITLoadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await getITLoadData({
          ...filters,
          limit: 1000,
          sortBy: 'year',
          sortOrder: 'asc'
        })

        if (response.success && response.data) {
          setItLoadData(response.data.items)
        } else {
          setError(response.error || 'Failed to load IT load data')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load IT load data')
      } finally {
        setLoading(false)
      }
    }

    fetchITLoadData()
  }, [filters])

  const chartData = useMemo(() => {
    if (!itLoadData.length) return []

    // Group data by year and aggregate by forecast/actual
    const yearlyData = itLoadData.reduce((acc, item) => {
      if (!acc[item.year]) {
        acc[item.year] = { actual: 0, forecast: 0, count: 0 }
      }
      
      if (item.forecast) {
        acc[item.year].forecast += item.value
      } else {
        acc[item.year].actual += item.value
      }
      acc[item.year].count++
      
      return acc
    }, {} as Record<number, { actual: number; forecast: number; count: number }>)

    const sortedYears = Object.keys(yearlyData)
      .map(Number)
      .sort((a, b) => a - b)

    // Convert to Recharts format
    return sortedYears.map(year => ({
      year: year.toString(),
      actual: yearlyData[year].actual,
      forecast: yearlyData[year].forecast
    }))
  }, [itLoadData])

  const summary = useMemo(() => {
    if (!itLoadData.length) return null

    const totalActual = itLoadData.filter(item => !item.forecast).reduce((sum, item) => sum + item.value, 0)
    const totalForecast = itLoadData.filter(item => item.forecast).reduce((sum, item) => sum + item.value, 0)
    const avgLoad = itLoadData.reduce((sum, item) => sum + item.value, 0) / itLoadData.length
    const countries = new Set(itLoadData.map(item => item.country)).size
    const operators = new Set(itLoadData.map(item => item.operator).filter(Boolean)).size

    return {
      totalActual,
      totalForecast,
      avgLoad,
      countries,
      operators,
      dataPoints: itLoadData.length
    }
  }, [itLoadData])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-red-600">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!itLoadData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            No IT load data available for the selected filters
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalActual.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Actual (MW)</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {summary.totalForecast.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Forecast (MW)</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {summary.avgLoad.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Avg Load (MW)</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {summary.countries}
              </div>
              <div className="text-sm text-gray-600">Countries</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {summary.operators}
              </div>
              <div className="text-sm text-gray-600">Operators</div>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {summary.dataPoints}
              </div>
              <div className="text-sm text-gray-600">Data Points</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: `${height}px` }}>
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">IT Load Trends Over Time</h3>
            </div>
            {chartData.length > 0 ? (
              <MultiLineChart
                data={chartData}
                xDataKey="year"
                lines={[
                  {
                    dataKey: "actual",
                    color: "#3B82F6",
                    name: "Actual"
                  },
                  {
                    dataKey: "forecast",
                    color: "#10B981",
                    name: "Forecast",
                    strokeDasharray: "5 5"
                  }
                ]}
                height={height - 80}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available for chart
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
