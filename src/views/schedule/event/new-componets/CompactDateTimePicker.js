import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Calendar,
  Clock,
  ChevronDown,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Move,
} from "lucide-react";

const CompactDateTimePicker = ({
  onDateTimeChange,
  initialDateTime = null,
  value = null,
  placeholder = "Select Date & Time",
  fullWidth = true,
  disabled = false,
  showClearButton = true,
  size = "default",
  label = null,
  timezone = "UTC",
  disablePastDates = true,
  disablePastTimes = true,
  minDateTime = null,
  maxDateTime = null,
  blockedDates = new Set(), // NEW: Set of blocked dates
  isScheduleBlocked = false, // NEW: Global blocking flag
}) => {
  const isValidTimezone = (tz) => {
    if (!tz || tz === "") return false;
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch (error) {
      return false;
    }
  };

  const safeTimezone = useMemo(() => {
    return isValidTimezone(timezone) ? timezone : "UTC";
  }, [timezone]);

  const getCurrentTimeInTimezone = () => {
    if (!safeTimezone || safeTimezone === "UTC") {
      return new Date();
    }

    try {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const targetTime = new Date(
        utc + getTimezoneOffset(safeTimezone) * 60000
      );
      return targetTime;
    } catch (error) {
      return new Date();
    }
  };

  const getTimezoneOffset = (tz) => {
    try {
      const now = new Date();
      const utcDate = new Date(
        now.toLocaleString("en-US", { timeZone: "UTC" })
      );
      const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      return (tzDate.getTime() - utcDate.getTime()) / 60000;
    } catch (error) {
      return 0;
    }
  };

  const getTimezoneDisplayName = (tz) => {
    try {
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZoneName: "shortGeneric",
        timeZone: tz,
      });
      const parts = formatter.formatToParts(new Date());
      const timezonePart = parts.find((part) => part.type === "timeZoneName");
      return timezonePart?.value || tz;
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
      return null;
    }
  };

  // Format date as YYYY-MM-DD for comparison
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = formatDateForAPI(date);
    return blockedDates.has(dateStr);
  };

  const getInitialDate = () => {
    if (value) return safeToDate(value);
    if (initialDateTime) return safeToDate(initialDateTime);
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

  // FIXED: Initialize currentMonth based on the selected/initial date
  const [currentMonth, setCurrentMonth] = useState(() => {
    const dateToShow = initialDate || getCurrentTimeInTimezone();
    return new Date(dateToShow.getFullYear(), dateToShow.getMonth(), 1);
  });

  const [isAM, setIsAM] = useState(true);

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const buttonRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    setIsAM(tempDate.getHours() < 12);
  }, [tempDate]);

  const handleMouseDown = (e) => {
    if (e.target.closest(".drag-handle")) {
      setIsDragging(true);
      const rect = widgetRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      const maxX = window.innerWidth - 420;
      const maxY = window.innerHeight - 500;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;

    // FIXED: Check if date is blocked first
    if (isDateBlocked(date) || isScheduleBlocked) {
      return true;
    }

    const currentInTz = getCurrentTimeInTimezone();
    const dateToCheck = new Date(date);

    if (disablePastDates) {
      const today = new Date(
        currentInTz.getFullYear(),
        currentInTz.getMonth(),
        currentInTz.getDate()
      );
      const checkDate = new Date(
        dateToCheck.getFullYear(),
        dateToCheck.getMonth(),
        dateToCheck.getDate()
      );
      if (checkDate < today) return true;
    }

    if (minDateTime) {
      const minDate = new Date(
        minDateTime.getFullYear(),
        minDateTime.getMonth(),
        minDateTime.getDate()
      );
      const checkDate = new Date(
        dateToCheck.getFullYear(),
        dateToCheck.getMonth(),
        dateToCheck.getDate()
      );
      if (checkDate < minDate) return true;
    }

    if (maxDateTime) {
      const maxDate = new Date(
        maxDateTime.getFullYear(),
        maxDateTime.getMonth(),
        maxDateTime.getDate()
      );
      const checkDate = new Date(
        dateToCheck.getFullYear(),
        dateToCheck.getMonth(),
        dateToCheck.getDate()
      );
      if (checkDate > maxDate) return true;
    }

    return false;
  };

  const isTimeDisabled = (date) => {
    if (!date) return true;

    // FIXED: Check if date is blocked
    if (isDateBlocked(date) || isScheduleBlocked) {
      return true;
    }

    const currentInTz = getCurrentTimeInTimezone();

    if (disablePastTimes) {
      const today = new Date(
        currentInTz.getFullYear(),
        currentInTz.getMonth(),
        currentInTz.getDate()
      );
      const checkDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );

      if (checkDate.getTime() === today.getTime() && date < currentInTz) {
        return true;
      }
    }

    if (minDateTime && date < minDateTime) return true;
    if (maxDateTime && date > maxDateTime) return true;

    return false;
  };

  const formatDisplayDate = (date) => {
    const safeDate = safeToDate(date);
    if (!safeDate) return placeholder;

    try {
      const currentInTz = getCurrentTimeInTimezone();
      const today = new Date(
        currentInTz.getFullYear(),
        currentInTz.getMonth(),
        currentInTz.getDate()
      );
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const checkDate = new Date(
        safeDate.getFullYear(),
        safeDate.getMonth(),
        safeDate.getDate()
      );

      const timeString = safeDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });

      if (checkDate.getTime() === today.getTime()) {
        return `Today, ${timeString}`;
      } else if (checkDate.getTime() === tomorrow.getTime()) {
        return `Tomorrow, ${timeString}`;
      } else {
        return safeDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
    } catch (error) {
      return placeholder;
    }
  };

  const resetPosition = () => {
    setPosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDragging) return;

      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        resetPosition();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDragging]);

  // FIXED: Update currentMonth when value changes
  useEffect(() => {
    const newDate = safeToDate(value);
    if (newDate) {
      setSelectedDateTime(newDate);
      setTempDate(new Date(newDate));
      setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    } else if (value === null || value === undefined) {
      setSelectedDateTime(null);
      setTempDate(getCurrentTimeInTimezone());
      setCurrentMonth(new Date());
    }
  }, [value]);

  const handleDateSelect = (date) => {
    if (date && !isDateDisabled(date) && !isDateBlocked(date)) {
      const updatedDate = new Date(tempDate);
      updatedDate.setFullYear(date.getFullYear());
      updatedDate.setMonth(date.getMonth());
      updatedDate.setDate(date.getDate());
      setTempDate(updatedDate);
    }
  };

  const convertTo24Hour = (hour12, isAM) => {
    if (hour12 === 12) {
      return isAM ? 0 : 12;
    }
    return isAM ? hour12 : hour12 + 12;
  };

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

    if (!isTimeDisabled(updatedDate) && !isDateBlocked(updatedDate)) {
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

    if (!isTimeDisabled(updatedDate) && !isDateBlocked(updatedDate)) {
      setTempDate(updatedDate);
      setIsAM(!isAM);
    }
  };

  const handleConfirm = () => {
    const validDate = safeToDate(tempDate);
    if (
      validDate &&
      !isDateDisabled(validDate) &&
      !isTimeDisabled(validDate) &&
      !isDateBlocked(validDate)
    ) {
      setSelectedDateTime(validDate);
      setIsOpen(false);
      resetPosition();
      if (onDateTimeChange) {
        onDateTimeChange(validDate);
      }
    }
  };

  const handleClear = () => {
    if (isScheduleBlocked) {
      return;
    }
    setSelectedDateTime(null);
    setTempDate(getCurrentTimeInTimezone());
    setCurrentMonth(new Date());
    setIsOpen(false);
    resetPosition();
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

  const isDragged = position.x !== 0 || position.y !== 0;

  return (
    <div className={`relative ${fullWidth ? "w-full" : "w-auto"}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}

      <button
        ref={buttonRef}
        onClick={() => !disabled && !isScheduleBlocked && setIsOpen(!isOpen)}
        disabled={disabled || isScheduleBlocked}
        className={`
          ${fullWidth ? "w-full" : "w-auto"} 
          ${sizeClasses[size]}
          rounded-xl border-2 border-gray-200 bg-white 
          hover:border-blue-300 hover:shadow-md transition-all duration-200
          flex items-center justify-between
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${selectedDateTime ? "text-gray-800" : "text-gray-400"}
          ${
            disabled || isScheduleBlocked
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
              ? formatDisplayDate(selectedDateTime)
              : placeholder}
          </span>
          {isScheduleBlocked && (
            <span className="ml-2 text-xs text-red-600">🔒 Locked</span>
          )}
        </div>

        <div className="flex items-center">
          {selectedDateTime && showClearButton && !isScheduleBlocked && (
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

      {isOpen && (
        <div
          ref={widgetRef}
          onMouseDown={handleMouseDown}
          className="bg-white rounded-3xl border-0 overflow-hidden w-[420px] min-w-[420px] max-w-[90vw]"
          style={{
            ...(isDragged
              ? {
                  position: "fixed",
                  left: position.x,
                  top: position.y,
                  zIndex: 1000,
                  userSelect: "none",
                  cursor: isDragging ? "grabbing" : "default",
                  pointerEvents: "auto",
                }
              : {
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  zIndex: 1000,
                }),
            boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
            borderRadius: "25px",
            padding: "10px",
          }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-white-50">
            <div className="flex items-center space-x-2">
              <div className="drag-handle flex items-center space-x-2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors">
                <Move size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500 font-medium select-none">
                  {isDragging ? "Dragging..." : "Select Date & Time"}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  resetPosition();
                }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X size={14} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("date")}
              className={`
                flex-1 py-2 px-3 text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1
                ${
                  activeTab === "date"
                    ? "bg-white text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }
              `}
            >
              <Calendar size={12} />
              <span>Date</span>
            </button>
            <button
              onClick={() => setActiveTab("time")}
              className={`
                flex-1 py-2 px-3 text-xs font-semibold transition-all duration-200 flex items-center justify-center space-x-1
                ${
                  activeTab === "time"
                    ? "bg-white text-blue-600 border-b-2 border-blue-500"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }
              `}
            >
              <Clock size={12} />
              <span>Time</span>
            </button>
          </div>

          <div className="p-4">
            {activeTab === "date" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft size={16} className="text-gray-600" />
                  </button>

                  <h3 className="text-base font-semibold text-gray-800">
                    {monthNames[currentMonth.getMonth()]}{" "}
                    {currentMonth.getFullYear()}
                  </h3>

                  <button
                    onClick={() => navigateMonth(1)}
                    className="p-1 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={16} className="text-gray-600" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-gray-500 py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="h-8"></div>;
                    }

                    const isSelected =
                      tempDate &&
                      date.getDate() === tempDate.getDate() &&
                      date.getMonth() === tempDate.getMonth() &&
                      date.getFullYear() === tempDate.getFullYear();

                    const currentInTz = getCurrentTimeInTimezone();
                    const today = new Date(
                      currentInTz.getFullYear(),
                      currentInTz.getMonth(),
                      currentInTz.getDate()
                    );
                    const checkDate = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate()
                    );
                    const isToday = today.getTime() === checkDate.getTime();

                    const isDisabled = isDateDisabled(date);
                    const isBlocked = isDateBlocked(date);

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={isDisabled || isBlocked}
                        className={`
                          h-8 w-full rounded-xl text-xs font-medium transition-all duration-200 relative
                          ${
                            isSelected
                              ? "bg-blue-500 text-white shadow-md transform scale-105"
                              : isToday
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : isBlocked
                              ? "bg-red-100 text-red-400 line-through cursor-not-allowed"
                              : isDisabled
                              ? "text-gray-300 cursor-not-allowed bg-gray-50"
                              : "text-gray-700 hover:bg-gray-100"
                          }
                        `}
                      >
                        {date.getDate()}
                        {isToday && !isSelected && (
                          <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                        )}
                        {isBlocked && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-red-500 text-xs">🔒</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Blocked dates warning */}
                {blockedDates.size > 0 && (
                  <div className="pt-2 border-t border-gray-100">
                    <div className="bg-red-50 rounded-xl p-2">
                      <p className="text-xs text-red-700">
                        🔒 {blockedDates.size} date(s) are locked and cannot be
                        selected
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-600 mb-2">
                    Quick Select:
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        const today = getCurrentTimeInTimezone();
                        if (!isDateBlocked(today)) {
                          handleDateSelect(today);
                        }
                      }}
                      disabled={isDateBlocked(getCurrentTimeInTimezone())}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const tomorrow = getCurrentTimeInTimezone();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        if (!isDateBlocked(tomorrow)) {
                          handleDateSelect(tomorrow);
                        }
                      }}
                      disabled={(() => {
                        const tomorrow = getCurrentTimeInTimezone();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return isDateBlocked(tomorrow);
                      })()}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "time" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Hours
                      </h3>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-2 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 12 }, (_, i) => {
                          const hour12 = i + 1;
                          const hour24 = convertTo24Hour(hour12, isAM);

                          const testTime = new Date(tempDate);
                          testTime.setHours(hour24);
                          const isDisabled = isTimeDisabled(testTime);

                          return (
                            <button
                              key={hour12}
                              onClick={() =>
                                !isDisabled && handleTimeChange("hours", hour12)
                              }
                              disabled={isDisabled}
                              className={`
                                py-2 px-2 text-sm font-semibold rounded-xl transition-all duration-200
                                ${
                                  convertTo12Hour(tempDate.getHours()) ===
                                  hour12
                                    ? "bg-blue-500 text-white shadow-md scale-105"
                                    : isDisabled
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-blue-100 hover:text-blue-600"
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

                  <div className="space-y-2">
                    <div className="text-center">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Minutes
                      </h3>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-2 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-1">
                        {Array.from({ length: 12 }, (_, i) => i * 5).map(
                          (minute) => {
                            const testTime = new Date(tempDate);
                            testTime.setMinutes(minute);
                            const isDisabled = isTimeDisabled(testTime);

                            return (
                              <button
                                key={minute}
                                onClick={() =>
                                  !isDisabled &&
                                  handleTimeChange("minutes", minute)
                                }
                                disabled={isDisabled}
                                className={`
                                py-2 px-2 text-sm font-semibold rounded-xl transition-all duration-200
                                ${
                                  tempDate.getMinutes() === minute
                                    ? "bg-green-500 text-white shadow-md scale-105"
                                    : isDisabled
                                    ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                                    : "bg-gray-50 text-gray-700 hover:bg-green-100 hover:text-green-600"
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

                <div className="flex justify-center">
                  <div className="bg-gray-100 rounded-xl p-1 flex">
                    <button
                      onClick={() => {
                        if (!isAM) {
                          handleAMPMToggle();
                        }
                      }}
                      className={`
                        px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200
                        ${
                          isAM
                            ? "bg-white text-blue-600 shadow-sm"
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
                        px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200
                        ${
                          !isAM
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }
                      `}
                    >
                      PM
                    </button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-indigo-800">
                        Current Time ({safeTimezone})
                      </h4>
                      <p className="text-xs text-indigo-600">
                        {getCurrentTimeInTimezone().toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          }
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const now = getCurrentTimeInTimezone();
                        if (!isDateBlocked(now)) {
                          setTempDate(new Date(now));
                        }
                      }}
                      disabled={isDateBlocked(getCurrentTimeInTimezone())}
                      className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Set Now
                    </button>
                  </div>
                </div>

                {(isTimeDisabled(tempDate) || isDateBlocked(tempDate)) && (
                  <div className="bg-red-50 rounded-xl p-2 text-center">
                    <div className="text-red-600 text-xs font-medium">
                      {isDateBlocked(tempDate)
                        ? "🔒 This date is locked and cannot be selected"
                        : "⚠️ Please select a valid time"}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="rounded-xl p-3 mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
              <div className="text-xs text-gray-600 mb-1">
                Selected DateTime:
              </div>
              <div className="text-sm font-semibold text-gray-800">
                {formatDisplayDate(tempDate)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                {safeTimezone} ({getTimezoneDisplayName(safeTimezone)})
              </div>
            </div>
          </div>

          <div className="flex border-t border-gray-100">
            {showClearButton && !isScheduleBlocked && (
              <button
                onClick={handleClear}
                className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                setIsOpen(false);
                resetPosition();
              }}
              className="flex-1 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border-l border-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={
                isDateDisabled(tempDate) ||
                isTimeDisabled(tempDate) ||
                isDateBlocked(tempDate)
              }
              className={`
                flex-1 py-2 text-sm font-semibold transition-colors border-l border-gray-100 flex items-center justify-center space-x-1
                ${
                  isDateDisabled(tempDate) ||
                  isTimeDisabled(tempDate) ||
                  isDateBlocked(tempDate)
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:bg-blue-50"
                }
              `}
            >
              <Check size={14} />
              <span>Confirm</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompactDateTimePicker;
