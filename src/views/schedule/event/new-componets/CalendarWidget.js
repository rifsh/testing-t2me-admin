import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AlertCircle, X } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

const CalendarWidget = ({
  onDateRangeChange,
  initialStartDate = null,
  initialEndDate = null,
  minDate = null,
  maxDate = null,
  blockedDates = new Set(),
  isScheduleBlocked = false,
  isEditMode = false,
  timezone = "Asia/Dubai",
}) => {
  const [startDate, setStartDate] = useState(
    initialStartDate ? dayjs(initialStartDate).tz(timezone).toDate() : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? dayjs(initialEndDate).tz(timezone).toDate() : null
  );

  useEffect(() => {
    setStartDate(
      initialStartDate ? dayjs(initialStartDate).tz(timezone).toDate() : null
    );
    setEndDate(
      initialEndDate ? dayjs(initialEndDate).tz(timezone).toDate() : null
    );
  }, [initialStartDate, initialEndDate, timezone]);

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  };

  const isBeforeMinDate = (date) => {
    if (!minDate || !date) return false;
    return dayjs(date)
      .tz(timezone)
      .isBefore(dayjs(minDate).tz(timezone), "day");
  };

  const isAfterMaxDate = (date) => {
    if (!maxDate || !date) return false;
    return dayjs(date).tz(timezone).isAfter(dayjs(maxDate).tz(timezone), "day");
  };

  const hasBlockedDatesInRange = (start, end) => {
    if (!start || !end) return false;
    let current = dayjs(start).tz(timezone);
    const endDay = dayjs(end).tz(timezone);

    while (current.isSameOrBefore(endDay, "day")) {
      if (isDateBlocked(current.toDate())) {
        return true;
      }
      current = current.add(1, "day");
    }
    return false;
  };

  const filterDate = (date) => {
    if (isDateBlocked(date)) return false;
    if (isBeforeMinDate(date)) return false;
    if (isAfterMaxDate(date)) return false;

    if (startDate && !endDate) {
      const dateInTz = dayjs(date).tz(timezone);
      const startInTz = dayjs(startDate).tz(timezone);

      if (dateInTz.isBefore(startInTz, "day")) return false;
      if (hasBlockedDatesInRange(startDate, date)) return false;
    }

    if (
      isEditMode &&
      startDate &&
      endDate &&
      hasBlockedDatesInRange(startDate, endDate)
    ) {
      const dateInTz = dayjs(date).tz(timezone);
      const endInTz = dayjs(endDate).tz(timezone);

      if (dateInTz.isSameOrBefore(endInTz, "day")) {
        return false;
      }

      const dayAfterEnd = endInTz.add(1, "day");
      if (hasBlockedDatesInRange(dayAfterEnd.toDate(), date)) {
        return false;
      }
    }

    return true;
  };

  const onChange = (dates) => {
    if (isScheduleBlocked) return;

    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);

    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: start,
        endDate: end,
        isSelecting: start && !end,
      });
    }
  };

  const getDayClassName = (date) => {
    const classes = [];
    if (isDateBlocked(date)) classes.push("blocked-date");
    if (isBeforeMinDate(date)) classes.push("before-min-date");
    if (isAfterMaxDate(date)) classes.push("after-max-date");
    return classes.join(" ");
  };

  const handleClear = () => {
    if (isScheduleBlocked) return;

    setStartDate(null);
    setEndDate(null);
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: null,
        endDate: null,
        isSelecting: false,
      });
    }
  };

  return (
    <div className="w-full">
      {isScheduleBlocked && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={18}
            className="text-red-600 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-red-900">
              Schedule Locked
            </p>
            <p className="text-xs text-red-700">Date changes not allowed</p>
          </div>
        </div>
      )}

      <div className="w-full calendar-container">
        <DatePicker
          selected={startDate}
          onChange={onChange}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          inline
          minDate={minDate ? dayjs(minDate).tz(timezone).toDate() : null}
          maxDate={maxDate ? dayjs(maxDate).tz(timezone).toDate() : null}
          filterDate={filterDate}
          disabled={isScheduleBlocked}
          dayClassName={getDayClassName}
          monthsShown={1}
          calendarClassName="custom-calendar"
        />
      </div>

      {blockedDates.size > 0 && (
        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-amber-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-amber-800">
            {blockedDates.size} locked date(s) cannot be modified
          </p>
        </div>
      )}

      {minDate && (
        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-blue-800">
            Event dates must be from{" "}
            {dayjs(minDate).tz(timezone).format("MMM D, YYYY")} onwards
          </p>
        </div>
      )}

      {startDate && !endDate && (
        <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-indigo-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-indigo-800">
            Select end date from{" "}
            {dayjs(startDate).tz(timezone).format("MMM D, YYYY")} onwards
          </p>
        </div>
      )}

      {isEditMode &&
        startDate &&
        endDate &&
        hasBlockedDatesInRange(startDate, endDate) && (
          <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
            <AlertCircle
              size={14}
              className="text-purple-600 mt-0.5 flex-shrink-0"
            />
            <p className="text-xs text-purple-800">
              Select dates after{" "}
              {dayjs(endDate).tz(timezone).format("MMM D, YYYY")} to extend
            </p>
          </div>
        )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleClear}
          disabled={(!startDate && !endDate) || isScheduleBlocked}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <X size={14} />
          Clear
        </button>
      </div>

      <style jsx global>{`
        .calendar-container {
          width: 100%;
        }

        .custom-calendar.react-datepicker {
          font-family: inherit;
          border: 1px solid #e5e7eb;
          width: 100% !important;
          border-radius: 12px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .custom-calendar .react-datepicker__month-container {
          width: 100% !important;
          float: none;
        }

        .custom-calendar .react-datepicker__month {
          width: 100% !important;
          margin: 0.8rem;
        }

        .custom-calendar .react-datepicker__day-names {
          display: flex;
          justify-content: space-around;
          width: 100%;
          margin-bottom: 0;
        }

        .custom-calendar .react-datepicker__week {
          display: flex;
          justify-content: space-around;
          width: 100%;
        }

        .custom-calendar .react-datepicker__day,
        .custom-calendar .react-datepicker__day-name {
          width: 2.5rem;
          height: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
        }

        .custom-calendar .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          padding-top: 12px;
        }

        .custom-calendar .react-datepicker__current-month {
          font-weight: 600;
          color: #1f2937;
          font-size: 1rem;
          margin-bottom: 8px;
        }

        .custom-calendar .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
          font-size: 0.875rem;
        }

        .custom-calendar .react-datepicker__navigation {
          top: 16px;
        }

        .custom-calendar .react-datepicker__navigation-icon::before {
          border-color: #3b82f6;
          border-width: 2px 2px 0 0;
          height: 8px;
          width: 8px;
        }

        .custom-calendar .react-datepicker__day {
          border-radius: 6px;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .custom-calendar .react-datepicker__day.blocked-date {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          text-decoration: line-through;
          cursor: not-allowed !important;
          pointer-events: none;
        }

        .custom-calendar .react-datepicker__day.blocked-date:hover {
          background-color: #fecaca !important;
        }

        .custom-calendar .react-datepicker__day.before-min-date,
        .custom-calendar .react-datepicker__day.after-max-date {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
          pointer-events: none;
        }

        .custom-calendar .react-datepicker__day--disabled {
          cursor: not-allowed !important;
          color: #d1d5db !important;
          pointer-events: none;
        }

        .custom-calendar .react-datepicker__day--in-range {
          background-color: #dbeafe !important;
          color: #1e40af !important;
          border-radius: 0 !important;
        }

        .custom-calendar .react-datepicker__day--range-start {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 6px 0 0 6px !important;
        }

        .custom-calendar .react-datepicker__day--range-end {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 0 6px 6px 0 !important;
        }

        .custom-calendar
          .react-datepicker__day--range-start.react-datepicker__day--range-end {
          border-radius: 6px !important;
        }

        .custom-calendar .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .custom-calendar
          .react-datepicker__day:hover:not(
            .react-datepicker__day--disabled
          ):not(.blocked-date):not(.before-min-date):not(.after-max-date) {
          background-color: #e0e7ff;
          border-radius: 6px;
        }

        .custom-calendar .react-datepicker__day--keyboard-selected {
          background-color: #dbeafe;
          color: #1e40af;
        }

        .custom-calendar .react-datepicker__day--today {
          font-weight: 600;
          color: #3b82f6;
        }

        .custom-calendar .react-datepicker__day--outside-month {
          color: #d1d5db;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .custom-calendar .react-datepicker__day,
          .custom-calendar .react-datepicker__day-name {
            width: 2rem;
            height: 2rem;
            line-height: 2rem;
            margin: 0.15rem;
            font-size: 0.8125rem;
          }

          .custom-calendar .react-datepicker__month {
            margin: 0.6rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
