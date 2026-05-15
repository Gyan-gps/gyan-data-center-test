import React from "react";
import { fieldDefinitions } from "./fieldDefinitions";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

interface FieldTooltipProps {
  fieldName: string;
  className?: string;
}

export const FieldTooltip: React.FC<FieldTooltipProps> = ({ fieldName, className = "" }) => {
  const definition = fieldDefinitions[fieldName];

  if (!definition) return null;

  const renderDefinition = () => {
    if (typeof definition === "string") {
      return <p className="text-sm">{definition}</p>;
    } else {
      // For fields with multiple values, show all definitions
      return (
        <div className="space-y-2">
          {Object.entries(definition).map(([key, desc]) => (
            <div key={key}>
              <strong className="text-sm font-medium">{key}:</strong>
              <p className="text-sm mt-1">{desc}</p>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 hover:bg-gray-300 text-xs ml-1 ${className} no-print`}
            aria-label={`Information about ${fieldName}`}
          >
            <Info className="w-3 h-3 text-blue-500" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="max-w-xs max-h-64 overflow-y-auto p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
            sideOffset={5}
          >
            <div className="text-gray-900">
              <h4 className="font-medium text-sm mb-2">{fieldName}</h4>
              {renderDefinition()}
            </div>
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};