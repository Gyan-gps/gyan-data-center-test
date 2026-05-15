import { BarGraph } from './bar-graph'
import { ColumnGraph } from './column-graph'
import { DoughnutChartGraph } from './doughnut-graph'
import { LineGraph } from './line-graph'
import { PieChartGraph } from './pie-graph'
import { StackedBarChart } from './stackedBar-graph'

type TGraphContainerProps = {
  type: 'bar' | 'line' | 'pie' | 'stackedBar' | 'doughnut' | 'column'
  data: any
  title?: string
}

export const GraphContainer = ({ type, data, title }: TGraphContainerProps) => {
  return (
    <div className="my-4 rounded-lg border bg-card p-4">
      {title && (
        <h3 className="mb-4 text-base font-medium text-muted-foreground">
          {title}
        </h3>
      )}
      {type === 'bar' && <BarGraph data={data} />}
      {type === 'column' && <ColumnGraph data={data} />}
      {type === 'line' && <LineGraph data={data} />}
      {type === 'pie' && <PieChartGraph data={data} />}
      {type === 'stackedBar' && <StackedBarChart data={data} />}
      {type === 'doughnut' && <DoughnutChartGraph data={data} />}
    </div>
  )
}
