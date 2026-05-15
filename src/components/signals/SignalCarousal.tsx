import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SignalsCard } from "./SignalsCard";
import type { WeeklySignal } from "@/network/signals/signals.types";

interface SignalCarousalProps {
  signals: WeeklySignal[];
}

const SignalCarousal: React.FC<SignalCarousalProps> = ({ signals }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseOnCard = () => {
    setIsHovered(true);
  };

  const handleMouseLeaveCard = () => {
    setIsHovered(false);
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % signals.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + signals.length) % signals.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  useEffect(() => {
    if (isHovered) return; // Pause auto-scroll on hover
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % signals.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [signals.length, isHovered]);

  const getCardStyle = (index: number) => {
    const diff = (index - currentIndex + signals.length) % signals.length;

    if (diff === 0) {
      // Main active card
      return {
        transform: "translateY(0%) scale(1)",
        opacity: 1,
        zIndex: 30,
      };
    } else if (diff === 1) {
      // Card below (barely visible - 95% below)
      return {
        transform: "translateY(10%) scale(0.96)",
        opacity: 0.9,
        zIndex: 20,
        maxHeight: "180px",
      };
    } else if (diff === 2) {
      // Second card below (almost hidden - 98% below)
      return {
        transform: "translateY(20%) scale(0.94)",
        opacity: 0.6,
        zIndex: 10,
        maxHeight: "150px",
      };
    } else {
      // Hidden cards
      return {
        transform: "translateY(100%) scale(0.9)",
        opacity: 0,
        zIndex: 5,
      };
    }
  };

  // If no signals, don't render
  if (!signals || signals.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex items-start justify-center p-0 sm:p-2">
      <div className="w-full flex flex-col sm:flex-row items-center sm:items-start justify-center relative gap-2 md:gap-4">
        <div className="relative h-[170px] sm:h-[180px] flex items-start justify-center pt-0 w-full">
          {/* Cards Container */}
          <div className="relative w-full flex items-start justify-center">
            {signals.map((signal, index) => (
              <div
                key={signal.id}
                className="absolute w-full lg:max-w-2xl transition-all duration-500 ease-out"
                style={getCardStyle(index)}
              >
                <div
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  onMouseEnter={handleMouseOnCard}
                  onMouseLeave={handleMouseLeaveCard}
                >
                  <SignalsCard signal={signal} />
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Navigation Buttons */}
        <div
          className="right-0 flex sm:flex-col justify-center items-center gap-3"
          onMouseEnter={handleMouseOnCard}
          onMouseLeave={handleMouseLeaveCard}
        >
          <button
            onClick={handlePrev}
            disabled={isAnimating}
            className="bg-white hover:bg-blue-600 text-gray-700 hover:text-white p-1.5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous card"
          >
            <ChevronUp size={18} />
          </button>
          {/* Dots Indicator */}
          <div className="flex sm:flex-col justify-center items-center gap-1.5 mt-1.5">
            {signals.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!isAnimating) {
                    setIsAnimating(true);
                    setCurrentIndex(index);
                    setTimeout(() => setIsAnimating(false), 500);
                  }
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-5 bg-blue-600"
                    : "w-1.5 bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to signal ${index + 1}`}
              />
            ))}
          </div>
          <button
            onClick={handleNext}
            disabled={isAnimating}
            className="bg-white hover:bg-blue-600 text-gray-700 hover:text-white p-1.5 rounded-full shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next card"
          >
            <ChevronDown size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignalCarousal;
