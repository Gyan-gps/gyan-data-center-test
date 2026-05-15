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

type TGraphData = {
  name: string;
  [key: string]: any;
};

type TBarGraphProps = {
  data: TGraphData[];
};

const BarGraphComponent = ({ data }: TBarGraphProps) => {
  // Get all keys except 'name' for the bars
  const dataKeys =
    Array.isArray(data) && data.length > 0
      ? Object.keys(data?.[0] || {}).filter((key) => key !== "name")
      : [];

  // Colors for the bars
  const chartColors = generateChartColors(dataKeys.length);

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
        {dataKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={chartColors[index]}
            radius={[8, 8, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

BarGraphComponent.displayName = "BarGraph";

export const BarGraph = memo(BarGraphComponent);
