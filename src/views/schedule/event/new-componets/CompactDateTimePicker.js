import React, { useState, useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangeCalendar } from "@mui/x-date-pickers-pro/DateRangeCalendar";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { styled } from "@mui/material/styles";

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);

// Styled components for custom day rendering
const StyledPickersDay = styled(PickersDay)(({ theme }) => ({
  "&.blocked-date": {
    backgroundColor: "#fee2e2 !important",
    color: "#ef4444 !important",
    textDecoration: "line-through",
    cursor: "not-allowed !important",
    "&:hover": {
      backgroundColor: "#fecaca !important",
    },
  },
  "&.before-min-date, &.after-max-date": {
    backgroundColor: "#f3f4f6 !important",
    color: "#9ca3af !important",
    cursor: "not-allowed !important",
    "&:hover": {
      backgroundColor: "#e5e7eb !important",
    },
  },
}));

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
  const [value, setValue] = useState([
    initialStartDate ? dayjs(initialStartDate).tz(timezone) : null,
    initialEndDate ? dayjs(initialEndDate).tz(timezone) : null,
  ]);

  useEffect(() => {
    setValue([
      initialStartDate ? dayjs(initialStartDate).tz(timezone) : null,
      initialEndDate ? dayjs(initialEndDate).tz(timezone) : null,
    ]);
  }, [initialStartDate, initialEndDate, timezone]);

  const isDateBlocked = (date) => {
    if (!date) return false;
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  };

  const isBeforeMinDate = (date) => {
    if (!minDate || !date) return false;
    return dayjs(date).tz(timezone).isBefore(dayjs(minDate).tz(timezone), "day");
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

  const shouldDisableDate = (date) => {
    const dayjsDate = dayjs(date);

    if (isDateBlocked(dayjsDate)) return true;
    if (isBeforeMinDate(dayjsDate)) return true;
    if (isAfterMaxDate(dayjsDate)) return true;

    // Check if selecting and there are blocked dates in between
    const [startDate, endDate] = value;
    
    if (startDate && !endDate) {
      const dateInTz = dayjs(date).tz(timezone);
      const startInTz = dayjs(startDate).tz(timezone);
      
      if (dateInTz.isBefore(startInTz, "day")) return true;
      if (hasBlockedDatesInRange(startDate.toDate(), date)) return true;
    }

    if (
      isEditMode &&
      startDate &&
      endDate &&
      hasBlockedDatesInRange(startDate.toDate(), endDate.toDate())
    ) {
      const dateInTz = dayjs(date).tz(timezone);
      const endInTz = dayjs(endDate).tz(timezone);

      if (dateInTz.isSameOrBefore(endInTz, "day")) {
        return true;
      }

      const dayAfterEnd = endInTz.add(1, "day");
      if (hasBlockedDatesInRange(dayAfterEnd.toDate(), date)) {
        return true;
      }
    }

    return false;
  };

  const renderDay = (day, selectedDays, pickersDayProps) => {
    const dayjsDay = dayjs(day);
    let className = "";

    if (isDateBlocked(dayjsDay)) {
      className = "blocked-date";
    } else if (isBeforeMinDate(dayjsDay)) {
      className = "before-min-date";
    } else if (isAfterMaxDate(dayjsDay)) {
      className = "after-max-date";
    }

    return (
      <StyledPickersDay
        {...pickersDayProps}
        day={day}
        className={className}
      />
    );
  };

  const handleChange = (newValue) => {
    if (isScheduleBlocked) return;

    const [start, end] = newValue;
    setValue(newValue);

    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: start ? start.toDate() : null,
        endDate: end ? end.toDate() : null,
        isSelecting: start && !end,
      });
    }
  };

  const handleClear = () => {
    if (isScheduleBlocked) return;
    
    setValue([null, null]);
    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: null,
        endDate: null,
        isSelecting: false,
      });
    }
  };

  const [startDate, endDate] = value;

  return (
    <div className="w-full">
      {isScheduleBlocked && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-900">Schedule Locked</p>
            <p className="text-xs text-red-700">Date changes not allowed</p>
          </div>
        </div>
      )}

      <div className="w-full overflow-hidden">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DateRangeCalendar
            value={value}
            onChange={handleChange}
            disabled={isScheduleBlocked}
            disablePast={false}
            minDate={minDate ? dayjs(minDate).tz(timezone) : undefined}
            maxDate={maxDate ? dayjs(maxDate).tz(timezone) : undefined}
            shouldDisableDate={shouldDisableDate}
            slots={{
              day: renderDay,
            }}
            calendars={1}
            sx={{
              width: "100%",
              maxWidth: "100%",
              "& .MuiDateRangePickerDay-root": {
                width: "100%",
              },
              "& .MuiPickersCalendarHeader-root": {
                paddingLeft: 1,
                paddingRight: 1,
              },
              "& .MuiDayCalendar-header": {
                justifyContent: "space-around",
              },
              "& .MuiDayCalendar-weekContainer": {
                justifyContent: "space-around",
              },
              "& .MuiPickersDay-root": {
                fontSize: "0.875rem",
                margin: "2px",
              },
              "& .MuiPickersDay-root:hover": {
                backgroundColor: "#e0e7ff",
              },
              "& .Mui-selected": {
                backgroundColor: "#3b82f6 !important",
                color: "white !important",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#2563eb !important",
                },
              },
              "& .MuiDateRangePickerDay-rangeIntervalDayHighlight": {
                backgroundColor: "#dbeafe !important",
                color: "#1e40af !important",
              },
              "& .MuiDateRangePickerDay-rangeIntervalDayHighlightStart, & .MuiDateRangePickerDay-rangeIntervalDayHighlightEnd":
                {
                  backgroundColor: "#3b82f6 !important",
                  color: "white !important",
                },
            }}
          />
        </LocalizationProvider>
      </div>

      {blockedDates.size > 0 && (
        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-800">
            {blockedDates.size} locked date(s) cannot be modified
          </p>
        </div>
      )}

      {minDate && (
        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-800">
            Event dates must be from {dayjs(minDate).tz(timezone).format("MMM D, YYYY")} onwards
          </p>
        </div>
      )}

      {startDate && !endDate && (
        <div className="mt-3 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2">
          <AlertCircle size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-indigo-800">
            Select end date from {dayjs(startDate).tz(timezone).format("MMM D, YYYY")} onwards
          </p>
        </div>
      )}

      {isEditMode &&
        startDate &&
        endDate &&
        hasBlockedDatesInRange(startDate.toDate(), endDate.toDate()) && (
          <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
            <AlertCircle size={14} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-purple-800">
              Select dates after {dayjs(endDate).tz(timezone).format("MMM D, YYYY")} to extend
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
    </div>
  );
};

export default CalendarWidget;