import React, { useState, useEffect, useRef } from "react";
import { Users, ChevronDown } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  label,
  icon: IconComponent = Users,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2 text-sm rounded-xl border-2 transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
          ${
            required && !value
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : "border-gray-200 bg-white hover:border-blue-300"
          }
          ${value ? "text-gray-800" : "text-gray-400"}`}
      >
        <div className="flex items-center min-w-0">
          <IconComponent size={16} className="mr-2 flex-shrink-0" />
          <span className="truncate">
            {selectedOption?.label || placeholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={selectRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-[99999] w-full max-h-60 overflow-y-auto"
        >
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors
                  ${
                    value === option.value
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-800"
                  }`}
              >
                <div className="truncate">{option.label}</div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
