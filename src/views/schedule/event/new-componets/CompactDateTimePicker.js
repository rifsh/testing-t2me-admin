import React, { useState, useEffect } from "react";
import { Badge, Button, DatePicker, message } from "antd";
import { Calendar, Clock, X, Globe, AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

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
  minDate = null,
  maxDateTime = null,
  disablePastDates = false,
  disablePastTimes = false,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  disableToday = false,
}) => {
  const getInitialValue = () => {
    if (value) {
      return dayjs(value).tz(timezone);
    }
    if (initialDateTime) {
      return dayjs(initialDateTime).tz(timezone);
    }
    return null;
  };

  const [selectedDateTime, setSelectedDateTime] = useState(getInitialValue);

  useEffect(() => {
    if (value) {
      setSelectedDateTime(dayjs(value).tz(timezone));
    } else if (value === null) {
      setSelectedDateTime(null);
    }
  }, [value, timezone]);

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  };

  const disabledDate = (current) => {
    if (!current) return false;

    const currentInTz = dayjs(current).tz(timezone).startOf("day");
    const today = dayjs().tz(timezone).startOf("day");

    // Check if date is blocked by active bookings
    const dateStr = currentInTz.format("YYYY-MM-DD");
    if (blockedDates && blockedDates.size > 0 && blockedDates.has(dateStr)) {
      return true;
    }

    // FIXED: Only disable today if explicitly requested
    if (disableToday && currentInTz.isSame(today, "day")) {
      return true;
    }

    // FIXED: Only disable past dates (NOT including today) if disablePastDates is true
    if (disablePastDates && currentInTz.isBefore(today, "day")) {
      return true;
    }

    // Check min date
    if (minDate) {
      const minInTz = dayjs(minDate).tz(timezone).startOf("day");
      if (currentInTz.isBefore(minInTz, "day")) {
        return true;
      }
    }

    return false;
  };

  const disabledTime = (current) => {
    if (!current) return {};

    const now = dayjs().tz(timezone);
    const selectedDate = dayjs(current).tz(timezone).startOf("day");
    const today = dayjs().tz(timezone).startOf("day");

    // If selected date is today, disable past hours and minutes
    if (selectedDate.isSame(today, "day") && disablePastTimes) {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i < now.hour(); i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour()) {
            const minutes = [];
            for (let i = 0; i <= now.minute(); i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        },
      };
    }

    return {};
  };

  const handleChange = (date) => {
    if (!date) {
      setSelectedDateTime(null);
      if (onDateTimeChange) {
        onDateTimeChange(null);
      }
      return;
    }

    // ADDED: Validate against blocked dates when "Now" button is clicked
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    if (blockedDates && blockedDates.size > 0 && blockedDates.has(dateStr)) {
      message.error("This date is blocked due to active bookings");
      return;
    }

    setSelectedDateTime(date);

    if (onDateTimeChange) {
      onDateTimeChange(date.toDate());
    }
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

      <div className="w-full">
        <DatePicker
          value={selectedDateTime}
          onChange={handleChange}
          disabled={disabled || isScheduleBlocked}
          disabledDate={disabledDate}
          disabledTime={disabledTime}
          showTime={{
            format: "hh:mm A",
            use12Hours: true,
            minuteStep: 5,
            hideDisabledOptions: true,
          }}
          format="MMM D, YYYY hh:mm A"
          placeholder={placeholder}
          showNow={!isScheduleBlocked}
          className="w-full"
          size="large"
          style={{ width: "100%" }}
          popupStyle={{ zIndex: 1050 }}
          allowClear={!isScheduleBlocked}
        />
      </div>

      {blockedDates.size > 0 && (
        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-amber-800">
            {blockedDates.size} date(s) are blocked due to active bookings
          </p>
        </div>
      )}
    </div>
  );
};

export default CompactDateTimePicker;
