import { memo } from "react";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

type TLineGraphProps = {
  data: TGraphData[];
};

const LineGraphComponent = ({ data }: TLineGraphProps) => {
  // Get all keys except 'name' for the lines
  const dataKeys =
    Array.isArray(data) && data.length > 0
      ? Object.keys(data?.[0] || {}).filter((key) => key !== "name")
      : [];

  // Colors for the lines
  const chartColors = generateChartColors(dataKeys.length);

  return (
    <ResponsiveContainer height={300} width="100%">
      <LineChart
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
          <Line
            key={key}
            activeDot={{ r: 6 }}
            dataKey={key}
            dot={{ fill: chartColors[index] }}
            stroke={chartColors[index]}
            strokeWidth={2}
            type="monotone"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

LineGraphComponent.displayName = "LineGraph";

export const LineGraph = memo(LineGraphComponent);
