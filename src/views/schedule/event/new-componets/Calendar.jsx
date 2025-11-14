import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { DateTimeHelpers } from "../utils/DateTimeHelpers";
import { DateTimeValidator } from "../utils/dateTimeValidation";

dayjs.extend(utc);
dayjs.extend(timezone);

const Calendar = ({
  selectedDate,
  onDateSelect,
  blockedDates = new Set(),
  highlightToday = true,
  timezone: tz = "Asia/Dubai",
  mode = "single",
  startDate = null,
  endDate = null,
}) => {
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate ? dayjs(selectedDate).month() : dayjs().month()
  );
  const [currentYear, setCurrentYear] = useState(
    selectedDate ? dayjs(selectedDate).year() : dayjs().year()
  );

  const days = useMemo(
    () => DateTimeHelpers.getCalendarDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const today = dayjs().tz(tz).startOf("day");
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isDateBlocked = (date) => {
    if (!date || !blockedDates || blockedDates.size === 0) return false;
    const dateStr = dayjs(date).tz(tz).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  };

  const isDateSelected = (date) => {
    const checkDate = dayjs(date).startOf("day");

    if (mode === "range" && startDate && endDate) {
      const start = dayjs(startDate).startOf("day");
      const end = dayjs(endDate).startOf("day");
      return checkDate.isBetween(start, end, null, "[]");
    }

    if (selectedDate) {
      return checkDate.isSame(dayjs(selectedDate).startOf("day"), "day");
    }

    return false;
  };

  const isPastDate = (date) => {
    const checkDate = dayjs(date).tz(tz).startOf("day");
    return checkDate.isBefore(today, "day");
  };

 // In Calendar.jsx - Update handleDateClick

const handleDateClick = (date, isCurrentMonth) => {
  if (!isCurrentMonth) return;
  
  // ✅ FIX: Pass timezone-aware date
  const clickedDate = dayjs(date);
  const tzAwareDate = dayjs.tz(
    `${clickedDate.year()}-${String(clickedDate.month() + 1).padStart(2, '0')}-${String(clickedDate.date()).padStart(2, '0')}`,
    tz
  );
  
  onDateSelect(tzAwareDate.toDate());
};

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        <div className="text-base font-semibold text-gray-900">
          {dayjs().month(currentMonth).format("MMMM")} {currentYear}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Next month"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, idx) => (
          <div
            key={idx}
            className="text-center text-xs font-semibold text-gray-500 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday =
            highlightToday &&
            dayjs(day.fullDate).isSame(today, "day") &&
            day.isCurrentMonth;
          const isSelected = isDateSelected(day.fullDate);
          const isBlocked = isDateBlocked(day.fullDate);
          const isPast = isPastDate(day.fullDate);

          // ✅ No dates are disabled - all are clickable
          let buttonClasses = "w-full h-9 flex items-center justify-center rounded-md text-sm font-medium transition-all cursor-pointer ";

          if (isSelected) {
            buttonClasses += "bg-blue-600 text-white hover:bg-blue-700 shadow-sm";
          } else if (isToday) {
            buttonClasses += "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold";
          } else if (!day.isCurrentMonth) {
            buttonClasses += "text-gray-300 hover:bg-gray-50";
          } else if (isPast) {
            // ✅ Past dates are clickable but visually dimmed
            buttonClasses += "text-gray-400 hover:bg-gray-100";
          } else {
            buttonClasses += "text-gray-700 hover:bg-gray-100";
          }

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.fullDate, day.isCurrentMonth)}
              className={buttonClasses}
              title={
                isBlocked
                  ? "⚠️ Booking date"
                  : isToday
                  ? "Today"
                  : isPast
                  ? "Past date - validation on Apply"
                  : dayjs(day.fullDate).format('MMM D, YYYY')
              }
            >
              {day.date}
              {isBlocked && (
                <div className="absolute bottom-0.5 w-1 h-1 bg-red-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Calendar;
