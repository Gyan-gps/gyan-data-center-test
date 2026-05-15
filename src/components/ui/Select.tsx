import React from "react";
import { ChevronDown, X } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  code?: string; // Country code for flag image
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  multiple?: boolean;
  placeholder?: string;
  onChange: (value: string | string[]) => void;
  searchable?: boolean;
  className?: string;
  disabled?: boolean;
  from?: string; // New prop to identify the source of the Select component
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  multiple = false,
  placeholder = "Select...",
  onChange,
  searchable = false,
  className = "",
  disabled = false,
  from,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm, searchable]);

  const selectedValues = React.useMemo(() => {
    if (multiple && Array.isArray(value)) return value;
    if (!multiple && typeof value === "string" && value !== "") return [value];
    return [];
  }, [value, multiple]);

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selectedValues.includes(option.value));
  }, [options, selectedValues]);

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter((v) => v !== optionValue)
        : [...currentValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleRemoveTag = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter((v) => v !== optionValue);
      onChange(newValues);
    }
  };
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : "");
  };

  const getDisplayText = () => {
    if (selectedOptions.length === 0) return placeholder;
    
    if (!multiple) {
      const selectedOption = selectedOptions[0];
      if (!selectedOption) return placeholder;
      
      return (
        <div className={`flex ${from && "items-center gap-2"}`}>
          {from === "country-code-dropdown" && (
            <img
              alt={selectedOption.label}
              width={24}
              height={24}
              src={`${imageBaseUrl}/flags/${selectedOption.label.toLowerCase()}.svg`}
            />
          )}
          {from === "country-code-dropdown" ? selectedOption.code : selectedOption.label}
        </div>
      );
    }
    
    if (selectedOptions.length === 1) return selectedOptions[0].label;
    return `${selectedOptions.length} selected`;
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const imageBaseUrl = import.meta.env.VITE_PUBLIC_IMAGE_BASE_URL || "";
  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div
        className={`
          flex items-center justify-between w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md cursor-pointer
          ${
            disabled
              ? "bg-gray-100 cursor-not-allowed"
              : "hover:border-gray-400"
          }
          ${isOpen ? "border-blue-500 ring-1 ring-blue-500" : ""}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {multiple && selectedOptions.length > 0 ? (
            selectedOptions.map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {option.label}
                <button
                  onClick={(e) => handleRemoveTag(option.value, e)}
                  className="ml-1 hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span
              key={`selected-${selectedOptions.length > 0 ? selectedOptions[0]?.value : 'none'}`}
              className={
                selectedOptions.length === 0 ? "text-gray-500" : "text-gray-900"
              }
            >
              {getDisplayText()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && !disabled && (
            <X
              className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
              onClick={handleClear}
            />
          )}

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""
              }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-9999 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 md:min-w-[300px] w-[300px] overflow-y-auto overflow-x-hidden">
          {searchable && (
            <div className="p-2 border-b">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No options found
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={`
                    px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 whitespace-nowrap 
                    ${isSelected ? "bg-blue-50 text-blue-700" : "text-gray-900"}
                  `}
                  onClick={() => handleOptionClick(option.value)}
                >
                  <div
                    className={`flex ${
                      from && "items-center"
                    } justify-start gap-1`}
                    title={option.label}
                  >
                    {from === "country-code-dropdown" && (
                      <span>
                        <img
                          src={`${imageBaseUrl}/flags/${option.label.toLowerCase()}.svg`}
                          alt={option.label}
                          width={24}
                          height={24}
                        />
                      </span>
                    )}
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mr-2"
                      />
                    )}
                    {option.label.length > 30
                      ? `${option.label.slice(0, 30)}...`
                      : option.label}{" "}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
