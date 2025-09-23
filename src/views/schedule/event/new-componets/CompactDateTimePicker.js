import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const CompactDateTimePicker = ({
  onDateTimeChange,
  initialDateTime = null,
  placeholder = "Select Date & Time",
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

  const formatDisplayDate = (date) => {
    if (!date) return placeholder;
    const options = {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
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

  return (
    <div className="relative">
      {/* Compact Display Button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-24 h-24 rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 hover:shadow-md transition-all duration-200
          flex flex-col items-center justify-center p-2 text-center
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${selectedDateTime ? "text-gray-800" : "text-gray-400"}
        `}
      >
        <div className="flex items-center justify-center mb-1">
          <Calendar size={14} className="mr-1" />
          <Clock size={14} />
        </div>
        <div className="text-xs font-medium leading-tight">
          {selectedDateTime ? (
            <>
              <div>
                {selectedDateTime.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
              <div className="text-blue-600">
                {selectedDateTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
            </>
          ) : (
            <div>Select DateTime</div>
          )}
        </div>
      </button>

      {/* DateTime Picker Popup */}
      {isOpen && (
        <div
          ref={pickerRef}
          className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 w-80"
        >
          {/* Tab Navigation */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
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
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {/* Preview */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Selected:</div>
            <div className="text-sm font-medium text-gray-800">
              {formatDisplayDate(tempDate)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="flex-1 py-2 px-3 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 py-2 px-3 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
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
