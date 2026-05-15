import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface PieChartProps {
  data: Record<string, unknown>[]
  dataKey: string
  nameKey: string
  colors?: string[]
  height?: number
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  renderTooltip?: (props: Record<string, unknown>) => React.ReactElement | null
  outerRadius?: number
}

const DEFAULT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];
const colorsMapWithStatus = {
  Cancelled: '#EF4444',
  "Under Construction": '#F59E0B',
  Commissioned: '#10B981',
  Announced: '#8B5CF6',
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  dataKey,
  nameKey,
  colors = DEFAULT_COLORS,
  height = 300,
  className,
  showLegend = true,
  showTooltip = true,
  renderTooltip
  , outerRadius
}) => {
  // compute radius proportional to container height when not provided
  const computedOuter = outerRadius ?? Math.max(24, Math.floor(Number(height) * 0.36))

  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            isAnimationActive={false}
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={computedOuter}
            innerRadius={0}
            paddingAngle={2}
          >
            {data.map((d, index) => {
              return (
                 <Cell key={`cell-${index}`} fill={colorsMapWithStatus[d.status as keyof typeof colorsMapWithStatus]} />
              )
            })}
          </Pie>
          {showTooltip && (
            <Tooltip
              content={renderTooltip}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
            />
          )}
          {showLegend && (
            <Legend 
              wrapperStyle={{ 
                fontSize: '14px',
                paddingLeft: '20px'
              }}
              iconType="circle"
              align="center"
              verticalAlign="bottom"
              layout="horizontal"
            />
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
