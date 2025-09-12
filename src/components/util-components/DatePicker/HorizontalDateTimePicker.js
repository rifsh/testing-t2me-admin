import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, Calendar } from "lucide-react";
import { BOOKING_TYPE } from "constants/AppConstants";


export const HorizontalDateTimePicker = ({
  dates,
  times,
  selectedDateId,
  selectedTimeId,
  onDateChange,
  onTimeChange,
  loading,
  type,
}) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  useEffect(() => {
    if (dates && selectedDateId) {
      const foundDate = dates.find(
        (date) =>
          (type === BOOKING_TYPE.EVENT_TICKET ? date.id : date.start_date) ===
          selectedDateId
      );
      if (foundDate) {
        setSelectedDate(foundDate);
      }
    }
  }, [dates, selectedDateId, type]);

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
      onDateChange(
        type === BOOKING_TYPE.EVENT_TICKET ? dateItem.id : dateItem.start_date
      );
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
      container.scrollBy({ left: -150, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById("date-scroll-container");
    if (container) {
      container.scrollBy({ left: 150, behavior: "smooth" });
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return { day, dayNum, month };
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
      processing_bookings = 0,
    } = item;

    if (success_bookings > 0) return "success";
    if (failed_bookings > 0) return "failed";
    if (processing_bookings > 0) return "pending";
    return null;
  };

  // Get status dot color and styles
  const getStatusDot = (status) => {
    switch (status) {
      case "success":
        return "bg-emerald-500";
      case "failed":
        return "bg-red-500";
      case "pending":
        return "bg-amber-500";
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
      processing_bookings = 0,
    } = item;

    if (total_bookings === 0) return null;

    return {
      total: total_bookings,
      success: success_bookings,
      failed: failed_bookings,
      pending: processing_bookings,
    };
  };

  // Show loading state
  if (loading && (!dates || !dates.length)) {
    return (
      <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <div className="text-slate-600 text-sm font-medium">
            Loading dates...
          </div>
        </div>
      </div>
    );
  }

  // Show error state if dates is not an array
  if (!dates || !Array.isArray(dates)) {
    return (
      <div className="w-full bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
        <div className="flex flex-col items-center space-y-2">
          <Calendar className="w-6 h-6 text-red-500" />
          <div className="text-red-700 text-sm font-medium">
            No dates available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl mb-6 border border-slate-200 overflow-hidden">
      {/* Compact Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-white" />
            <h2 className="text-lg font-bold text-white">
              {dates.length > 0
                ? new Date(dates[0].start_date).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })
                : "Select Date"}
            </h2>
          </div>
          <div className="text-blue-100 text-xs font-medium">
            {selectedDate && selectedTime
              ? `${formatDate(selectedDate.start_date).day}, ${
                  formatDate(selectedDate.start_date).dayNum
                } at ${formatTime(selectedTime)}`
              : "Select date and time"}
          </div>
        </div>
      </div>

      {/* Compact Date Selection Section */}
      <div className="p-4">
        <div className="relative">
          {/* Smaller Navigation Buttons */}
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-slate-50 transition-all duration-200 border border-slate-200 hover:scale-105"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>

          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-2 hover:bg-slate-50 transition-all duration-200 border border-slate-200 hover:scale-105"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>

          {/* Compact Date Cards Container */}
          <div
            id="date-scroll-container"
            className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth mx-8 py-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {dates.map((dateItem) => {
              const { day, dayNum, month } = formatDate(dateItem.start_date);
              const status = getBookingStatus(dateItem);
              const statusDot = getStatusDot(status);

              // Use the correct identifier based on booking type
              const dateIdentifier =
                type === BOOKING_TYPE.EVENT_TICKET
                  ? dateItem.id
                  : dateItem.start_date;

              const isSelected = selectedDateId === dateIdentifier;

              return (
                <div
                  key={dateItem.id}
                  onClick={() => handleDateSelect(dateItem)}
                  className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "transform scale-105"
                      : "hover:transform hover:scale-102"
                  }`}
                >
                  <div
                    className={`relative w-14 h-20 rounded-lg flex flex-col items-center justify-center text-center transition-all duration-300 border-2 ${
                      isSelected
                        ? "bg-gradient-to-br from-blue-500 to-blue-800 text-white border-transparent shadow-md"
                        : "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-700 border-slate-200 hover:border-blue-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Smaller Status Dot */}
                    {statusDot && (
                      <div
                        className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${statusDot} border border-white shadow-sm`}
                      ></div>
                    )}

                    <span className="text-xs font-medium opacity-80 uppercase tracking-wide">
                      {month}
                    </span>
                    <span className="text-xs font-semibold">{day}</span>
                    <span className="text-lg font-bold">{dayNum}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact Time Slots Section */}
      {selectedDate && times && Array.isArray(times) && times.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <Clock className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-base font-bold text-slate-800">
                Available Times
              </h3>
              <span className="ml-2 text-xs text-slate-500">
                for {formatDate(selectedDate.start_date).day},{" "}
                {formatDate(selectedDate.start_date).dayNum}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2">
              {times.map((timeItem) => {
                const status = getBookingStatus(timeItem);
                const statusDot = getStatusDot(status);
                const bookingSummary = getBookingSummary(timeItem);

                return (
                  <button
                    key={timeItem.id}
                    onClick={() => handleTimeSelect(timeItem)}
                    className={`relative px-2 py-2 rounded-lg border-2 transition-all duration-200 font-medium group ${
                      selectedTime?.id === timeItem.id
                        ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                    }`}
                  >
                    {/* Smaller Status Dot */}
                    {statusDot && (
                      <div
                        className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusDot} border border-white`}
                      ></div>
                    )}

                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-xs font-semibold leading-tight">
                        {formatTime(timeItem)}
                      </span>
                      {bookingSummary && (
                        <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full leading-none">
                          {bookingSummary.total}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Compact Loading state for times */}
      {selectedDate && loading && (
        <div className="px-4 pb-4">
          <div className="bg-slate-50 rounded-lg p-6">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="text-slate-600 text-sm font-medium">
                Loading time slots...
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compact Status Legend */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-sm"></div>
            <span className="text-slate-600 font-medium">Successful</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shadow-sm"></div>
            <span className="text-slate-600 font-medium">Pending</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-slate-600 font-medium">Failed</span>
          </div>
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