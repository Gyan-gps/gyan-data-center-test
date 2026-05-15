import React from "react";
import { useAuthStore } from "@/store/authStore";
import { Clock } from "lucide-react";
import { cn } from "@/utils/cn";

export const TrialCountdown: React.FC = () => {
  const trialState = useAuthStore((state) => state.trialState);

  if (!trialState?.isTrial || trialState.status !== "active" || trialState.remainingSeconds === null) {
    return null;
  }

  const { remainingSeconds } = trialState;
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime = hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // Warnings: less than 1 min, less than 5 min, less than 10 min
  const isCritical = remainingSeconds <= 60;
  const isWarning = remainingSeconds <= 300 && remainingSeconds > 60;
  const isInfo = remainingSeconds <= 600 && remainingSeconds > 300;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border",
        isCritical
          ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
          : isWarning
          ? "bg-amber-50 text-amber-600 border-amber-200"
          : isInfo
          ? "bg-blue-50 text-blue-600 border-blue-200"
          : "bg-gray-50 text-gray-600 border-gray-200"
      )}
      title="Active Trial Time Remaining"
    >
      <Clock className="w-4 h-4" />
      <span>{formattedTime}</span>
    </div>
  );
};
