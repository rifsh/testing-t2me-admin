import React, { useState, useEffect, useRef } from "react";
import { Clock, ChevronDown } from "lucide-react";

const CustomTimePicker = ({
  value,
  onChange,
  placeholder = "Select Time",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempTime, setTempTime] = useState(value || "09:00");
  const pickerRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirm = () => {
    onChange(tempTime);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-sm rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          text-gray-800 cursor-pointer"
      >
        <div className="flex items-center">
          <Clock size={16} className="mr-2" />
          <span>{value || placeholder}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-full min-w-[250px]"
        >
          <input
            type="time"
            value={tempTime}
            onChange={(e) => setTempTime(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none mb-4"
          />

          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 px-4 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-4 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
