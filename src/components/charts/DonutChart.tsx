import React from "react";
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DonutChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  height?: number;
}

const COLORS = [
  "#4a90e2",
  "#7C9AB2",
  "#FBBF24",
  "#F87171",
  "#A78BFA",
  "#34D399",
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white shadow-md border rounded px-3 py-2 text-xs">
        <p className="font-medium">{data.status}</p>
        <p>Capacity : {data.value} MW</p>
        <p>Market Share : {(data.percentage).toFixed(2)} %</p>
      </div>
    );
  }
  return null;
};
export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  dataKey,
  nameKey,
  height = 220,
}) => {
  return (
    <div className="flex flex-col items-center w-full">
      <ResponsiveContainer width="100%" height={height}>
        <RePieChart>
          <Pie
            isAnimationActive={false}
            data={data}
            dataKey={dataKey}
            nameKey={nameKey}
            innerRadius={60}
            outerRadius={85}
            paddingAngle={3}
            cornerRadius={1}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>

        <Tooltip content={<CustomTooltip />} />
        </RePieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-600">{item[nameKey]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};