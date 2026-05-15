import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface MultiLineChartProps {
  data: Record<string, unknown>[]
  xDataKey: string
  lines: {
    dataKey: string
    color: string
    name: string
    strokeDasharray?: string
  }[]
  height?: number
  className?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderTooltip?: (payload: any, label: string) => React.ReactNode
  yAxisLabel?: string
  yAxisUnit?: string
}

export const MultiLineChart: React.FC<MultiLineChartProps> = ({
  data,
  xDataKey,
  lines,
  height = 300,
  className,
  renderTooltip,
  yAxisLabel,
  yAxisUnit = '',
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    if (renderTooltip) return <>{renderTooltip(payload, label)}</>
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3">
        <p className="font-semibold text-sm text-gray-700 mb-1">{label}</p>
        {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
          <p key={i} style={{ color: entry.color }} className="text-xs">
            {entry.name}: {Number(entry.value).toLocaleString()}{yAxisUnit}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey={xDataKey}
            tick={{ fontSize: 11, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            angle={-30}
            textAnchor="end"
            height={50}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#6b7280' } } : undefined}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          {lines.map((line, index) => (
            <Line
              isAnimationActive={false}
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={2}
              strokeDasharray={line.strokeDasharray}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5, stroke: line.color, strokeWidth: 2 }}
              connectNulls
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
