import React, { useState, useEffect } from "react";
import { Button, DatePicker, message } from "antd";
import { AlertCircle } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
dayjs.extend(utc);
dayjs.extend(timezone);

const CompactDateTimePicker = ({
  label,
  value,
  onDateTimeChange,
  timezone: userTimezone,
  disablePastDates = true,
  disablePastTimes = true,
  maxDateTime = null,
  minDateTime = null,
  minDate = null,
  disabled = false,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  isEditMode = false,
  originalDateTime = null,
  placeholder = "Select date and time",
}) => {
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const tz = userTimezone || dayjs.tz.guess();
  const now = dayjs().tz(tz);

  // ✅ FIX: Initialize value properly
  useEffect(() => {
    if (value) {
      setSelectedDateTime(dayjs(value).tz(tz));
    } else {
      setSelectedDateTime(null);
    }
  }, [value, tz]);

  // ✅ FIX: Determine minimum selectable date with proper logic
  const getMinDate = () => {
    // In edit mode with original date
    if (isEditMode && originalDateTime) {
      const originalDate = dayjs(originalDateTime).tz(tz).startOf("day");
      const today = dayjs().tz(tz).startOf("day");

      // If original date is in the past, allow selecting from today onwards
      if (originalDate.isBefore(today)) {
        return today;
      }
      // Otherwise, allow selecting from original date onwards
      return originalDate;
    }

    // Create mode: Block past dates
    if (disablePastDates) {
      return now.startOf("day");
    }

    return minDate ? dayjs(minDate).tz(tz).startOf("day") : null;
  };

  // ✅ FIX: Better date disabling logic - handle today properly
  const disabledDate = (current) => {
    if (!current) return false;

    const currentDate = current.tz(tz).startOf("day");
    const minDateObj = getMinDate();
    const today = dayjs().tz(tz).startOf("day");

    // Block dates strictly before minimum
    if (minDateObj && currentDate.isBefore(minDateObj, "day")) {
      return true;
    }

    // Block dates in the blocked set
    const dateStr = currentDate.format("YYYY-MM-DD");
    if (blockedDates && blockedDates.size > 0 && blockedDates.has(dateStr)) {
      return true;
    }

    // In edit mode, allow today selection even if it's the current day
    if (isEditMode && originalDateTime) {
      if (currentDate.isSame(today, "day")) {
        return false; // Allow today
      }
    }

    return false;
  };

  // ✅ FIX: Better time disabling logic - don't block if date is not today
  const disabledTime = (_, type) => {
    const hours = {
      disabledHours: () => [],
      disabledMinutes: () => [],
      disabledSeconds: () => [],
    };

    // If no value selected, no time disabled
    if (!selectedDateTime) {
      return hours;
    }

    const selectedDate = selectedDateTime.tz(tz).startOf("day");
    const todayDate = now.tz(tz).startOf("day");

    // Only disable times if selecting today
    if (!selectedDate.isSame(todayDate, "day")) {
      return hours;
    }

    // On today, disable past times only if disablePastTimes is true
    if (disablePastTimes) {
      const currentHour = now.hour();
      const currentMinute = now.minute();

      // Disable all hours before current hour
      hours.disabledHours = () =>
        Array.from({ length: currentHour }, (_, i) => i);

      // If current hour, disable past minutes
      if (type === "minutes") {
        hours.disabledMinutes = () =>
          Array.from({ length: currentMinute + 1 }, (_, i) => i);
      }
    }

    return hours;
  };

  // ✅ FIX: Handle date change with validation
  const handleChange = (date) => {
    if (!date) {
      setSelectedDateTime(null);
      if (onDateTimeChange) {
        onDateTimeChange(null);
      }
      return;
    }

    const selectedDate = date.tz(tz);
    const dateStr = selectedDate.format("YYYY-MM-DD");

    // Validate against blocked dates
    if (blockedDates && blockedDates.size > 0 && blockedDates.has(dateStr)) {
      message.error("This date is blocked due to active bookings");
      return;
    }

    // Validate min/max date times
    if (minDateTime) {
      const minDt = dayjs(minDateTime).tz(tz);
      if (selectedDate.isBefore(minDt)) {
        message.error(
          `Date/time must be after ${minDt.format("MMM D, YYYY hh:mm A")}`
        );
        return;
      }
    }

    if (maxDateTime) {
      const maxDt = dayjs(maxDateTime).tz(tz);
      if (selectedDate.isAfter(maxDt)) {
        message.error(
          `Date/time must be before ${maxDt.format("MMM D, YYYY hh:mm A")}`
        );
        return;
      }
    }

    setSelectedDateTime(selectedDate);

    if (onDateTimeChange) {
      onDateTimeChange(selectedDate.toDate());
    }
  };

  // ✅ FIX: Handle "Now" button click
  const handleNow = () => {
    const nowDateTime = dayjs().tz(tz);
    const dateStr = nowDateTime.format("YYYY-MM-DD");

    // Check if today is blocked
    if (blockedDates && blockedDates.size > 0 && blockedDates.has(dateStr)) {
      message.error("Today is blocked due to active bookings");
      return;
    }

    setSelectedDateTime(nowDateTime);

    if (onDateTimeChange) {
      onDateTimeChange(nowDateTime.toDate());
    }
  };

  // ✅ FIX: Show helper text for edit mode
  const getHelperText = () => {
    if (!isEditMode || !originalDateTime) {
      return null;
    }

    const originalDate = dayjs(originalDateTime).tz(tz);
    const today = dayjs().tz(tz).startOf("day");
    const originalDateObj = originalDate.startOf("day");

    if (originalDateObj.isBefore(today)) {
      return `Original date was ${originalDate.format(
        "MMM D, YYYY"
      )} (past). You can select from today onwards.`;
    }

    return `Original date: ${originalDate.format("MMM D, YYYY hh:mm A")}`;
  };

  const helperText = getHelperText();

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      {isScheduleBlocked && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
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
          showNow={!isScheduleBlocked && !disabled}
          onNow={handleNow}
          className="w-full"
          size="large"
          style={{ width: "100%" }}
          popupStyle={{ zIndex: 1050 }}
          allowClear={!isScheduleBlocked}
        />
      </div>

      {helperText && (
        <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-blue-800">{helperText}</p>
        </div>
      )}

      {blockedDates && blockedDates.size > 0 && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-amber-800">
            {blockedDates.size} date(s) are blocked due to active bookings
          </p>
        </div>
      )}

      {minDateTime && (
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <AlertCircle size={12} />
          Min: {dayjs(minDateTime).tz(tz).format("MMM D hh:mm A")}
        </div>
      )}

      {maxDateTime && (
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
          <AlertCircle size={12} />
          Max: {dayjs(maxDateTime).tz(tz).format("MMM D hh:mm A")}
        </div>
      )}
    </div>
  );
};

export default CompactDateTimePicker;
