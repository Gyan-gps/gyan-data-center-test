import React from "react";

export const TrialExpiredOverlay: React.FC<{ moduleName: string }> = ({
  moduleName,
}) => {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <div className="text-gray-500 font-medium">
        Your trial is over you cannot access {moduleName}, please contact
        support for assistance.
      </div>
    </div>
  );
};
