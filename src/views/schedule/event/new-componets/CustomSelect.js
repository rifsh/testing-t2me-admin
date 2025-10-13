import React, { useState, useEffect, useRef } from "react";
import { Users, ChevronDown, X } from "lucide-react";

const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select option",
  label,
  mode = "normal", // 'normal' or 'multiple'
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

  // Handle both single and multiple selection
  const isMultiple = mode === "multiple";
  const selectedValues = isMultiple ? (Array.isArray(value) ? value : []) : [];
  const selectedOption = !isMultiple
    ? options.find((opt) => opt.value === value)
    : null;

  const handleSelect = (optionValue) => {
    if (isMultiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const removeValue = (e, valueToRemove) => {
    e.stopPropagation();
    const newValues = selectedValues.filter((v) => v !== valueToRemove);
    onChange(newValues);
  };

  const getDisplayContent = () => {
    if (isMultiple) {
      if (selectedValues.length === 0) {
        return <span className="text-gray-400">{placeholder}</span>;
      }
      return (
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selectedValues.map((val) => {
            const opt = options.find((o) => o.value === val);
            return opt ? (
              <span
                key={val}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs"
              >
                <span className="truncate max-w-[100px]">{opt.label}</span>
                <button
                  onClick={(e) => removeValue(e, val)}
                  className="hover:bg-blue-200 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ) : null;
          })}
        </div>
      );
    }
    return (
      <span className={value ? "text-gray-800" : "text-gray-400"}>
        {selectedOption?.label || placeholder}
      </span>
    );
  };

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
          flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          cursor-pointer
          ${
            required && (isMultiple ? selectedValues.length === 0 : !value)
              ? "border-red-300 bg-red-50 hover:border-red-400"
              : "border-gray-200 bg-white hover:border-blue-300"
          }`}
      >
        <div className="flex items-center min-w-0 flex-1">
          <IconComponent size={16} className="mr-2 flex-shrink-0" />
          {getDisplayContent()}
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
            options.map((option) => {
              const isSelected = isMultiple
                ? selectedValues.includes(option.value)
                : value === option.value;

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors flex items-center justify-between
                    ${
                      isSelected ? "bg-blue-50 text-blue-700" : "text-gray-800"
                    }`}
                >
                  <div className="truncate">{option.label}</div>
                  {isMultiple && isSelected && (
                    <span className="ml-2 text-blue-700">✓</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
export default CustomSelect;