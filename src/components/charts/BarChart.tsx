import React from 'react'
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface BarChartProps {
  data: Record<string, unknown>[]
  xDataKey: string
  yDataKey: string
  color?: string
  height?: number
  className?: string
  tooltipFields?: { key: string; label: string; color?: string; suffix?: string }[]
  ranked?: boolean

}
const COLORS = [
  '#10B981', // light blue
  '#0EA5E9', // light indigo
   '#FF006E', // light green
  '#F97316', // light yellow
  '#8B7D6B', // light red
  '#f9a8d4', // light pink
  '#67e8f9', // light cyan
]

// Custom tick component that wraps long labels
const WrappedTick = ({
  x,
  y,
  payload,
  width = 60,
  fontSize = 8
}: {
  x: number
  y: number
  payload: any
  width?: number
  fontSize?: number
}) => {
    // Strip the __index suffix added for uniqueness
  const text = (payload.value?.toString() ?? '').replace(/__\d+$/, '')

  // word-based splitting
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  words.forEach((word: string) => {
    const testLine = currentLine ? currentLine + ' ' + word : word

    // You can tune max character length here
    if (testLine.length > 8) {
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

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xDataKey,
  yDataKey,
  color = '#4a90e2',
  height = 300,
  className,
  tooltipFields,
  ranked = false
}) => {
    const isMobile = window.innerWidth < 768
  const intervalValue = isMobile ? 1 : 0
  return (
    <div className={className} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey={xDataKey}
            tick={(props: any) => <WrappedTick {...props} width={60} fontSize={12} />}
            interval={intervalValue}
            height={60} // increased height to fit wrapped text
            axisLine={{ stroke: '#d1d5db' }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#d1d5db' }}
          />

         <Tooltip
            content={tooltipFields ? ({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: 12
                }}>
                  {/* show rank if ranked == true */}
                  {ranked && (() => {
                    const rank = d.rank

                    const getSuffix = (n: number) => {
                      if (n % 10 === 1 && n % 100 !== 11) return 'st'
                      if (n % 10 === 2 && n % 100 !== 12) return 'nd'
                      if (n % 10 === 3 && n % 100 !== 13) return 'rd'
                      return 'th'
                    }

                    const getBadgeStyle = () => {
                      if (rank === 1) return { background: '#FEF9C3', color: '#854D0E' }
                      if (rank === 2) return { background: '#F1F5F9', color: '#334155' }
                      if (rank === 3) return { background: '#FFEDD5', color: '#9A3412' }
                      return { background: '#F8FAFC', color: '#475569' }
                    }

                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 8,
                        padding: '6px 10px',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid #f1f5f9'
                      }}>

                        {/* Badge */}
                        <span style={{
                          ...getBadgeStyle(),
                          padding: '5px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 700,
                          minWidth: 30,
                          textAlign: 'center',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                          {rank}
                        </span>

                        {/* Text block */}
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>

                          <span style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: '#0f172a'
                          }}>
                            {rank}{getSuffix(rank)} Place
                          </span>

                          <span style={{
                            fontSize: 11,
                            color: '#64748b'
                          }}>
                            {d['label']}
                          </span>

                        </div>

                      </div>
                    )
                  })()}
                  {tooltipFields.map(f => (
                    <p key={f.key} style={{ color: f.color ?? '#6b7280' }}>
                      {f.label}: {d[f.key]}{f.suffix ?? ''}
                    </p>
                  ))}
                </div>
              )
            } : undefined}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />

          <Bar dataKey={yDataKey} radius={[4, 4, 0, 0]}>
  {data.map((_, index) => (
    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
  ))}
</Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
