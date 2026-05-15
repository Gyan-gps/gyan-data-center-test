import React from "react";
import { NewsDashboard } from "@/components/news";

export const News: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <NewsDashboard />
      </div>
    </div>
  );
};
