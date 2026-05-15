import { Badge } from "./ui/badge";
import type { WeeklySignal } from "@/network/signals/signals.types";
import { cn } from "@/utils/cn";

interface SignalCardProps {
  signal: WeeklySignal;
}

export const SignalsCard = ({ signal }: SignalCardProps) => {
  return (
    <div className="p-2 sm:p-3 bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
      {/* First Row - Confidence */}
      <div className="mb-1.5">
        <span className="text-[10px] sm:text-xs font-semibold text-foreground">
          {Number(signal.confidence) * 100}% CONFIDENCE
        </span>
      </div>

      {/* Second Row - Category */}
      <div className="mb-1.5">
        <span className="text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {signal.category.join(", ")}
        </span>
      </div>

      <h3 className="text-xs sm:text-sm font-semibold text-foreground mb-1.5 line-clamp-2">
        <a
          href={signal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {signal.title}
        </a>
      </h3>

      <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 line-clamp-2">{signal.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {signal.tags.map((tag, index) => (
          <Badge
            key={index}
            variant="outline"
            className={cn(
              "font-normal",
              tag.type === "success" &&
                "bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]",
              tag.type === "danger" &&
                "bg-[#E11D48]/10 text-[#E11D48] border-[#E11D48]",
              tag.type === "info" &&
                "bg-gray-400/10 text-gray-600 border-gray-400"
            )}
          >
            {tag.label}
          </Badge>
        ))}
      </div>
    </div>
  );
};
