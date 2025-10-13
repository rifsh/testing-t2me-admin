import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, isSameDay, isDateInRange } from "../utils";

const CalendarWidget = ({
  onDateRangeChange,
  initialStartDate = null,
  initialEndDate = null,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  isEditMode = false,
  minDate = null,
  bookingEndDate = null,
}) => {
  const [currentDate, setCurrentDate] = useState(() => {
    if (initialStartDate) {
      return new Date(initialStartDate);
    }
    return new Date();
  });

  const [selectedStartDate, setSelectedStartDate] = useState(initialStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(initialEndDate);

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

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = formatDateForAPI(date);
    return blockedDates.has(dateStr);
  };

  // FIXED: Changed <= to < so same day is allowed
  const isBeforeBookingDate = (date) => {
    if (!minDate || !date) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const minDateTime = new Date(minDate);
    minDateTime.setHours(0, 0, 0, 0);

    return checkDate < minDateTime;
  };

  const isBeforeStartDate = (date) => {
    if (!selectedStartDate || !date) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const startDate = new Date(selectedStartDate);
    startDate.setHours(0, 0, 0, 0);

    return checkDate < startDate;
  };

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
    if (isScheduleBlocked) {
      return;
    }

    const clickedDate = day.fullDate;

    if (isDateBlocked(clickedDate)) {
      return;
    }

    if (isBeforeBookingDate(clickedDate)) {
      return;
    }

    let newStartDate, newEndDate;

    if (isEditMode && hasBlockedDatesInRange()) {
      if (!selectedEndDate || clickedDate <= selectedEndDate) {
        return;
      }

      newStartDate = selectedStartDate;
      newEndDate = clickedDate;

      const start = new Date(selectedEndDate);
      start.setDate(start.getDate() + 1);
      const end = new Date(clickedDate);
      let hasBlockedDates = false;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (isDateBlocked(d) || (minDate && isBeforeBookingDate(d))) {
          hasBlockedDates = true;
          break;
        }
      }

      if (hasBlockedDates) {
        return;
      }
    } else {
      if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
        newStartDate = clickedDate;
        newEndDate = null;
      } else if (selectedStartDate && !selectedEndDate) {
        if (clickedDate < selectedStartDate) {
          return;
        }

        newStartDate = selectedStartDate;
        newEndDate = clickedDate;

        const start = new Date(newStartDate);
        const end = new Date(newEndDate);
        let hasBlockedDates = false;

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (isDateBlocked(d) || (minDate && isBeforeBookingDate(d))) {
            hasBlockedDates = true;
            break;
          }
        }

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
          const isBeforeBooking = minDate
            ? isBeforeBookingDate(day.fullDate)
            : false;
          const isBeforeStart =
            selectedStartDate && !selectedEndDate
              ? isBeforeStartDate(day.fullDate)
              : false;

          const isDisabledForEdit =
            isEditMode &&
            hasBlockedDatesInRange() &&
            selectedEndDate &&
            day.fullDate <= selectedEndDate;

          const isDisabled =
            !day.isCurrentMonth ||
            isBlocked ||
            isBeforeBooking ||
            isBeforeStart ||
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
                    : isBeforeBooking
                    ? "bg-orange-50 text-orange-300 cursor-not-allowed"
                    : isBeforeStart
                    ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                    : isDisabledForEdit
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : isScheduleBlocked
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-gray-900"
                }
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isInRange && !isBlocked && !isBeforeBooking
                    ? "bg-blue-100 text-blue-700"
                    : !isBlocked &&
                      !isBeforeBooking &&
                      !isBeforeStart &&
                      !isDisabledForEdit &&
                      day.isCurrentMonth
                    ? "hover:bg-gray-100"
                    : ""
                }
                ${
                  isToday &&
                  !isSelected &&
                  !isInRange &&
                  !isBlocked &&
                  !isBeforeBooking &&
                  !isBeforeStart
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : ""
                }
              `}
              aria-label={`Select ${day.fullDate.toDateString()}`}
              title={
                isBlocked
                  ? "This date is locked and cannot be selected"
                  : isBeforeBooking
                  ? "Event dates must be on or after the booking date"
                  : isBeforeStart
                  ? "End date must be after start date"
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

      {/* Warning messages */}
      {blockedDates.size > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700 flex items-center">
            <span className="mr-1">🔒</span>
            {blockedDates.size} locked date(s) cannot be modified
          </p>
        </div>
      )}

      {minDate && (
        <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
          <p className="text-xs text-orange-700 flex items-center">
            <span className="mr-1">⚠️</span>
            Event dates must be from {new Date(
              minDate
            ).toLocaleDateString()}{" "}
            onwards
          </p>
        </div>
      )}

      {selectedStartDate && !selectedEndDate && (
        <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-700 flex items-center">
            <span className="mr-1">📅</span>
            Select end date from {selectedStartDate.toLocaleDateString()}{" "}
            onwards
          </p>
        </div>
      )}

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
