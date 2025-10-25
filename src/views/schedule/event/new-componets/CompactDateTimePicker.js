import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, Clock, X, Globe, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { message } from "antd";
dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

const CompactDateTimePicker = ({
  onDateTimeChange,
  initialDateTime = null,
  value = null,
  placeholder = "Select Date & Time",
  disabled = false,
  label = null,
  timezone = "Asia/Dubai",
  minDateTime = null,
  maxDateTime = null, // NEW PROP
  disablePastDates = false,
  disablePastTimes = false,
  blockedDates = new Set(),
  isScheduleBlocked = false,
}) => {
  const getInitialValue = () => {
    if (value) {
      return dayjs(value).tz(timezone).toDate();
    }
    if (initialDateTime) {
      return dayjs(initialDateTime).tz(timezone).toDate();
    }
    return null;
  };

  const [selectedDateTime, setSelectedDateTime] = useState(getInitialValue);

  useEffect(() => {
    if (value) {
      setSelectedDateTime(dayjs(value).tz(timezone).toDate());
    } else if (value === null) {
      setSelectedDateTime(null);
    }
  }, [value, timezone]);

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  };

  const filterDate = (date) => {
    if (isDateBlocked(date)) return false;

    const nowInTz = dayjs().tz(timezone).startOf("day");
    const dateToCheck = dayjs(date).startOf("day");
    const nowDateStr = nowInTz.format("YYYY-MM-DD");
    const checkDateStr = dateToCheck.format("YYYY-MM-DD");

    // Check minimum date
    if (minDateTime) {
      const minDateInTz = dayjs(minDateTime).tz(timezone).startOf("day");
      const minDateStr = minDateInTz.format("YYYY-MM-DD");
      if (checkDateStr < minDateStr) return false;
    }

    // NEW: Check maximum date
    if (maxDateTime) {
      const maxDateInTz = dayjs(maxDateTime).tz(timezone).startOf("day");
      const maxDateStr = maxDateInTz.format("YYYY-MM-DD");
      if (checkDateStr >= maxDateStr) return false; // Block dates >= max
    }

    if (disablePastDates && checkDateStr < nowDateStr) return false;

    return true;
  };

  // Updated filterTime function
  const filterTime = (time) => {
    if (!selectedDateTime) return true;

    const nowInTz = dayjs().tz(timezone);
    const selectedDateInTz = dayjs(selectedDateTime).tz(timezone);
    const timeDate = new Date(time);
    const timeHour = timeDate.getHours();
    const timeMinute = timeDate.getMinutes();
    const isToday =
      selectedDateInTz.format("YYYY-MM-DD") === nowInTz.format("YYYY-MM-DD");

    // Check past times
    if (disablePastTimes && isToday) {
      const currentHourMinute = nowInTz.hour() * 60 + nowInTz.minute();
      const timeHourMinute = timeHour * 60 + timeMinute;
      if (timeHourMinute < currentHourMinute) return false;
    }

    // Check minimum time
    if (minDateTime) {
      const minDateInTz = dayjs(minDateTime).tz(timezone);
      const isMinDate =
        selectedDateInTz.format("YYYY-MM-DD") ===
        minDateInTz.format("YYYY-MM-DD");
      if (isMinDate) {
        const minHourMinute = minDateInTz.hour() * 60 + minDateInTz.minute();
        const timeHourMinute = timeHour * 60 + timeMinute;
        if (timeHourMinute < minHourMinute) return false;
      }
    }

    // NEW: Check maximum time
    if (maxDateTime) {
      const maxDateInTz = dayjs(maxDateTime).tz(timezone);
      const isMaxDate =
        selectedDateInTz.format("YYYY-MM-DD") ===
        maxDateInTz.format("YYYY-MM-DD");
      if (isMaxDate) {
        const maxHourMinute = maxDateInTz.hour() * 60 + maxDateInTz.minute();
        const timeHourMinute = timeHour * 60 + timeMinute;
        if (timeHourMinute >= maxHourMinute) return false; // Block times >= max
      }
    }

    return true;
  };

  const handleChange = (date) => {
    if (!date) {
      setSelectedDateTime(null);
      if (onDateTimeChange) {
        onDateTimeChange(null);
      }
      return;
    }

    // Don't convert - use the date as selected
    setSelectedDateTime(date);

    if (onDateTimeChange) {
      onDateTimeChange(date);
    }
  };

  const getTimezoneAbbr = () => {
    const abbrs = {
      "Asia/Dubai": "GST",
      "America/New_York": "EST",
      "America/Los_Angeles": "PST",
      "Europe/London": "GMT",
      "Asia/Kolkata": "IST",
      "Asia/Tokyo": "JST",
      "Australia/Sydney": "AEDT",
    };
    return abbrs[timezone] || dayjs().tz(timezone).format("z");
  };

  const formatDisplayDate = () => {
    if (!selectedDateTime) return placeholder;

    const dateInTz = dayjs(selectedDateTime).tz(timezone);
    const nowInTz = dayjs().tz(timezone);
    const todayInTz = nowInTz.startOf("day");
    const tomorrowInTz = todayInTz.add(1, "day");
    const selectedDayInTz = dateInTz.startOf("day");

    const timeString = dateInTz.format("hh:mm A");

    if (selectedDayInTz.isSame(todayInTz, "day")) {
      return `Today, ${timeString}`;
    }
    if (selectedDayInTz.isSame(tomorrowInTz, "day")) {
      return `Tomorrow, ${timeString}`;
    }
    return `${dateInTz.format("ddd, MMM D, YYYY")}, ${timeString}`;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}

      {isScheduleBlocked && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={18}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <span className="text-sm text-red-800 font-medium">
            Schedule is locked due to active bookings
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Calendar size={18} className="text-gray-400" />
          </div>
          <DatePicker
            selected={selectedDateTime}
            onChange={handleChange}
            disabled={disabled || isScheduleBlocked}
            minDate={
              minDateTime
                ? (() => {
                    const minInTz = dayjs(minDateTime).tz(timezone);
                    return new Date(
                      minInTz.year(),
                      minInTz.month(),
                      minInTz.date()
                    );
                  })()
                : disablePastDates
                ? (() => {
                    const nowInTz = dayjs().tz(timezone);
                    return new Date(
                      nowInTz.year(),
                      nowInTz.month(),
                      nowInTz.date()
                    );
                  })()
                : null
            }
            maxDate={
              maxDateTime
                ? (() => {
                    const maxInTz = dayjs(maxDateTime)
                      .tz(timezone)
                      .subtract(1, "day");
                    return new Date(
                      maxInTz.year(),
                      maxInTz.month(),
                      maxInTz.date()
                    );
                  })()
                : null
            }
            filterDate={filterDate}
            dateFormat="MMM d, yyyy"
            placeholderText="Select date"
            showMonthDropdown
            showYearDropdown
            dropdownMode="select"
            timeZone={timezone} // Add this
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
            <Clock size={18} className="text-gray-400" />
          </div>
          <DatePicker
            selected={selectedDateTime}
            onChange={handleChange}
            disabled={disabled || isScheduleBlocked || !selectedDateTime}
            showTimeSelect
            showTimeSelectOnly
            timeIntervals={5}
            timeCaption="Time"
            dateFormat="h:mm aa"
            placeholderText="Select time"
            filterTime={filterTime}
            timeZone={timezone}
            className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
          />
        </div>
      </div>

      {/* Quick Selection Buttons */}
      {!disabled && !isScheduleBlocked && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => {
              const nowInTz = dayjs().tz(timezone);
              const minutes = Math.ceil(nowInTz.minute() / 5) * 5;
              const roundedTime = nowInTz
                .minute(minutes)
                .second(0)
                .millisecond(0);

              // Validate against maxDateTime (for ad picker)
              if (maxDateTime && roundedTime.toDate() >= maxDateTime) {
                message.error(
                  `Time must be before ${dayjs(maxDateTime)
                    .tz(timezone)
                    .format("MMM D, YYYY hh:mm A")}`
                );
                return;
              }

              // Validate against minDateTime (for booking picker)
              if (minDateTime && roundedTime.toDate() <= minDateTime) {
                message.error(
                  `Time must be after ${dayjs(minDateTime)
                    .tz(timezone)
                    .format("MMM D, YYYY hh:mm A")}`
                );
                return;
              }

              const localDate = new Date(
                roundedTime.year(),
                roundedTime.month(),
                roundedTime.date(),
                roundedTime.hour(),
                roundedTime.minute(),
                0,
                0
              );
              handleChange(localDate);
            }}
            className="flex-1 py-2 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-all flex items-center justify-center gap-1.5"
          >
            <Clock size={14} />
            Set Now
          </button>
          <button
            onClick={() => {
              const tomorrowInTz = dayjs()
                .tz(timezone)
                .add(1, "day")
                .hour(9)
                .minute(0)
                .second(0)
                .millisecond(0);

              // Create a date object that represents this timezone's time as local time
              const localDate = new Date(
                tomorrowInTz.year(),
                tomorrowInTz.month(),
                tomorrowInTz.date(),
                tomorrowInTz.hour(),
                tomorrowInTz.minute(),
                0,
                0
              );
              handleChange(localDate);
            }}
            className="flex-1 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-all flex items-center justify-center gap-1.5"
          >
            <Calendar size={14} />
            Tomorrow
          </button>
        </div>
      )}

      {blockedDates.size > 0 && (
        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
          <AlertCircle size={12} />
          Some dates are blocked due to active bookings
        </p>
      )}

      <style jsx global>{`
        .react-datepicker-wrapper {
          width: 100%;
        }
        .react-datepicker__input-container {
          width: 100%;
        }
        .react-datepicker__day--disabled {
          color: #d1d5db !important;
          text-decoration: line-through;
          cursor: not-allowed !important;
        }
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        .react-datepicker {
          font-family: inherit;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
        }
        .react-datepicker__day:hover {
          background-color: #dbeafe;
          border-radius: 6px;
        }
        .react-datepicker__time-list-item--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CompactDateTimePicker;
