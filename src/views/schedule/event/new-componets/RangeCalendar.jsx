import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import { DateTimeHelpers } from "../utils/DateTimeHelpers";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

const RangeCalendar = ({
  startDate,
  endDate,
  onStartDateSelect,
  onEndDateSelect,
  blockedDates = new Set(),
  minDate = null,
  maxDate = null,
  timezone: tz = "Asia/Dubai",
}) => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());

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

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    const checkDate = dayjs(date).tz(tz).startOf("day");
    const start = dayjs(startDate).tz(tz).startOf("day");
    const end = dayjs(endDate).tz(tz).startOf("day");
    return checkDate.isBetween(start, end, null, "[]");
  };

  const isStartDate = (date) => {
    if (!startDate) return false;
    return dayjs(date).tz(tz).startOf("day").isSame(dayjs(startDate).tz(tz).startOf("day"), "day");
  };

  const isEndDate = (date) => {
    if (!endDate) return false;
    return dayjs(date).tz(tz).startOf("day").isSame(dayjs(endDate).tz(tz).startOf("day"), "day");
  };

  const handleDateClick = (date, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    const clickedDate = dayjs(date);
    const selectedDay = dayjs.tz(
      `${clickedDate.year()}-${String(clickedDate.month() + 1).padStart(2, '0')}-${String(clickedDate.date()).padStart(2, '0')}`,
      tz
    ).startOf("day");

    // If no start date or both dates are set, set as start date
    if (!startDate || (startDate && endDate)) {
      onStartDateSelect(selectedDay.toDate());
      onEndDateSelect(null);
    } else {
      // Set as end date if after start date
      if (selectedDay.isAfter(dayjs(startDate).tz(tz).startOf("day"))) {
        onEndDateSelect(selectedDay.toDate());
      } else {
        // If before start date, make it the new start date
        onStartDateSelect(selectedDay.toDate());
        onEndDateSelect(null);
      }
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <button
          onClick={handlePrevMonth}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronLeft size={18} className="text-gray-600" />
        </button>

        <div className="text-base font-semibold text-gray-900">
          {dayjs().month(currentMonth).format("MMMM")} {currentYear}
        </div>

        <button
          onClick={handleNextMonth}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, idx) => (
          <div key={idx} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isToday = dayjs(day.fullDate).isSame(today, "day") && day.isCurrentMonth;
          const isBlocked = isDateBlocked(day.fullDate);
          const inRange = isInRange(day.fullDate);
          const isStart = isStartDate(day.fullDate);
          const isEnd = isEndDate(day.fullDate);

          let buttonClasses = "w-full h-9 flex items-center justify-center rounded-md text-sm font-medium transition-all cursor-pointer relative ";

          if (isStart || isEnd) {
            buttonClasses += "bg-blue-600 text-white hover:bg-blue-700 shadow-sm";
          } else if (inRange) {
            buttonClasses += "bg-blue-100 text-blue-900 hover:bg-blue-200";
          } else if (isToday && day.isCurrentMonth) {
            buttonClasses += "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold";
          } else if (!day.isCurrentMonth) {
            buttonClasses += "text-gray-300 hover:bg-gray-50";
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
                  ? "⚠️ Booking date - must be included"
                  : isToday
                  ? "Today"
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

export default RangeCalendar;
