import React from "react";
import { SignalsDashboard } from "@/components/signals/SignalsDashboard";

export const Signals: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Content */}
      <div className="mx-auto">
        <SignalsDashboard />
      </div>
    </div>
  );
};
