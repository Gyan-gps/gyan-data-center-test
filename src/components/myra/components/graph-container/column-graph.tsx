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

type TColumnGraphProps = {
  data: TGraphData[];
};

const ColumnGraphComponent = ({ data }: TColumnGraphProps) => {
  // Get all keys except 'name' for the bars
  const dataKeys =
    Array.isArray(data) && data.length > 0
      ? Object.keys(data?.[0] || {}).filter((key) => key !== "name")
      : [];

  // Generate consistent colors
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
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

ColumnGraphComponent.displayName = "ColumnGraph";

export const ColumnGraph = memo(ColumnGraphComponent);
