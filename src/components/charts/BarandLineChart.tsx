import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"
interface BarChartProps {
  data: Record<string, unknown>[]
  xDataKey: string
  yDataKey: string
  color?: string
  height?: number
  className?: string
  tooltipFields?: { key: string; label: string; color?: string; suffix?: string }[]

}
export const BarandLineChart = ({ data, xDataKey, yDataKey, tooltipFields }: BarChartProps) => (
  <ResponsiveContainer width="100%" height={240}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

      
      <XAxis
      dataKey="period"
        angle={-60}                 //  rotate vertical
        textAnchor="end"
        interval={0}                // show all labels
        height={80}                 // increase space
        tick={{ fontSize: 12, fill: '#6b7280' }}
        axisLine={{ stroke: '#d1d5db' }}
      />

      <YAxis tick={{ fontSize: 12 }} />

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
                        <p style={{ fontWeight: 600, marginBottom: 4 }}>{d[xDataKey]}</p>
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

      <Bar isAnimationActive={false} dataKey="capacity" fill="#4a90e2" radius={[4,4,0,0]} />

      <Line
        isAnimationActive={false}
        type="monotone"
        dataKey="absorption"
        stroke="#111827"
        strokeWidth={2}
      />
    </ComposedChart>
  </ResponsiveContainer>
)