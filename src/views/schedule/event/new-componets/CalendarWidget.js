import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, isSameDay, isDateInRange } from "../utils";

const CalendarWidget = ({
  onDateRangeChange,
  initialStartDate = null,
  initialEndDate = null,
  blockedDates = new Set(), // Set of blocked date strings (YYYY-MM-DD)
  isScheduleBlocked = false, // Global blocking flag
  isEditMode = false, // NEW: Indicates if we're in edit mode
}) => {
  // Initialize currentDate to show the initial selected date's month
  const [currentDate, setCurrentDate] = useState(() => {
    if (initialStartDate) {
      return new Date(initialStartDate);
    }
    return new Date();
  });

  const [selectedStartDate, setSelectedStartDate] = useState(initialStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(initialEndDate);

  // Update currentDate when initialStartDate changes
  useEffect(() => {
    if (initialStartDate) {
      const startDate = new Date(initialStartDate);
      setCurrentDate(new Date(startDate.getFullYear(), startDate.getMonth()));
      setSelectedStartDate(initialStartDate);
    }
  }, [initialStartDate]);

  useEffect(() => {
    if (initialEndDate) {
      setSelectedEndDate(initialEndDate);
    }
  }, [initialEndDate]);

  const months = [
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

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  // Check if a date is blocked
  const isDateBlocked = (date) => {
    if (!date) return false;

    const dateStr = formatDateForAPI(date);

    // Check if this specific date string is blocked
    if (blockedDates.has(dateStr)) {
      return true;
    }

    return false;
  };

  // Format date as YYYY-MM-DD for comparison
  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Check if there are any blocked dates in the current range
  const hasBlockedDatesInRange = () => {
    if (!selectedStartDate || !selectedEndDate) return false;

    const start = new Date(selectedStartDate);
    const end = new Date(selectedEndDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (isDateBlocked(d)) {
        return true;
      }
    }
    return false;
  };

  const handleDateClick = (day) => {
    // Prevent any selection if schedule is globally blocked
    if (isScheduleBlocked) {
      return;
    }

    const clickedDate = day.fullDate;

    // Prevent selection of blocked dates
    if (isDateBlocked(clickedDate)) {
      return;
    }

    let newStartDate, newEndDate;

    // FIXED: In edit mode with blocked dates, only allow extending end date
    if (isEditMode && hasBlockedDatesInRange()) {
      // Only allow selecting dates after current end date
      if (!selectedEndDate || clickedDate <= selectedEndDate) {
        // Don't allow changing start date or selecting dates before/equal to current end
        return;
      }

      // Extend end date - keep start date unchanged
      newStartDate = selectedStartDate;
      newEndDate = clickedDate;

      // Check if any date in the NEW range is blocked
      const start = new Date(selectedEndDate);
      start.setDate(start.getDate() + 1); // Start checking from day after current end
      const end = new Date(clickedDate);
      let hasBlockedDates = false;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isDateBlocked(d)) {
          hasBlockedDates = true;
          break;
        }
      }

      // If new range contains blocked dates, don't allow selection
      if (hasBlockedDates) {
        return;
      }
    } else {
      // Normal mode: allow full date range selection
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        // Start new selection
        newStartDate = clickedDate;
        newEndDate = null;
      } else if (selectedStartDate && !selectedEndDate) {
        // Complete the range
        if (clickedDate < selectedStartDate) {
          newEndDate = selectedStartDate;
          newStartDate = clickedDate;
        } else {
          newStartDate = selectedStartDate;
          newEndDate = clickedDate;
        }

        // Check if any date in the range is blocked
        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        let hasBlockedDates = false;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (isDateBlocked(d)) {
            hasBlockedDates = true;
            break;
          }
        }

        // If range contains blocked dates, don't allow selection
        if (hasBlockedDates) {
          return;
        }
      }
    }

    setSelectedStartDate(newStartDate);
    setSelectedEndDate(newEndDate);

    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: newStartDate,
        endDate: newEndDate,
        isSelecting: newEndDate === null,
      });
    }
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 max-w-sm">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Previous month"
          disabled={isScheduleBlocked}
        >
          <ChevronLeft size={16} className="text-gray-600" />
        </button>

        <h3 className="text-sm font-medium text-gray-800">
          {months[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>

        <button
          onClick={() => navigateMonth(1)}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Next month"
          disabled={isScheduleBlocked}
        >
          <ChevronRight size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected =
            isSameDay(day.fullDate, selectedStartDate) ||
            isSameDay(day.fullDate, selectedEndDate);
          const isInRange = isDateInRange(
            day.fullDate,
            selectedStartDate,
            selectedEndDate
          );
          const isToday = isSameDay(day.fullDate, new Date());
          const isBlocked = isDateBlocked(day.fullDate);

          // FIXED: Check if this date should be disabled for edit mode
          const isDisabledForEdit =
            isEditMode &&
            hasBlockedDatesInRange() &&
            selectedEndDate &&
            day.fullDate <= selectedEndDate;

          const isDisabled =
            !day.isCurrentMonth ||
            isBlocked ||
            isScheduleBlocked ||
            isDisabledForEdit;

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              className={`
                relative h-8 w-8 text-sm rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  !day.isCurrentMonth
                    ? "text-gray-300 cursor-not-allowed"
                    : isBlocked
                    ? "bg-red-100 text-red-400 cursor-not-allowed line-through"
                    : isDisabledForEdit
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isScheduleBlocked
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-gray-900"
                }
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isInRange && !isBlocked
                    ? "bg-blue-100 text-blue-700"
                    : !isBlocked && !isDisabledForEdit && day.isCurrentMonth
                    ? "hover:bg-gray-100"
                    : ""
                }
                ${
                  isToday && !isSelected && !isInRange && !isBlocked
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : ""
                }
              `}
              aria-label={`Select ${day.fullDate.toDateString()}`}
              title={
                isBlocked
                  ? "This date is locked and cannot be selected"
                  : isDisabledForEdit
                  ? "Only dates after the current end date can be selected"
                  : ""
              }
            >
              {day.date}
              {isBlocked && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Blocked dates indicator */}
      {blockedDates.size > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 flex items-center">
            <span className="mr-1">🔒</span>
            {blockedDates.size} locked date(s) cannot be modified
          </p>
        </div>
      )}

      {/* Edit mode indicator */}
      {isEditMode && hasBlockedDatesInRange() && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 flex items-center">
            <span className="mr-1">ℹ️</span>
            Select dates after {selectedEndDate?.toLocaleDateString()} to extend
          </p>
        </div>
      )}
    </div>
  );
};

export default CalendarWidget;
