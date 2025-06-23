import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";

const HorizontalDateTimePicker = ({
  dates,
  times,
  selectedDateId,
  selectedTimeId,
  onDateChange,
  onTimeChange,
  loading,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (dates && selectedDateId) {
      const foundDate = dates.find((date) => date.id === selectedDateId);
      if (foundDate) {
        setSelectedDate(foundDate);
      }
    }
  }, [dates, selectedDateId]);

  useEffect(() => {
    if (times && selectedTimeId) {
      const foundTime = times.find((time) => time.id === selectedTimeId);
      if (foundTime) {
        setSelectedTime(foundTime);
      }
    }
  }, [times, selectedTimeId]);

  const handleDateSelect = (dateItem) => {
    setSelectedDate(dateItem);
    setSelectedTime(null);
    if (onDateChange) {
      onDateChange(dateItem.id);
    }
  };

  const handleTimeSelect = (timeItem) => {
    setSelectedTime(timeItem);
    if (onTimeChange) {
      onTimeChange(timeItem.id);
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById("date-scroll-container");
    if (container) {
      container.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("date-scroll-container");
    if (container) {
      container.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    return { day, dayNum };
  };

  // Format time for display
  const formatTime = (timeItem) => {
    if (timeItem.start_time && timeItem.end_time) {
      return `${timeItem.start_time.slice(0, 5)} - ${timeItem.end_time.slice(
        0,
        5
      )}`;
    }
    return timeItem.time || "Time slot";
  };

  // Get booking status for dates and times
  const getBookingStatus = (item) => {
    const {
      success_bookings = 0,
      failed_bookings = 0,
      pending_bookings = 0,
    } = item;

    if (success_bookings > 0) return "success";
    if (failed_bookings > 0) return "failed";
    if (pending_bookings > 0) return "pending";
    return null;
  };

  // Get status dot color and styles
  const getStatusDot = (status) => {
    switch (status) {
      case "success":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return null;
    }
  };

  // Get booking count summary
  const getBookingSummary = (item) => {
    const {
      total_bookings = 0,
      success_bookings = 0,
      failed_bookings = 0,
      pending_bookings = 0,
    } = item;

    if (total_bookings === 0) return null;

    return {
      total: total_bookings,
      success: success_bookings,
      failed: failed_bookings,
      pending: pending_bookings,
    };
  };

  // Show loading state
  if (loading && (!dates || !dates.length)) {
    return (
      <div className="w-full bg-white rounded-lg p-6">
        <div className="text-center text-gray-500">Loading dates...</div>
      </div>
    );
  }

  // Show error state if dates is not an array
  if (!dates || !Array.isArray(dates)) {
    return (
      <div className="w-full bg-white rounded-lg p-6">
        <div className="text-center text-red-500">No dates available</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg p-2">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          {dates.length > 0
            ? new Date(dates[0].start_date).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })
            : "Select Date"}
        </h2>
        <div className="text-sm text-gray-500">
          {selectedDate && selectedTime
            ? `Selected: ${formatDate(selectedDate.start_date).day}, ${
                formatDate(selectedDate.start_date).dayNum
              } at ${formatTime(selectedTime)}`
            : "Select date and time"}
        </div>
      </div>

      {/* Date Scroller */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        {/* Date Cards Container */}
        <div
          id="date-scroll-container"
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth mx-8"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {dates.map((dateItem) => {
            const { day, dayNum } = formatDate(dateItem.start_date);
            const status = getBookingStatus(dateItem);
            const statusDot = getStatusDot(status);
            const bookingSummary = getBookingSummary(dateItem);

            return (
              <div
                key={dateItem.id}
                onClick={() => handleDateSelect(dateItem)}
                className={`flex-shrink-0 cursor-pointer transition-all duration-200 ${
                  selectedDate?.id === dateItem.id
                    ? "transform scale-105"
                    : "hover:transform hover:scale-102"
                }`}
              >
                <div
                  className={`relative w-16 h-24 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-200 ${
                    selectedDate?.id === dateItem.id
                      ? "bg-red-500 text-white "
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {statusDot && (
                    <div
                      className={`absolute top-1 right-1 w-3 h-3 rounded-full ${statusDot}`}
                    ></div>
                  )}

                  <span className="text-sm font-medium">{day}</span>
                  <span className="text-xl font-bold">{dayNum}</span>

                  {bookingSummary && (
                    <span className="text-xs mt-1 opacity-75">
                      {bookingSummary.total}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && times && Array.isArray(times) && times.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">
              Available Times for {formatDate(selectedDate.start_date).day},{" "}
              {formatDate(selectedDate.start_date).dayNum}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {times.map((timeItem) => {
              const status = getBookingStatus(timeItem);
              const statusDot = getStatusDot(status);
              const bookingSummary = getBookingSummary(timeItem);

              return (
                <button
                  key={timeItem.id}
                  onClick={() => handleTimeSelect(timeItem)}
                  className={`relative px-4 py-3 rounded-lg border-2 transition-all duration-200 font-medium ${
                    selectedTime?.id === timeItem.id
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:bg-red-50"
                  }`}
                >
                  {/* Status Dot */}
                  {statusDot && (
                    <div
                      className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ${statusDot}`}
                    ></div>
                  )}

                  <div className="flex flex-col items-center">
                    <span className="text-sm">{formatTime(timeItem)}</span>
                    {bookingSummary && (
                      <span className="text-xs text-gray-500 mt-1">
                        {bookingSummary.total} bookings
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading state for times */}
      {selectedDate && loading && (
        <div className="mt-8">
          <div className="text-center text-gray-500">Loading time slots...</div>
        </div>
      )}

      {/* Status Legend */}
      <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Success</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Failed</span>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HorizontalDateTimePicker;
