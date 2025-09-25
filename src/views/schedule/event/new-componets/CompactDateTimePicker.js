import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronDown, X } from "lucide-react";

const CompactDateTimePicker = ({
  onDateTimeChange,
  initialDateTime = null,
  placeholder = "Select Date & Time",
  fullWidth = true, // New prop to control width
  disabled = false,
  minDate = null,
  maxDate = null,
  showClearButton = true,
  size = "default", // "small", "default", "large"
  label = null,
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(initialDateTime);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("date");
  const [tempDate, setTempDate] = useState(
    selectedDateTime ? new Date(selectedDateTime) : new Date()
  );
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

  useEffect(() => {
    if (initialDateTime) {
      setSelectedDateTime(initialDateTime);
      setTempDate(new Date(initialDateTime));
    }
  }, [initialDateTime]);

  const formatDisplayDate = (date) => {
    if (!date) return placeholder;
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatCompactDate = (date) => {
    if (!date) return placeholder;
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) {
      return `Today, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    } else if (isTomorrow) {
      return `Tomorrow, ${date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })}`;
    } else {
      return formatDisplayDate(date);
    }
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    const updatedDate = new Date(tempDate);
    updatedDate.setFullYear(newDate.getFullYear());
    updatedDate.setMonth(newDate.getMonth());
    updatedDate.setDate(newDate.getDate());
    setTempDate(updatedDate);
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(":");
    const updatedDate = new Date(tempDate);
    updatedDate.setHours(parseInt(hours));
    updatedDate.setMinutes(parseInt(minutes));
    setTempDate(updatedDate);
  };

  const handleConfirm = () => {
    setSelectedDateTime(tempDate);
    setIsOpen(false);
    if (onDateTimeChange) {
      onDateTimeChange(tempDate);
    }
  };

  const handleClear = () => {
    setSelectedDateTime(null);
    setTempDate(new Date());
    setIsOpen(false);
    if (onDateTimeChange) {
      onDateTimeChange(null);
    }
  };

  const handleQuickSelect = (hoursToAdd) => {
    const newDate = new Date();
    newDate.setHours(newDate.getHours() + hoursToAdd);
    setTempDate(newDate);
  };

  const getCurrentDateString = () => {
    const year = tempDate.getFullYear();
    const month = String(tempDate.getMonth() + 1).padStart(2, "0");
    const day = String(tempDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getCurrentTimeString = () => {
    const hours = String(tempDate.getHours()).padStart(2, "0");
    const minutes = String(tempDate.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const getMinDateString = () => {
    if (!minDate) return null;
    const year = minDate.getFullYear();
    const month = String(minDate.getMonth() + 1).padStart(2, "0");
    const day = String(minDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getMaxDateString = () => {
    if (!maxDate) return null;
    const year = maxDate.getFullYear();
    const month = String(maxDate.getMonth() + 1).padStart(2, "0");
    const day = String(maxDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Size classes
  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    default: "px-4 py-3 text-sm",
    large: "px-5 py-4 text-base",
  };

  const iconSizes = {
    small: 14,
    default: 16,
    large: 18,
  };

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-auto"}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          ${fullWidth ? "w-full" : "w-auto"} 
          ${sizeClasses[size]}
          rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 hover:shadow-md transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${selectedDateTime ? "text-gray-800" : "text-gray-400"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed hover:border-gray-200"
              : "cursor-pointer"
          }
        `}
      >
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <Calendar size={iconSizes[size]} className="mr-1" />
          </div>
          <span className="font-medium">
            {selectedDateTime
              ? formatCompactDate(selectedDateTime)
              : placeholder}
          </span>
        </div>

        <div className="flex items-center">
          {selectedDateTime && showClearButton && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={iconSizes[size] - 2} className="text-gray-400" />
            </button>
          )}
          <ChevronDown
            size={iconSizes[size]}
            className={`text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* DateTime Picker Popup */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-96"
        >
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("date")}
              className={`
                flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === "date"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }
              `}
            >
              <Calendar size={16} className="inline mr-2" />
              Date
            </button>
            <button
              onClick={() => setActiveTab("time")}
              className={`
                flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors
                ${
                  activeTab === "time"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }
              `}
            >
              <Clock size={16} className="inline mr-2" />
              Time
            </button>
          </div>

          {/* Date Picker */}
          {activeTab === "date" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date
              </label>
              <input
                type="date"
                value={getCurrentDateString()}
                onChange={handleDateChange}
                min={getMinDateString()}
                max={getMaxDateString()}
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />

              {/* Quick Date Selection */}
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">Quick Select:</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      const updated = new Date(tempDate);
                      updated.setFullYear(today.getFullYear());
                      updated.setMonth(today.getMonth());
                      updated.setDate(today.getDate());
                      setTempDate(updated);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      const updated = new Date(tempDate);
                      updated.setFullYear(tomorrow.getFullYear());
                      updated.setMonth(tomorrow.getMonth());
                      updated.setDate(tomorrow.getDate());
                      setTempDate(updated);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Tomorrow
                  </button>
                  <button
                    onClick={() => {
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      const updated = new Date(tempDate);
                      updated.setFullYear(nextWeek.getFullYear());
                      updated.setMonth(nextWeek.getMonth());
                      updated.setDate(nextWeek.getDate());
                      setTempDate(updated);
                    }}
                    className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Next Week
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Time Picker */}
          {activeTab === "time" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Time
              </label>
              <input
                type="time"
                value={getCurrentTimeString()}
                onChange={handleTimeChange}
                className="w-full p-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />

              {/* Quick Time Selection */}
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">
                  Quick Select (from now):
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleQuickSelect(1)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    +1h
                  </button>
                  <button
                    onClick={() => handleQuickSelect(2)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    +2h
                  </button>
                  <button
                    onClick={() => handleQuickSelect(24)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    +1d
                  </button>
                  <button
                    onClick={() => {
                      const now = new Date();
                      const updated = new Date(tempDate);
                      updated.setHours(now.getHours());
                      updated.setMinutes(now.getMinutes());
                      setTempDate(updated);
                    }}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Preview */}
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <div className="text-sm text-gray-600 mb-1">Selected DateTime:</div>
            <div className="text-sm font-semibold text-gray-800">
              {formatDisplayDate(tempDate)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {tempDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {showClearButton && (
              <button
                onClick={handleClear}
                className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactDateTimePicker;
