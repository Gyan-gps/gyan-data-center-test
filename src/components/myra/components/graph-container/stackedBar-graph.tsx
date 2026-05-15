import { memo } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { generateChartColors } from "../../lib/utils";

type TStackedBarData = {
  name: string;
  [key: string]: number | string;
};

type TStackedBarChartProps = {
  data: TStackedBarData[];
};

const StackedBarChartComponent = ({ data }: TStackedBarChartProps) => {
  const barKeys = Object.keys(data?.[0] || {}).filter((key) => key !== "name");

  const chartColors = generateChartColors(barKeys.length);
  return (
    <ResponsiveContainer height={300} width="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          contentStyle={{
            borderRadius: "0.5rem",
            border: "1px solid #e1e8ed",
            backgroundColor: "#fff",
          }}
        />
        <Legend />
        {barKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartColors[index]}
            stackId="stack"
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

StackedBarChartComponent.displayName = "StackedBarChart";

export const StackedBarChart = memo(StackedBarChartComponent);
