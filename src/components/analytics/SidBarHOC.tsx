import React, { useState } from "react";
import { Button } from "../ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

function SidBarHOC({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(true);

  return (
    <div className="hidden lg:flex shrink-0 min-h-0 self-stretch">

      <div
      className={`transition-all duration-300 ease-in-out relative bg-white border-r border-gray-200 group  overflow-hidden ${
        isSidebarCollapsed
          ? "w-12 hover:shadow-2xl hover:shadow-blue-500/20 cursor-pointer overflow-x-hidden"
          : "w-80"
      }`}
        onClick={
          isSidebarCollapsed ? () => setIsSidebarCollapsed(false) : undefined
        }
        title={isSidebarCollapsed ? "Click to expand filters" : undefined}
      >
        {/* Cool Hover Animation Overlay for Collapsed State */}
        {isSidebarCollapsed && (
          <>
            {/* Animated Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/30 to-transparent -skew-x-12 animate-pulse" />
            </div>

            {/* Floating Particles Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
              <div
                className="absolute top-1/4 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-bounce delay-100"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute top-1/3 left-1/3 w-0.5 h-0.5 bg-purple-400 rounded-full animate-bounce delay-300"
                style={{ animationDuration: "2.5s" }}
              />
              <div
                className="absolute top-1/2 left-2/3 w-1.5 h-1.5 bg-green-400 rounded-full animate-bounce delay-500"
                style={{ animationDuration: "3s" }}
              />
              <div
                className="absolute top-2/3 left-1/4 w-0.5 h-0.5 bg-orange-400 rounded-full animate-bounce delay-700"
                style={{ animationDuration: "2.2s" }}
              />
              <div
                className="absolute top-3/4 left-3/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-900"
                style={{ animationDuration: "2.8s" }}
              />
            </div>

            {/* Pulsing Edge Light */}
            <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/0 via-blue-500/60 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          </>
        )}

        {/* Sidebar Toggle Button */}
        <Button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-4 z-20 p-2 bg-white shadow-lg rounded-full border border-gray-200 hover:bg-gray-50 hover:shadow-xl hover:scale-105 transition-all duration-200 group/button ${
            isSidebarCollapsed ? "right-3" : "right-4"
          }`}
          variant="ghost"
          size="sm"
          title={isSidebarCollapsed ? "Expand filters" : "Collapse filters"}
        >
          {isSidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-blue-600 group/button-hover:text-blue-600 transition-colors" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600 group-hover:text-blue-600 group/button-hover:text-blue-600 transition-colors" />
          )}
        </Button>

        {/* Sidebar Content */}
        <div
          className={`h-full transition-all duration-300 ${
            isSidebarCollapsed
              ? "opacity-0 pointer-events-none -translate-x-4"
              : "opacity-100 translate-x-0"
          }`}
        >
          {children}
        </div>
        {/* Collapsed Sidebar Preview */}
        {isSidebarCollapsed && (
          <div className="h-full flex flex-col items-center pt-12 px-1 space-y-4 overflow-y-auto group-hover:transform group-hover:scale-105 transition-transform duration-500">
            {/* Vertical Text */}
            <div className="writing-mode-vertical text-xs text-gray-500 mt-auto mb-4 select-none group-hover:text-blue-600 group-hover:font-medium transition-all duration-300">
              Filters
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(SidBarHOC);
