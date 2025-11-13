import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Calendar as CalendarIcon,
  AlertCircle,
  X,
  CheckCircle,
  XCircle,
} from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import CustomModal from "./CustomModal";
import TimezoneClock from "./TimezoneClock";
import { DateTimeHelpers } from "../utils/DateTimeHelpers";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

const CustomRangeDatePicker = ({
  startDate: initialStartDate = null,
  endDate: initialEndDate = null,
  onDateRangeChange,
  timezone: userTimezone = "Asia/Dubai",
  minDate = null,
  maxDate = null,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  isEditMode = false,
  placeholder = "Select date range",
  showQuickOptions = true,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [validationMessage, setValidationMessage] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [showResetWarning, setShowResetWarning] = useState(false);
  const [pendingDates, setPendingDates] = useState(null);

  useEffect(() => {
    if (initialStartDate) {
      const dt = dayjs(initialStartDate).tz(userTimezone);
      setStartDate(dt.toDate());
    } else {
      setStartDate(null);
    }

    if (initialEndDate) {
      const dt = dayjs(initialEndDate).tz(userTimezone);
      setEndDate(dt.toDate());
    } else {
      setEndDate(null);
    }
  }, [initialStartDate, initialEndDate, userTimezone]);

  useEffect(() => {
    if (isModalOpen) {
      validateSelection();
    }
  }, [startDate, endDate, isModalOpen]);

  const displayValue = useMemo(() => {
    if (!startDate || !endDate) return null;
    return `${dayjs(startDate)
      .tz(userTimezone)
      .format("MMM D, YYYY")} - ${dayjs(endDate)
      .tz(userTimezone)
      .format("MMM D, YYYY")}`;
  }, [startDate, endDate, userTimezone]);

  const blockedDateRange = useMemo(() => {
    if (!blockedDates || blockedDates.size === 0) {
      return { minBlocked: null, maxBlocked: null };
    }

    const sortedDates = Array.from(blockedDates)
      .map((dateStr) => dayjs(dateStr, "YYYY-MM-DD").tz(userTimezone))
      .sort((a, b) => a.valueOf() - b.valueOf());

    return {
      minBlocked: sortedDates[0].format("YYYY-MM-DD"),
      maxBlocked: sortedDates[sortedDates.length - 1].format("YYYY-MM-DD"),
    };
  }, [blockedDates, userTimezone]);

  // ✅ Check if date should be disabled
  const isDateDisabled = useCallback(
    (day, isCurrentMonth) => {
      if (!isCurrentMonth) return true;

      // In edit mode with bookings, disable dates before first booking
      if (isEditMode && blockedDateRange.minBlocked) {
        const minBlockedDate = dayjs(blockedDateRange.minBlocked, "YYYY-MM-DD")
          .tz(userTimezone)
          .startOf("day");
        const checkDate = dayjs
          .tz(
            `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
              day.date
            ).padStart(2, "0")}`,
            userTimezone
          )
          .startOf("day");

        // Disable if before first booking date
        return checkDate.isBefore(minBlockedDate, "day");
      }

      return false;
    },
    [isEditMode, blockedDateRange, userTimezone]
  );

  const validateSelection = useCallback(() => {
    if (!startDate) {
      setValidationMessage({
        type: "warning",
        message: "Please select a start date",
      });
      return { isValid: false };
    }

    if (!endDate) {
      setValidationMessage({
        type: "warning",
        message: "Please select an end date",
      });
      return { isValid: false };
    }

    const start = dayjs(startDate).tz(userTimezone).startOf("day");
    const end = dayjs(endDate).tz(userTimezone).startOf("day");

    if (end.isBefore(start)) {
      setValidationMessage({
        type: "error",
        message: "End date must be on or after start date",
      });
      return { isValid: false };
    }

    if (isEditMode && blockedDates.size > 0) {
      const excludedDates = [];

      blockedDates.forEach((dateStr) => {
        const blockedDay = dayjs(dateStr, "YYYY-MM-DD")
          .tz(userTimezone)
          .startOf("day");
        if (
          blockedDay.isBefore(start, "day") ||
          blockedDay.isAfter(end, "day")
        ) {
          excludedDates.push(dateStr);
        }
      });

      if (excludedDates.length > 0) {
        setValidationMessage({
          type: "error",
          message: `Cannot exclude booked dates: ${excludedDates.join(
            ", "
          )}. Must include all bookings from ${
            blockedDateRange.minBlocked
          } to ${blockedDateRange.maxBlocked}`,
        });
        return { isValid: false };
      }
    }

    if (isEditMode && blockedDateRange.minBlocked) {
      const minBlockedDate = dayjs(blockedDateRange.minBlocked, "YYYY-MM-DD")
        .tz(userTimezone)
        .startOf("day");
      if (start.isAfter(minBlockedDate, "day")) {
        setValidationMessage({
          type: "error",
          message: `Start date must be on or before first booking date (${blockedDateRange.minBlocked})`,
        });
        return { isValid: false };
      }
    }

    if (isEditMode && blockedDateRange.maxBlocked) {
      const maxBlockedDate = dayjs(blockedDateRange.maxBlocked, "YYYY-MM-DD")
        .tz(userTimezone)
        .startOf("day");

      if (
        end.isBefore(maxBlockedDate, "day") ||
        end.isSame(maxBlockedDate, "day")
      ) {
        setValidationMessage({
          type: "error",
          message: `End date must be AFTER last booking date (${
            blockedDateRange.maxBlocked
          }). Select ${dayjs(maxBlockedDate)
            .add(1, "day")
            .format("MMM D, YYYY")} or later`,
        });
        return { isValid: false };
      }
    }

    const dayCount = end.diff(start, "days") + 1;
    setValidationMessage({
      type: "success",
      message: `Ready to apply: ${start.format("MMM D")} - ${end.format(
        "MMM D, YYYY"
      )} (${dayCount} ${dayCount === 1 ? "day" : "days"})`,
    });
    return { isValid: true };
  }, [
    startDate,
    endDate,
    isEditMode,
    blockedDates,
    blockedDateRange,
    userTimezone,
  ]);

  const handleOpenModal = () => {
    if (isScheduleBlocked) return;

    if (initialStartDate) {
      const dt = dayjs(initialStartDate).tz(userTimezone);
      setStartDate(dt.toDate());
      setCurrentMonth(dt.month());
      setCurrentYear(dt.year());
    } else {
      setStartDate(null);
    }

    if (initialEndDate) {
      const dt = dayjs(initialEndDate).tz(userTimezone);
      setEndDate(dt.toDate());
    } else {
      setEndDate(null);
    }

    setValidationMessage(null);
    setIsModalOpen(true);
  };

  const checkIfDatesExtended = (newStart, newEnd) => {
    if (!initialStartDate || !initialEndDate) return false;

    const oldStart = dayjs(initialStartDate).tz(userTimezone).startOf("day");
    const oldEnd = dayjs(initialEndDate).tz(userTimezone).startOf("day");
    const newStartDay = dayjs(newStart).tz(userTimezone).startOf("day");
    const newEndDay = dayjs(newEnd).tz(userTimezone).startOf("day");

    const extendedBackward = newStartDay.isBefore(oldStart, "day");
    const extendedForward = newEndDay.isAfter(oldEnd, "day");

    return extendedBackward || extendedForward;
  };

  const handleApply = () => {
    const validation = validateSelection();
    if (!validation.isValid) return;

    if (isEditMode && checkIfDatesExtended(startDate, endDate)) {
      setPendingDates({ startDate, endDate });
      setShowResetWarning(true);
      return;
    }

    onDateRangeChange({
      startDate,
      endDate,
      isSelecting: false,
    });
    setIsModalOpen(false);
    setValidationMessage(null);
  };

  const handleConfirmApply = () => {
    if (pendingDates) {
      onDateRangeChange({
        startDate: pendingDates.startDate,
        endDate: pendingDates.endDate,
        isSelecting: false,
      });
    }
    setShowResetWarning(false);
    setPendingDates(null);
    setIsModalOpen(false);
    setValidationMessage(null);
  };

  const handleCancelApply = () => {
    setShowResetWarning(false);
    setPendingDates(null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (isScheduleBlocked) return;
    if (isEditMode && blockedDates.size > 0) return;

    onDateRangeChange({
      startDate: null,
      endDate: null,
      isSelecting: false,
    });
  };

  const getMonthDays = (year, month) => {
    return DateTimeHelpers.getCalendarDays(year, month);
  };

  const firstMonthDays = useMemo(
    () => getMonthDays(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const secondMonthDays = useMemo(() => {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    return getMonthDays(nextYear, nextMonth);
  }, [currentYear, currentMonth]);

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

  // ✅ Handle date click with disabled check
  const handleDateClick = (day, isCurrentMonth) => {
    if (!isCurrentMonth) return;

    // ✅ Check if date is disabled
    if (isDateDisabled(day, isCurrentMonth)) return;

    const selectedDate = dayjs.tz(
      `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
        day.date
      ).padStart(2, "0")}`,
      userTimezone
    );

    if (!startDate || (startDate && endDate)) {
      setStartDate(selectedDate.toDate());
      setEndDate(null);
    } else {
      const startDay = dayjs(startDate).tz(userTimezone).startOf("day");
      if (selectedDate.isSameOrAfter(startDay, "day")) {
        setEndDate(selectedDate.toDate());
      } else {
        setStartDate(selectedDate.toDate());
        setEndDate(null);
      }
    }
  };

  const renderMonth = (days, monthIndex, year) => {
    const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
    const today = dayjs().tz(userTimezone).startOf("day");

    const isDateBlocked = (day) => {
      if (!blockedDates || blockedDates.size === 0) return false;
      const dateStr = `${day.year}-${String(day.month + 1).padStart(
        2,
        "0"
      )}-${String(day.date).padStart(2, "0")}`;
      return blockedDates.has(dateStr);
    };

    const isInRange = (day) => {
      if (!startDate || !endDate) return false;
      const checkDate = dayjs
        .tz(
          `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
            day.date
          ).padStart(2, "0")}`,
          userTimezone
        )
        .startOf("day");
      const start = dayjs(startDate).tz(userTimezone).startOf("day");
      const end = dayjs(endDate).tz(userTimezone).startOf("day");
      return checkDate.isBetween(start, end, null, "[]");
    };

    const isStartDate = (day) => {
      if (!startDate) return false;
      const checkDate = dayjs
        .tz(
          `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
            day.date
          ).padStart(2, "0")}`,
          userTimezone
        )
        .startOf("day");
      const start = dayjs(startDate).tz(userTimezone).startOf("day");
      return checkDate.isSame(start, "day");
    };

    const isEndDate = (day) => {
      if (!endDate) return false;
      const checkDate = dayjs
        .tz(
          `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
            day.date
          ).padStart(2, "0")}`,
          userTimezone
        )
        .startOf("day");
      const end = dayjs(endDate).tz(userTimezone).startOf("day");
      return checkDate.isSame(end, "day");
    };

    const isToday = (day) => {
      if (!day.isCurrentMonth) return false;
      const checkDate = dayjs
        .tz(
          `${day.year}-${String(day.month + 1).padStart(2, "0")}-${String(
            day.date
          ).padStart(2, "0")}`,
          userTimezone
        )
        .startOf("day");
      return checkDate.isSame(today, "day");
    };

    return (
      <div className="w-full">
        <div className="text-center text-base font-semibold text-gray-900 mb-3">
          {dayjs().month(monthIndex).format("MMMM")} {year}
        </div>

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

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isTodayDate = isToday(day);
            const isBlocked = isDateBlocked(day);
            const inRange = isInRange(day);
            const isStart = isStartDate(day);
            const isEnd = isEndDate(day);
            const disabled = isDateDisabled(day, day.isCurrentMonth);

            let buttonClasses =
              "w-full h-9 flex items-center justify-center rounded-md text-sm font-medium transition-all relative ";

            if (disabled) {
              buttonClasses +=
                "bg-gray-100 text-gray-300 cursor-not-allowed line-through";
            } else if (isStart || isEnd) {
              buttonClasses +=
                "bg-blue-600 text-white hover:bg-blue-700 shadow-sm z-10 cursor-pointer";
            } else if (inRange) {
              buttonClasses +=
                "bg-blue-100 text-blue-900 hover:bg-blue-200 cursor-pointer";
            } else if (isTodayDate) {
              buttonClasses +=
                "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold cursor-pointer";
            } else if (!day.isCurrentMonth) {
              buttonClasses += "text-gray-300 hover:bg-gray-50 cursor-pointer";
            } else {
              buttonClasses += "text-gray-700 hover:bg-gray-100 cursor-pointer";
            }

            return (
              <button
                key={index}
                onClick={() => handleDateClick(day, day.isCurrentMonth)}
                disabled={disabled}
                className={buttonClasses}
                title={
                  disabled
                    ? `Disabled - Before booking start (${blockedDateRange.minBlocked})`
                    : isBlocked
                    ? "⚠️ Booking date - must be included"
                    : isTodayDate
                    ? "Today"
                    : `${day.year}-${String(day.month + 1).padStart(
                        2,
                        "0"
                      )}-${String(day.date).padStart(2, "0")}`
                }
              >
                {day.date}
                {isBlocked && !disabled && (
                  <div className="absolute bottom-0.5 w-1 h-1 bg-red-500 rounded-full z-20" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const quickOptions = useMemo(() => {
    const now = dayjs().tz(userTimezone);
    return [
      {
        label: "This Week",
        value: "this_week",
        start: now.startOf("week"),
        end: now.endOf("week"),
      },
      {
        label: "This Month",
        value: "this_month",
        start: now.startOf("month"),
        end: now.endOf("month"),
      },
      {
        label: "Next Month",
        value: "next_month",
        start: now.add(1, "month").startOf("month"),
        end: now.add(1, "month").endOf("month"),
      },
      {
        label: "Next 3 Months",
        value: "next_3_months",
        start: now,
        end: now.add(3, "months"),
      },
    ];
  }, [userTimezone]);

  const handleQuickOption = (option) => {
    setStartDate(option.start.toDate());
    setEndDate(option.end.toDate());
  };

  const getValidationIcon = () => {
    if (!validationMessage) return null;
    switch (validationMessage.type) {
      case "success":
        return (
          <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
        );
      case "error":
        return <XCircle size={16} className="text-red-600 flex-shrink-0" />;
      case "warning":
        return (
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
        );
      default:
        return null;
    }
  };

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
      <label className="block text-sm font-semibold text-gray-700">
        Event Date Range
      </label>

      <button
        onClick={handleOpenModal}
        disabled={isScheduleBlocked}
        className={`w-full px-4 py-4 flex items-center justify-between gap-3 rounded-xl transition-all ${
          isScheduleBlocked
            ? "bg-gray-50 border-blue-800 cursor-not-allowed"
            : "bg-blue-50 border-gray-300 hover:border-blue-500 hover:shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        }`}
      >
        <div className="flex items-center gap-3">
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
        {displayValue &&
          !isScheduleBlocked &&
          !(isEditMode && blockedDates.size > 0) && (
            <X
              size={16}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              onClick={handleClear}
            />
          )}
      </button>

      {isScheduleBlocked && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={16}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <span className="text-xs text-red-800 font-medium">
            Schedule is locked due to active bookings
          </span>
        </div>
      )}

      {blockedDates && blockedDates.size > 0 && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <div className="text-xs text-amber-800">
            <p className="font-semibold">
              {blockedDates.size} date(s) with active bookings
            </p>
            <p className="mt-1">
              <strong>Start:</strong> On or before {blockedDateRange.minBlocked}
              <br />
              <strong>End:</strong> AFTER {blockedDateRange.maxBlocked}
            </p>
          </div>
        </div>
      )}

      <CustomModal
        isOpen={isModalOpen && !showResetWarning}
        onClose={() => {
          setIsModalOpen(false);
          setValidationMessage(null);
        }}
        title="Select Date Range"
        size="lg"
        footer={
          <div className="flex flex-col gap-3">
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
                disabled={
                  !startDate ||
                  !endDate ||
                  (validationMessage && validationMessage.type === "error")
                }
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
            <div className="w-full">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Quick Select
              </h3>
              <div className="w-full flex flex-wrap gap-2">
                <div className="flex-1 min-w-[150px] p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                  <TimezoneClock
                    timezone={userTimezone}
                    className="text-blue-900 justify-center"
                  />
                </div>

                {quickOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleQuickOption(option)}
                    className="flex-1 min-w-[120px] px-4 py-3 text-sm font-medium text-gray-700 bg-blue-50 hover:bg-blue-100 hover:text-blue-600 border border-transparent hover:border-blue-300 rounded-xl transition-all cursor-pointer text-center"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} />
                Select Date Range
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderMonth(firstMonthDays, currentMonth, currentYear)}
              {renderMonth(
                secondMonthDays,
                currentMonth === 11 ? 0 : currentMonth + 1,
                currentMonth === 11 ? currentYear + 1 : currentYear
              )}
            </div>
          </div>
        </div>
      </CustomModal>

      {/* Reset Warning Modal */}
      <CustomModal
        isOpen={showResetWarning}
        onClose={handleCancelApply}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-600" />
            <span>⚠️ Schedule Reset Required</span>
          </div>
        }
        size="md"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleCancelApply}
              className="px-5 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmApply}
              className="px-5 py-2 text-sm text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-colors font-medium shadow-sm"
            >
              Confirm & Reset Schedules
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              📅 Date Range Extended
            </p>
            <p className="text-sm text-amber-800">
              You're extending the event date range. This will affect time slot
              schedules for the new dates.
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              🔄 What Will Happen:
            </p>
            <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
              <li>New dates will be added to the event schedule</li>
              <li>Time slots must be configured for new dates</li>
              <li>Existing bookings remain protected</li>
              <li>You'll need to set schedules one by one for new dates</li>
            </ul>
          </div>

          <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <p className="text-sm font-semibold text-green-900 mb-2">
              ✅ Protected:
            </p>
            <p className="text-sm text-green-800">
              All bookings from {blockedDateRange.minBlocked} to{" "}
              {blockedDateRange.maxBlocked} are safe and will not be affected.
            </p>
          </div>
        </div>
      </CustomModal>
    </div>
  );
};

export default CustomRangeDatePicker;
