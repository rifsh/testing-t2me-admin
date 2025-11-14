import React, { useState, useMemo, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, AlertCircle, X, CheckCircle, XCircle } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import CustomModal from "./CustomModal";
import Calendar from "./Calendar";
import TimePicker from "./TimePicker";
import TimezoneClock from "./TimezoneClock";
import { DateTimeHelpers } from "../utils/DateTimeHelpers";

dayjs.extend(utc);
dayjs.extend(timezone);

const CompactDateTimePicker = ({
  label,
  value,
  onDateTimeChange,
  timezone: userTimezone = "Asia/Dubai",
  minDateTime = null,
  maxDateTime = null,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  placeholder = "Select date and time",
  showQuickOptions = true,
  validatePastDates = true,
  validatePastTimes = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null); // ✅ State for validation message

  const getCurrentTimeInTimezone = () => {
    return dayjs().tz(userTimezone);
  };

  useEffect(() => {
    if (value) {
      const dateTime = dayjs(value).tz(userTimezone);
      setSelectedDate(dateTime.toDate());
      setSelectedTime({
        hour: dateTime.hour(),
        minute: dateTime.minute(),
      });
    }
  }, [value, userTimezone]);

  // ✅ Auto-validate when date or time changes
  useEffect(() => {
    if (isModalOpen) {
      validateSelection();
    }
  }, [selectedDate, selectedTime, isModalOpen]);

  const displayValue = useMemo(() => {
    if (!value) return null;
    return dayjs(value).tz(userTimezone).format("MMM D, YYYY • hh:mm A");
  }, [value, userTimezone]);

  // ✅ Validation function
  const validateSelection = () => {
    // No selection yet
    if (!selectedDate && !selectedTime) {
      setValidationMessage(null);
      return { isValid: false };
    }

    if (!selectedDate) {
      setValidationMessage({
        type: "error",
        message: "Please select a date",
      });
      return { isValid: false };
    }

    if (!selectedTime) {
      setValidationMessage({
        type: "error",
        message: "Please select a time",
      });
      return { isValid: false };
    }

    try {
      // Combine date and time
      const dateObj = dayjs(selectedDate);
      const combined = dayjs.tz(
        `${dateObj.year()}-${String(dateObj.month() + 1).padStart(2, "0")}-${String(
          dateObj.date()
        ).padStart(2, "0")} ${String(selectedTime.hour).padStart(2, "0")}:${String(
          selectedTime.minute
        ).padStart(2, "0")}`,
        "YYYY-MM-DD HH:mm",
        userTimezone
      );

      if (!combined.isValid()) {
        setValidationMessage({
          type: "error",
          message: "Invalid date/time combination",
        });
        return { isValid: false };
      }

      const now = getCurrentTimeInTimezone();

      // Check if in the past
      if (validatePastDates || validatePastTimes) {
        const diffMinutes = combined.diff(now, "minute");

        if (diffMinutes < 0) {
          const selectedDay = combined.startOf("day");
          const today = now.startOf("day");

          if (selectedDay.isSame(today, "day")) {
            setValidationMessage({
              type: "error",
              message: `Selected time (${combined.format(
                "hh:mm A"
              )}) is in the past. Current time: ${now.format("hh:mm A")}`,
            });
          } else {
            setValidationMessage({
              type: "error",
              message: `Selected date (${combined.format(
                "MMM D, YYYY"
              )}) is in the past. Current date: ${now.format("MMM D, YYYY")}`,
            });
          }
          return { isValid: false };
        }
      }

      // Check against minDateTime
      if (minDateTime) {
        const minDt = dayjs(minDateTime).tz(userTimezone);
        if (combined.isBefore(minDt)) {
          setValidationMessage({
            type: "error",
            message: `Date/time must be after ${minDt.format("MMM D, YYYY hh:mm A")}`,
          });
          return { isValid: false };
        }
      }

      // Check against maxDateTime
      if (maxDateTime) {
        const maxDt = dayjs(maxDateTime).tz(userTimezone);
        if (combined.isAfter(maxDt)) {
          setValidationMessage({
            type: "error",
            message: `Date/time must be before ${maxDt.format("MMM D, YYYY hh:mm A")}`,
          });
          return { isValid: false };
        }
      }

      // Check if date is blocked
      if (blockedDates && blockedDates.size > 0) {
        const dateStr = combined.format("YYYY-MM-DD");
        if (blockedDates.has(dateStr)) {
          setValidationMessage({
            type: "error",
            message: `Date ${combined.format(
              "MMM D, YYYY"
            )} is blocked due to active bookings`,
          });
          return { isValid: false };
        }
      }

      // All validations passed
      setValidationMessage({
        type: "success",
        message: `Ready to apply: ${combined.format("dddd, MMM D, YYYY • hh:mm A")}`,
      });
      return { isValid: true, combined: combined.toDate() };
    } catch (error) {
      console.error("Validation error:", error);
      setValidationMessage({
        type: "error",
        message: "Error validating date/time. Please reselect.",
      });
      return { isValid: false };
    }
  };

  const handleOpenModal = () => {
    if (isScheduleBlocked) return;

    const now = getCurrentTimeInTimezone();

    if (value) {
      const dateTime = dayjs(value).tz(userTimezone);
      setSelectedDate(dateTime.toDate());
      setSelectedTime({
        hour: dateTime.hour(),
        minute: dateTime.minute(),
      });
    } else {
      const roundedTime = DateTimeHelpers.getCurrentTimeRounded(15, userTimezone);
      setSelectedDate(now.toDate());
      setSelectedTime({
        hour: roundedTime.hour(),
        minute: roundedTime.minute(),
      });
    }

    setValidationMessage(null);
    setIsModalOpen(true);
  };

  const handleDateSelect = (date) => {
    const clickedDate = dayjs(date);
    const selectedDay = dayjs
      .tz(
        `${clickedDate.year()}-${String(clickedDate.month() + 1).padStart(
          2,
          "0"
        )}-${String(clickedDate.date()).padStart(2, "0")}`,
        userTimezone
      )
      .startOf("day");

    const today = getCurrentTimeInTimezone().startOf("day");
    const now = getCurrentTimeInTimezone();

    setSelectedDate(selectedDay.toDate());

    if (selectedDay.isSame(today, "day") && selectedTime) {
      const wouldBePast = selectedDay
        .hour(selectedTime.hour)
        .minute(selectedTime.minute)
        .isBefore(now);

      if (wouldBePast) {
        const roundedTime = DateTimeHelpers.getCurrentTimeRounded(15, userTimezone);
        setSelectedTime({
          hour: roundedTime.hour(),
          minute: roundedTime.minute(),
        });
      }
    } else if (!selectedTime) {
      const currentTime = DateTimeHelpers.getCurrentTimeRounded(15, userTimezone);
      setSelectedTime({
        hour: currentTime.hour(),
        minute: currentTime.minute(),
      });
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  // ✅ Apply button - only proceed if valid
  const handleApply = () => {
    const validation = validateSelection();

    if (!validation.isValid) {
      // Validation message already shown in modal
      return;
    }

    onDateTimeChange(validation.combined);
    setIsModalOpen(false);
    setValidationMessage(null);
  };

  const handleQuickOption = (option) => {
    const optionDate = dayjs(option.date);
    const selectedDay = dayjs
      .tz(
        `${optionDate.year()}-${String(optionDate.month() + 1).padStart(
          2,
          "0"
        )}-${String(optionDate.date()).padStart(2, "0")}`,
        userTimezone
      )
      .startOf("day");

    const today = getCurrentTimeInTimezone().startOf("day");

    setSelectedDate(selectedDay.toDate());

    if (selectedDay.isSameOrBefore(today, "day")) {
      const roundedTime = DateTimeHelpers.getCurrentTimeRounded(15, userTimezone);
      setSelectedTime({
        hour: roundedTime.hour(),
        minute: roundedTime.minute(),
      });
    } else {
      setSelectedTime({
        hour: 9,
        minute: 0,
      });
    }
  };

  const quickOptions = useMemo(
    () => DateTimeHelpers.getQuickDateOptions(userTimezone),
    [userTimezone]
  );

  // ✅ Get validation message icon
  const getValidationIcon = () => {
    if (!validationMessage) return null;
    
    switch (validationMessage.type) {
      case "success":
        return <CheckCircle size={16} className="text-green-600 flex-shrink-0" />;
      case "error":
        return <XCircle size={16} className="text-red-600 flex-shrink-0" />;
      case "warning":
        return <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />;
      default:
        return null;
    }
  };

  // ✅ Get validation message styles
  const getValidationStyles = () => {
    if (!validationMessage) return "";
    
    switch (validationMessage.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-amber-50 border-amber-200 text-amber-800";
      default:
        return "";
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <button
        onClick={handleOpenModal}
        disabled={isScheduleBlocked}
        className={`w-full px-4 py-4 flex items-center justify-between gap-3 rounded-xl transition-all ${
          isScheduleBlocked
            ? "bg-gray-50 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-300 hover:border-blue-500 hover:shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* <CalendarIcon size={18} className="text-gray-400 flex-shrink-0" /> */}
          <span
            className={
              displayValue
                ? "text-gray-900 font-medium text-sm"
                : "text-gray-400 text-sm"
            }
          >
            {displayValue || placeholder}
          </span>
        </div>
        {displayValue && !isScheduleBlocked && (
          <X
            size={16}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onDateTimeChange(null);
            }}
          />
        )}
      </button>

      {isScheduleBlocked && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <span className="text-xs text-red-800 font-medium">
            Schedule is locked due to active bookings
          </span>
        </div>
      )}

      {blockedDates && blockedDates.size > 0 && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            {blockedDates.size} date(s) blocked due to active bookings
          </p>
        </div>
      )}

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setValidationMessage(null);
        }}
        title={
          <div className="flex items-center justify-between w-full pr-8">
            <span>Select Date & Time</span>
          </div>
        }
        size="lg"
        footer={
          <div className="flex flex-col gap-3">
            {/* ✅ Validation message in footer */}
            {validationMessage && (
              <div
                className={`p-3 border-2 rounded-xl flex items-center gap-2 ${getValidationStyles()}`}
              >
                {getValidationIcon()}
                <span className="text-sm font-medium flex-1">
                  {validationMessage.message}
                </span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setValidationMessage(null);
                }}
                className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={!selectedDate || !selectedTime}
                className="px-5 py-2 text-sm text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
              >
                Apply
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-5">
        {showQuickOptions && (
  <div>
    <h3 className="text-sm font-semibold text-gray-700 mb-2">
      Quick Select
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
      {/* Current Time Button */}
      <button
        onClick={() => handleQuickOption({ date: new Date(), value: "now" })}
        className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all cursor-pointer flex items-center justify-center"
      >
        <TimezoneClock
          timezone={userTimezone}
          className="text-blue-900"
        />
      </button>

      {/* Quick Option Buttons */}
      {quickOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleQuickOption(option)}
          className="w-full px-3 py-3 text-xs font-medium text-gray-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 border border-transparent hover:border-blue-300 rounded-xl transition-all cursor-pointer flex items-center justify-center"
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
)}


          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CalendarIcon size={16} />
                Date
              </h3>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                blockedDates={blockedDates}
                timezone={userTimezone}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Clock size={16} />
                Time
              </h3>
              <TimePicker
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
                format="12"
                intervalMinutes={15}
              />
            </div>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default CompactDateTimePicker;
