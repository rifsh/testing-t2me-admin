import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, isSameDay, isDateInRange } from "../utils";

const CalendarWidget = ({
  onDateRangeChange,
  initialStartDate = null,
  initialEndDate = null,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState(initialStartDate);
  const [selectedEndDate, setSelectedEndDate] = useState(initialEndDate);

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

  const handleDateClick = (day) => {
    const clickedDate = day.fullDate;
    let newStartDate, newEndDate;

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
      <div className="grid grid-cols-7 gap-1 ">
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

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                relative h-8 w-8 text-sm rounded-md transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${
                  !day.isCurrentMonth
                    ? "text-gray-300 hover:text-gray-400"
                    : "text-gray-700 hover:text-gray-900"
                }
                ${
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isInRange
                    ? "bg-blue-100 text-blue-700"
                    : "hover:bg-gray-100"
                }
                ${
                  isToday && !isSelected && !isInRange
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : ""
                }
              `}
              aria-label={`Select ${day.fullDate.toDateString()}`}
            >
              {day.date}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWidget;
