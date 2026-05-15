import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from "react-router";
import { formatCompanyNameToRedirect } from "@/utils";
interface MetricDisplay {
  label: string;
  value: string | number;
  trend: "up" | "down" | "stable";
  companyId?: string;
}

interface TrendMetricProps {
  metric: MetricDisplay;
}
export const TrendMetric = ({ metric }: TrendMetricProps) => {
     const navigate = useNavigate();
  const handleClick = () => {
    navigate(
      `/company/${formatCompanyNameToRedirect(String(metric.value))}/${metric.companyId}`
    );
  };

  const isClickable = Boolean(metric.companyId);
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };
  return (
    <div className="p-2 sm:p-3 bg-card border border-border rounded-lg">
      <div className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
        {metric.label}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="text-base sm:text-lg font-bold text-foreground truncate">
          {isClickable ? (
            <button
              onClick={handleClick}
              title={String(metric.value)}
              className="font-bold text-foreground hover:text-blue-700 transition 
             p-0 m-0 text-left leading-none truncate max-w-full"
              style={{ background: "none", border: "none" }}
            >
              {metric.value}
            </button>
          ) : (
            <span className="truncate" title={String(metric.value)}>{metric.value}</span>
          )}
        </div>
        {getTrendIcon()}
      </div>
    </div>
  );
};
