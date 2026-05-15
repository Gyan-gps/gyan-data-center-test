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

type TPieData = {
  name: string;
  value: number;
};

type TPieChartProps = {
  data: TPieData[];
};

const PieChartComponent = ({ data }: TPieChartProps) => {
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
          fill="#8884d8"
          label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
          nameKey="name"
          outerRadius={90}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

PieChartComponent.displayName = "PieChart";

export const PieChartGraph = memo(PieChartComponent);
