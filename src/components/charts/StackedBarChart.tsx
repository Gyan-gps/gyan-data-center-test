import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface StackedBarChartProps {
  data: Record<string, unknown>[]
  xDataKey: string
  stackKeys: string[]
  colors?: string[]
  height?: number
  className?: string
}
  const capitalizeText = (str: string) => {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
// Custom tick component that wraps long labels
const WrappedTick = ({
  x,
  y,
  payload,
  width = 60,
  fontSize = 12
}: {
  x: number
  y: number
  payload: any
  width?: number
  fontSize?: number
}) => {
  const text = payload.value?.toString() ?? ''

  // word-based splitting
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word: string) => {
    const testLine = currentLine ? currentLine + ' ' + word : word

    // You can tune max character length here
    if (testLine.length > 12) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  })

  if (currentLine) lines.push(currentLine)

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, idx) => (
        <text
          key={idx}
          x={0}
          y={idx * (fontSize + 2)}
          dy={fontSize}
          textAnchor="middle"
          fontSize={fontSize}
          fill="#6b7280"
        >
          {line}
        </text>
      ))}
    </g>
  )
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 mb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600">{capitalizeText(entry.name)}:</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{(entry.value).toFixed(2)} MW</span>
          </div>
        ))}
        <div className="border-t border-gray-200 mt-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Total:</span>
            <span className="text-sm font-bold text-gray-900">
              {payload
                .reduce((sum: number, entry: any) => sum + entry.value, 0)
                .toFixed(2)} MW
            </span>
          </div>
        </div>
      </div>
    )
  }
  return null
}

export const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  xDataKey,
  stackKeys,
  colors = ['#4a90e2', '##7C9AB2', '#F59E0B', '#EF4444'],
  height = 300,
  className
}) => {
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* <XAxis
            dataKey={xDataKey}
            tick={<WrappedTick width={60} fontSize={12} />}
            interval="preserveStartEnd"
            height={60}
            axisLine={{ stroke: '#d1d5db' }}
          /> */}
          <XAxis
            dataKey={xDataKey}
            angle={-60}                 //  rotate vertical
            textAnchor="end"
            interval={0}                // show all labels
            height={80}                 // increase space
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />

          <Tooltip content={<CustomTooltip />} />

          {stackKeys.map((key, index) => (
            <Bar
              isAnimationActive={false}
              key={key}
              dataKey={key}
              stackId="a"
              fill={colors[index % colors.length]}
              radius={index === stackKeys.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * MOCK DATA STRUCTURE FOR REGIONAL DISTRIBUTION WITH STATUS BREAKDOWN
 * 
 * This is the expected data structure that the backend should return:
 * 
 * Example:
 */
export const mockRegionalDistributionData = [
  {
    region: 'Europe',
    Commissioned: 2500,
    'Under Construction': 600,
    Announced: 300,
    Cancelled: 56
  },
  {
    region: 'North America',
    Commissioned: 2100,
    'Under Construction': 500,
    Announced: 250,
    Cancelled: 55
  },
  {
    region: 'Asia',
    Commissioned: 1800,
    'Under Construction': 400,
    Announced: 150,
    Cancelled: 45
  },
  {
    region: 'Middle East',
    Commissioned: 180,
    'Under Construction': 60,
    Announced: 30,
    Cancelled: 10
  },
  {
    region: 'Africa',
    Commissioned: 200,
    'Under Construction': 40,
    Announced: 20,
    Cancelled: 4
  },
  {
    region: 'South America',
    Commissioned: 190,
    'Under Construction': 40,
    Announced: 20,
    Cancelled: 3
  },
  {
    region: 'Other',
    Commissioned: 180,
    'Under Construction': 35,
    Announced: 15,
    Cancelled: 2
  }
]

/**
 * BACKEND DATA STRUCTURE REQUIREMENTS:
 * 
 * The backend should return regionalDistribution in this format:
 * 
 * {
 *   "regionalDistribution": [
 *     {
 *       "region": "Europe",
 *       "Commissioned": 2500,
 *       "Under Construction": 600,
 *       "Announced": 300,
 *       "Cancelled": 56
 *     },
 *     ...
 *   ]
 * }
 * 
 * Each region object should contain:
 * - region: string (region name)
 * - Commissioned: number (count of commissioned datacenters)
 * - Under Construction: number (count of datacenters under construction)
 * - Announced: number (count of announced datacenters)
 * - Cancelled: number (count of cancelled datacenters)
 */
