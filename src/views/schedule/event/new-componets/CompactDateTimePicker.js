import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  Calendar,
  Clock,
  ChevronDown,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  GripHorizontal,
} from "lucide-react";

const CompactDateTimePicker = ({
  onDateTimeChange,
  initialDateTime = null,
  value = null,
  placeholder = "Select Date & Time",
  fullWidth = true,
  disabled = false,
  minDate = null,
  maxDate = null,
  showClearButton = true,
  size = "default",
  label = null,
  timezone = "UTC",
  disablePastDates = true,
  disablePastTimes = true,
}) => {
  // Helper function to validate timezone
  const isValidTimezone = (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch (error) {
      console.error(`Invalid timezone: ${tz}`, error);
      return false;
    }
  };

  const safeTimezone = useMemo(() => {
    return isValidTimezone(timezone) ? timezone : "UTC";
  }, [timezone]);

  // Get current time in the specified timezone
  const getCurrentTimeInTimezone = useCallback(() => {
    const now = new Date();
    // Create a new date that represents the current time in the target timezone
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const targetTime = new Date(utc + getTimezoneOffset(safeTimezone) * 60000);
    return targetTime;
  }, [safeTimezone]);

  // Get timezone offset in minutes
  const getTimezoneOffset = useCallback((tz) => {
    try {
      const now = new Date();
      const local = new Date(now.toLocaleString("en-US"));
      const target = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      return (target.getTime() - local.getTime()) / 60000;
    } catch (error) {
      console.error("Error getting timezone offset:", error);
      return 0;
    }
  }, []);

  const getTimezoneDisplayName = (tz) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "short",
        timeZone: tz,
      });
      const parts = formatter.formatToParts(new Date());
      return parts.find((part) => part.type === "timeZoneName")?.value || tz;
    } catch (error) {
      return tz;
    }
  };

  const safeToDate = (dateValue) => {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    try {
      const date = new Date(dateValue);
      return isNaN(date.getTime()) ? null : date;
    } catch (error) {
      console.error("Invalid date value:", dateValue, error);
      return null;
    }
  };

  const getInitialDate = () => {
    if (value) {
      return safeToDate(value);
    }
    if (initialDateTime) {
      return safeToDate(initialDateTime);
    }
    return getCurrentTimeInTimezone();
  };

  const initialDate = getInitialDate();
  const [selectedDateTime, setSelectedDateTime] = useState(
    initialDateTime || value ? initialDate : null
  );
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("date");
  const [tempDate, setTempDate] = useState(
    initialDate || getCurrentTimeInTimezone()
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAM, setIsAM] = useState(true);

  // Enhanced draggable modal states
  const [isDragging, setIsDragging] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [modalStartPos, setModalStartPos] = useState({ x: 0, y: 0 });

  const pickerRef = useRef(null);
  const buttonRef = useRef(null);
  const dragHandleRef = useRef(null);

  const currentTime = useMemo(
    () => getCurrentTimeInTimezone(),
    [getCurrentTimeInTimezone]
  );

  // Update AM/PM based on tempDate
  useEffect(() => {
    setIsAM(tempDate.getHours() < 12);
  }, [tempDate]);

  // Enhanced draggable functionality
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragHandleRef.current && pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();

      setIsDragging(true);
      setDragStartPos({ x: e.clientX, y: e.clientY });
      setModalStartPos({ x: rect.left, y: rect.top });

      // Prevent text selection during drag
      document.body.style.userSelect = "none";
      document.body.style.cursor = "grabbing";
    }
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && pickerRef.current) {
        e.preventDefault();

        const deltaX = e.clientX - dragStartPos.x;
        const deltaY = e.clientY - dragStartPos.y;

        let newX = modalStartPos.x + deltaX;
        let newY = modalStartPos.y + deltaY;

        // Get modal dimensions
        const modalRect = pickerRef.current.getBoundingClientRect();
        const modalWidth = modalRect.width;
        const modalHeight = modalRect.height;

        // Constrain to viewport with padding
        const padding = 10;
        const maxX = window.innerWidth - modalWidth - padding;
        const maxY = window.innerHeight - modalHeight - padding;

        newX = Math.max(padding, Math.min(newX, maxX));
        newY = Math.max(padding, Math.min(newY, maxY));

        setModalPosition({ x: newX, y: newY });
      }
    },
    [isDragging, dragStartPos, modalStartPos]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, [isDragging]);

  // Global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, {
        passive: false,
      });
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isPastDate = (date) => {
    if (!disablePastDates) return false;
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    );
    return dateOnly < todayOnly;
  };

  const isPastTime = (date) => {
    if (!disablePastTimes) return false;
    const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const todayOnly = new Date(
      currentTime.getFullYear(),
      currentTime.getMonth(),
      currentTime.getDate()
    );
    if (dateOnly.getTime() === todayOnly.getTime()) {
      return date < currentTime;
    }
    return false;
  };

  // Fixed date formatting functions
  const formatDisplayDate = (date) => {
    const safeDate = safeToDate(date);
    if (!safeDate) return placeholder;

    try {
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: safeTimezone,
      };
      return safeDate.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting display date:", error);
      return placeholder;
    }
  };

  const formatCompactDate = (date) => {
    const safeDate = safeToDate(date);
    if (!safeDate) return placeholder;

    try {
      const today = getCurrentTimeInTimezone();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const selectedDateString = safeDate.toLocaleDateString("en-CA", {
        timeZone: safeTimezone,
      });
      const todayString = today.toLocaleDateString("en-CA", {
        timeZone: safeTimezone,
      });
      const tomorrowString = tomorrow.toLocaleDateString("en-CA", {
        timeZone: safeTimezone,
      });

      const timeString = safeDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: safeTimezone,
      });

      if (selectedDateString === todayString) {
        return `Today, ${timeString}`;
      } else if (selectedDateString === tomorrowString) {
        return `Tomorrow, ${timeString}`;
      } else {
        return formatDisplayDate(safeDate);
      }
    } catch (error) {
      console.error("Error formatting compact date:", error);
      return formatDisplayDate(safeDate);
    }
  };

  // Event handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if dragging
      if (isDragging) return;

      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setModalPosition({ x: 0, y: 0 }); // Reset position when closing
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDragging]);

  useEffect(() => {
    const newDate = safeToDate(value);
    if (newDate) {
      setSelectedDateTime(newDate);
      setTempDate(new Date(newDate));
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth()));
    } else if (value === null || value === undefined) {
      setSelectedDateTime(null);
      setTempDate(getCurrentTimeInTimezone());
    }
  }, [value, safeTimezone, getCurrentTimeInTimezone]);

  const handleDateSelect = (date) => {
    if (date && !isPastDate(date)) {
      const updatedDate = new Date(tempDate);
      updatedDate.setFullYear(date.getFullYear());
      updatedDate.setMonth(date.getMonth());
      updatedDate.setDate(date.getDate());
      setTempDate(updatedDate);
    }
  };

  // Convert 12-hour format to 24-hour format
  const convertTo24Hour = (hour12, isAM) => {
    if (hour12 === 12) {
      return isAM ? 0 : 12;
    }
    return isAM ? hour12 : hour12 + 12;
  };

  // Convert 24-hour format to 12-hour format
  const convertTo12Hour = (hour24) => {
    if (hour24 === 0) return 12;
    if (hour24 > 12) return hour24 - 12;
    return hour24;
  };

  const handleTimeChange = (field, value) => {
    const updatedDate = new Date(tempDate);

    if (field === "hours") {
      const hour24 = convertTo24Hour(parseInt(value, 10), isAM);
      updatedDate.setHours(hour24);
    } else if (field === "minutes") {
      updatedDate.setMinutes(parseInt(value, 10));
    }

    if (!isPastTime(updatedDate)) {
      setTempDate(updatedDate);
    }
  };

  const handleAMPMToggle = () => {
    const updatedDate = new Date(tempDate);
    const currentHour = updatedDate.getHours();

    if (isAM && currentHour < 12) {
      updatedDate.setHours(currentHour + 12);
    } else if (!isAM && currentHour >= 12) {
      updatedDate.setHours(currentHour - 12);
    }

    if (!isPastTime(updatedDate)) {
      setTempDate(updatedDate);
      setIsAM(!isAM);
    }
  };

  const handleConfirm = () => {
    const validDate = safeToDate(tempDate);
    if (validDate && !isPastDate(validDate) && !isPastTime(validDate)) {
      setSelectedDateTime(validDate);
      setIsOpen(false);
      setModalPosition({ x: 0, y: 0 }); // Reset position
      if (onDateTimeChange) {
        onDateTimeChange(validDate);
      }
    }
  };

  const handleClear = () => {
    setSelectedDateTime(null);
    setTempDate(getCurrentTimeInTimezone());
    setIsOpen(false);
    setModalPosition({ x: 0, y: 0 }); // Reset position
    if (onDateTimeChange) {
      onDateTimeChange(null);
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

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

  const calendarDays = generateCalendarDays();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Determine modal position and styling
  const isModalDragged = modalPosition.x !== 0 || modalPosition.y !== 0;

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-auto"}`}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      {/* Timezone Info */}
      {safeTimezone !== "UTC" && (
        <div className="text-xs text-gray-500 mb-1">
          Timezone: {safeTimezone} ({getTimezoneDisplayName(safeTimezone)})
        </div>
      )}

      {/* Main Button */}
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
            <Calendar size={iconSizes[size]} className="mr-1 text-blue-500" />
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
              <X
                size={iconSizes[size] - 2}
                className="text-gray-400 hover:text-red-500"
              />
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

      {/* Enhanced Draggable DateTime Picker Popup */}
      {isOpen && (
        <div
          ref={pickerRef}
          style={
            isModalDragged
              ? {
                  position: "fixed",
                  left: `${modalPosition.x}px`,
                  top: `${modalPosition.y}px`,
                  zIndex: 10000,
                }
              : {}
          }
          className={`
            ${isModalDragged ? "" : "absolute top-full left-0 mt-2"} 
            bg-white rounded-2xl shadow-2xl border border-gray-100 p-0 
            w-[480px] min-w-[480px] max-w-[90vw] 
            overflow-hidden
            ${isDragging ? "cursor-grabbing" : ""}
          `}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Enhanced Draggable Handle */}
          <div
            ref={dragHandleRef}
            onMouseDown={handleMouseDown}
            className={`
              flex items-center justify-center py-3 px-4 bg-gray-50 border-b border-gray-100 
              ${
                isDragging
                  ? "cursor-grabbing bg-gray-100"
                  : "cursor-grab hover:bg-gray-100"
              } 
              transition-colors select-none
            `}
          >
            <GripHorizontal size={18} className="text-gray-400" />
            <span className="text-sm text-gray-500 ml-2 font-medium">
              {isDragging ? "Dragging..." : "Drag to move"}
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-gray-50 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("date")}
              className={`
                flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                ${
                  activeTab === "date"
                    ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }
              `}
            >
              <Calendar size={16} />
              <span>Date</span>
            </button>
            <button
              onClick={() => setActiveTab("time")}
              className={`
                flex-1 py-3 px-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center space-x-2
                ${
                  activeTab === "time"
                    ? "bg-white text-blue-600 shadow-sm border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }
              `}
            >
              <Clock size={16} />
              <span>Time</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Custom Calendar */}
            {activeTab === "date" && (
              <div className="space-y-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft size={18} className="text-gray-600" />
                  </button>

                  <h3 className="text-xl font-semibold text-gray-800">
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>

                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Day Names */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-semibold text-gray-600 py-2"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-12"></div>;
                    }

                    const isSelected =
                      tempDate &&
                      date.getDate() === tempDate.getDate() &&
                      date.getMonth() === tempDate.getMonth() &&
                      date.getFullYear() === tempDate.getFullYear();

                    const isToday =
                      date.toDateString() ===
                      getCurrentTimeInTimezone().toDateString();
                    const isPast = isPastDate(date);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={isPast}
                        className={`
                          h-12 w-full rounded-xl text-sm font-semibold transition-all duration-200 relative
                          ${
                            isSelected
                              ? "bg-blue-500 text-white shadow-lg transform scale-105"
                              : isToday
                              ? "bg-blue-50 text-blue-600 border-2 border-blue-200"
                              : isPast
                              ? "text-gray-300 cursor-not-allowed bg-gray-50"
                              : "text-gray-700 hover:bg-gray-100 hover:scale-105"
                          }
                        `}
                      >
                        {date.getDate()}
                        {isToday && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Date Selection */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    Quick Select:
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() =>
                        handleDateSelect(getCurrentTimeInTimezone())
                      }
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const tomorrow = getCurrentTimeInTimezone();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        handleDateSelect(tomorrow);
                      }}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      Tomorrow
                    </button>
                    <button
                      onClick={() => {
                        const nextWeek = getCurrentTimeInTimezone();
                        nextWeek.setDate(nextWeek.getDate() + 7);
                        handleDateSelect(nextWeek);
                      }}
                      className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors font-medium"
                    >
                      Next Week
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Time Picker */}
            {activeTab === "time" && (
              <div className="space-y-6">
                {/* Current Time Display */}
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="text-5xl font-mono font-bold text-gray-800 tracking-wider mb-2">
                    {convertTo12Hour(tempDate.getHours()).toString()}:
                    {String(tempDate.getMinutes()).padStart(2, "0")}
                    <span className="text-2xl ml-3 text-blue-600 font-semibold">
                      {tempDate.getHours() < 12 ? "AM" : "PM"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">
                    {tempDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      timeZone: safeTimezone,
                    })}
                  </div>
                </div>

                {/* Time Selectors */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Hours (1-12) */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Hours
                      </h3>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour12 = i + 1;
                          const hour24 = convertTo24Hour(hour12, isAM);
                          const isPastHour =
                            disablePastTimes &&
                            tempDate.toDateString() ===
                              getCurrentTimeInTimezone().toDateString() &&
                            hour24 < getCurrentTimeInTimezone().getHours();

                          return (
                            <button
                              key={hour12}
                              onClick={() =>
                                !isPastHour && handleTimeChange("hours", hour12)
                              }
                              disabled={isPastHour}
                              className={`
                                py-3 px-3 text-base font-bold rounded-xl transition-all duration-200 transform hover:scale-105
                                ${
                                  convertTo12Hour(tempDate.getHours()) ===
                                  hour12
                                    ? "bg-blue-500 text-white shadow-xl scale-110"
                                    : isPastHour
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-blue-100 hover:text-blue-600 hover:shadow-md"
                                }
                              `}
                            >
                              {hour12}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Minutes */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Minutes
                      </h3>
                    </div>

                    <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => {
                            const testTime = new Date(tempDate);
                            testTime.setMinutes(minute);
                            const isPastMinute =
                              disablePastTimes && isPastTime(testTime);

                            return (
                              <button
                                key={minute}
                                onClick={() =>
                                  !isPastMinute &&
                                  handleTimeChange("minutes", minute)
                                }
                                disabled={isPastMinute}
                                className={`
                                py-3 px-3 text-base font-bold rounded-xl transition-all duration-200 transform hover:scale-105
                                ${
                                  tempDate.getMinutes() === minute
                                    ? "bg-green-500 text-white shadow-xl scale-110"
                                    : isPastMinute
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-green-100 hover:text-green-600 hover:shadow-md"
                                }
                              `}
                              >
                                {String(minute).padStart(2, "0")}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AM/PM Toggle */}
                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-2xl p-2 flex">
                    <button
                      onClick={() => {
                        if (!isAM) {
                          handleAMPMToggle();
                        }
                      }}
                      className={`
                        px-8 py-3 text-lg font-bold rounded-xl transition-all duration-200
                        ${
                          isAM
                            ? "bg-white text-blue-600 shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-800"
                        }
                      `}
                    >
                      AM
                    </button>
                    <button
                      onClick={() => {
                        if (isAM) {
                          handleAMPMToggle();
                        }
                      }}
                      className={`
                        px-8 py-3 text-lg font-bold rounded-xl transition-all duration-200
                        ${
                          !isAM
                            ? "bg-white text-blue-600 shadow-lg transform scale-105"
                            : "text-gray-600 hover:text-gray-800"
                        }
                      `}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Current Time Setter */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border-2 border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-indigo-800">
                        Current Time
                      </h4>
                      <p className="text-sm text-indigo-600 font-medium">
                        {currentTime.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                          timeZone: safeTimezone,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const now = getCurrentTimeInTimezone();
                        setTempDate(new Date(now));
                      }}
                      className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white text-base font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                    >
                      Set Now
                    </button>
                  </div>
                </div>

                {/* Time Validation Feedback */}
                {disablePastTimes && isPastTime(tempDate) && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                    <div className="text-red-600 text-base font-semibold">
                      ⚠️ Please select a future time
                    </div>
                  </div>
                )}

                {!isPastTime(tempDate) && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                    <div className="text-green-600 text-base font-semibold">
                      ✓ Time selected successfully
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
            <div className="text-sm text-gray-600 mb-1 font-medium">
              Selected DateTime:
            </div>
            <div className="text-lg font-bold text-gray-800">
              {formatDisplayDate(tempDate)}
            </div>
            <div className="text-sm text-blue-600 mt-1 font-medium">
              {safeTimezone} ({getTimezoneDisplayName(safeTimezone)})
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex border-t border-gray-100">
            {showClearButton && (
              <button
                onClick={handleClear}
                className="flex-1 py-4 text-base font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                setModalPosition({ x: 0, y: 0 });
              }}
              className="flex-1 py-4 text-base font-semibold text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPastDate(tempDate) || isPastTime(tempDate)}
              className={`
                flex-1 py-4 text-base font-bold transition-colors border-l border-gray-100 flex items-center justify-center space-x-2
                ${
                  isPastDate(tempDate) || isPastTime(tempDate)
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              <Check size={18} />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactDateTimePicker;
