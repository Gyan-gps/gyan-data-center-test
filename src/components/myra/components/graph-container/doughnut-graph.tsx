import { memo } from "react";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { generateChartColors } from "../../lib/utils";

type TDoughnutData = {
  name: string;
  value: number;
};

type TDoughnutChartProps = {
  data: TDoughnutData[];
};

const DoughnutChartComponent = ({ data }: TDoughnutChartProps) => {
  const chartColors = generateChartColors(data.length);

  return (
    <ResponsiveContainer height={300} width="100%">
      <PieChart>
        <Tooltip
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #e1e8ed",
            backgroundColor: "#fff",
          }}
          formatter={(value: number) => `${value}`}
        />
        <Legend wrapperStyle={{ fontSize: "14px" }} />

        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          innerRadius={60} // 👈 Doughnut hole
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
          nameKey="name"
          outerRadius={90}
        >
          {data.map((entry, index) => (
            <Cell key={`doughnut-cell-${index}`} fill={chartColors[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

DoughnutChartComponent.displayName = "DoughnutChart";

export const DoughnutChartGraph = memo(DoughnutChartComponent);
