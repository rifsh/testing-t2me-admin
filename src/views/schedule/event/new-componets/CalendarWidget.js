import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar as CalendarIcon, AlertCircle, X } from "lucide-react";
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
    if (initialStartDate) {
      setStartDate(dayjs(initialStartDate).tz(timezone).toDate());
    }
    if (initialEndDate) {
      setEndDate(dayjs(initialEndDate).tz(timezone).toDate());
    }
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

      <div className="w-full">
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
          calendarClassName="full-width-calendar"
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
          <CalendarIcon
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
        .full-width-calendar.react-datepicker {
          font-family: inherit;
          border: 1px solid #e5e7eb;
          width: 100% !important;
          border-radius: 12px;
        }

        .full-width-calendar .react-datepicker__month-container {
          width: 100% !important;
        }

        .full-width-calendar .react-datepicker__month {
          width: 100% !important;
          margin: 0.8rem;
        }

        .full-width-calendar .react-datepicker__week {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .full-width-calendar .react-datepicker__day,
        .full-width-calendar .react-datepicker__day-name {
          width: 2.5rem;
          height: 2.5rem;
          line-height: 2.5rem;
          margin: 0.2rem;
          flex: 1;
        }

        .react-datepicker__header {
          background-color: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
          border-radius: 12px 12px 0 0;
          padding-top: 12px;
        }

        .react-datepicker__day.blocked-date {
          background-color: #fee2e2 !important;
          color: #ef4444 !important;
          text-decoration: line-through;
          cursor: not-allowed !important;
        }

        .react-datepicker__day.before-min-date,
        .react-datepicker__day.after-max-date {
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
        }

        .react-datepicker__day--in-range {
          background-color: #dbeafe !important;
          color: #1e40af !important;
          border-radius: 0 !important;
        }

        .react-datepicker__day--range-start,
        .react-datepicker__day--range-end {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 6px !important;
        }

        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
        }

        .react-datepicker__day:hover:not(.react-datepicker__day--disabled) {
          background-color: #e0e7ff;
          border-radius: 6px;
        }

        .react-datepicker__current-month {
          font-weight: 600;
          color: #1f2937;
          font-size: 1rem;
        }

        .react-datepicker__day-name {
          color: #6b7280;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default CalendarWidget;
  