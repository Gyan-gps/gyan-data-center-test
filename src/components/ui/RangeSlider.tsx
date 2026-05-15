import React from 'react';
import * as Slider from '@radix-ui/react-slider';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  label?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export const RangeSlider: React.FC<RangeSliderProps> = React.memo(({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue = (val: number) => val.toString(),
  className = ""
}) => {
  const [minVal, maxVal] = value;

  const handleValueChange = React.useCallback((newValue: number[]) => {
    onChange([newValue[0], newValue[1]]);
  }, [onChange]);

  const handleMinInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = Math.min(Number(e.target.value), maxVal - step);
    if (newMin >= min) {
      onChange([newMin, maxVal]);
    }
  }, [min, maxVal, step, onChange]);

  const handleMaxInputChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = Math.max(Number(e.target.value), minVal + step);
    if (newMax <= max) {
      onChange([minVal, newMax]);
    }
  }, [max, minVal, step, onChange]);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="py-4">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[minVal, maxVal]}
          onValueChange={handleValueChange}
          max={max}
          min={min}
          step={step}
        >
          <Slider.Track className="bg-gray-200 relative grow rounded-full h-2">
            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
          </Slider.Track>
          <Slider.Thumb 
            className="block w-5 h-5 bg-blue-500 shadow-lg rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors border-2 border-white" 
            aria-label="Minimum value"
          />
          <Slider.Thumb 
            className="block w-5 h-5 bg-blue-500 shadow-lg rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-colors border-2 border-white" 
            aria-label="Maximum value"
          />
        </Slider.Root>
      </div>

      {/* Value display */}
      <div className="flex flex-col gap-2 justify-between items-center mt-3">
        <div className="flex items-center space-x-2 w-full justify-between">
          <input
            type="number"
            value={minVal}
            onChange={handleMinInputChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            min={min}
            max={maxVal - step}
          />
          <span className="text-sm text-gray-500">to</span>
          <input
            type="number"
            value={maxVal}
            onChange={handleMaxInputChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            min={minVal + step}
            max={max}
          />
        </div>
        <div className="text-sm text-gray-500">
          {formatValue(minVal)} - {formatValue(maxVal)}
        </div>
      </div>
    </div>
  );
});