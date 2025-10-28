import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, DatePicker } from "antd";
import { AlertCircle, X } from "lucide-react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

const { RangePicker } = DatePicker;

dayjs.extend(isBetween);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

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
    initialStartDate ? dayjs(initialStartDate).tz(timezone) : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? dayjs(initialEndDate).tz(timezone) : null
  );

  useEffect(() => {
    setStartDate(
      initialStartDate ? dayjs(initialStartDate).tz(timezone) : null
    );
    setEndDate(initialEndDate ? dayjs(initialEndDate).tz(timezone) : null);
  }, [initialStartDate, initialEndDate, timezone]);

  // OPTIMIZATION 1: Memoize timezone-converted dates
  const minDateTz = useMemo(
    () => (minDate ? dayjs(minDate).tz(timezone).startOf("day") : null),
    [minDate, timezone]
  );

  const maxDateTz = useMemo(
    () => (maxDate ? dayjs(maxDate).tz(timezone).startOf("day") : null),
    [maxDate, timezone]
  );

  const startDateTz = useMemo(
    () => (startDate ? dayjs(startDate).tz(timezone).startOf("day") : null),
    [startDate, timezone]
  );

  const endDateTz = useMemo(
    () => (endDate ? dayjs(endDate).tz(timezone).startOf("day") : null),
    [endDate, timezone]
  );

  // OPTIMIZATION 2: Convert blocked dates to a Map for O(1) lookup
  const blockedDatesMap = useMemo(() => {
    const map = new Map();
    blockedDates.forEach((dateStr) => {
      map.set(dateStr, true);
    });
    return map;
  }, [blockedDates]);

  // OPTIMIZATION 3: Memoize date check functions
  const isDateBlocked = useCallback(
    (date) => {
      if (!date) return false;
      const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
      return blockedDatesMap.has(dateStr);
    },
    [blockedDatesMap, timezone]
  );

  // OPTIMIZATION 4: Cache blocked dates in range calculation
  const hasBlockedDatesInRange = useCallback(
    (start, end) => {
      if (!start || !end) return false;
      let current = dayjs(start).tz(timezone).startOf("day");
      const endDay = dayjs(end).tz(timezone).startOf("day");

      while (current.isSameOrBefore(endDay, "day")) {
        const dateStr = current.format("YYYY-MM-DD");
        if (blockedDatesMap.has(dateStr)) {
          return true;
        }
        current = current.add(1, "day");
      }
      return false;
    },
    [blockedDatesMap, timezone]
  );

  // OPTIMIZATION 5: Memoize the disabledDate function
  const disabledDate = useCallback(
    (current) => {
      if (!current) return false;

      // Use Unix timestamp for faster comparison
      const currentTimestamp = current.valueOf();

      // Check if date is blocked using memoized map
      if (isDateBlocked(current)) return true;

      // Check min/max dates using memoized values
      if (minDateTz && currentTimestamp < minDateTz.valueOf()) {
        return true;
      }
      if (maxDateTz && currentTimestamp > maxDateTz.valueOf()) {
        return true;
      }

      // If start date is selected but not end date (during selection)
      if (startDateTz && !endDateTz) {
        // Don't allow dates before start
        if (currentTimestamp < startDateTz.valueOf()) return true;

        // Check for blocked dates in range from start to current
        if (hasBlockedDatesInRange(startDate, current)) return true;
      }

      // Edit mode: if current range has blocked dates, restrict selection
      if (
        isEditMode &&
        startDateTz &&
        endDateTz &&
        hasBlockedDatesInRange(startDate, endDate)
      ) {
        // Only allow dates after current end date
        if (currentTimestamp <= endDateTz.valueOf()) {
          return true;
        }

        // Check for blocked dates from day after end to current
        const dayAfterEnd = endDateTz.add(1, "day");
        if (
          currentTimestamp > endDateTz.valueOf() &&
          hasBlockedDatesInRange(dayAfterEnd, current)
        ) {
          return true;
        }
      }

      return false;
    },
    [
      isDateBlocked,
      minDateTz,
      maxDateTz,
      startDateTz,
      endDateTz,
      startDate,
      endDate,
      hasBlockedDatesInRange,
      isEditMode,
    ]
  );

  const onChange = useCallback(
    (dates) => {
      if (isScheduleBlocked) return;

      if (!dates || dates.length === 0) {
        setStartDate(null);
        setEndDate(null);
        if (onDateRangeChange) {
          onDateRangeChange({
            startDate: null,
            endDate: null,
            isSelecting: false,
          });
        }
        return;
      }

      const [start, end] = dates;
      setStartDate(start);
      setEndDate(end);

      if (onDateRangeChange) {
        onDateRangeChange({
          startDate: start ? start.toDate() : null,
          endDate: end ? end.toDate() : null,
          isSelecting: start && !end,
        });
      }
    },
    [isScheduleBlocked, onDateRangeChange]
  );

  // OPTIMIZATION 6: Memoize cellRender
  const cellRender = useCallback(
    (current, info) => {
      if (info.type !== "date") return current.date();

      const isBlocked = isDateBlocked(current);
      const isBeforeMin = minDateTz && current.valueOf() < minDateTz.valueOf();
      const isAfterMax = maxDateTz && current.valueOf() > maxDateTz.valueOf();

      if (isBlocked || isBeforeMin || isAfterMax) {
        return (
          <div
            className="ant-picker-cell-inner"
            style={{ position: "relative" }}
          >
            {current.date()}
            {isBlocked && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "100%",
                  height: "1px",
                  backgroundColor: "#ef4444",
                }}
              />
            )}
          </div>
        );
      }
      return current.date();
    },
    [isDateBlocked, minDateTz, maxDateTz]
  );

  const handleClear = useCallback(() => {
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
  }, [isScheduleBlocked, onDateRangeChange]);

  // OPTIMIZATION 7: Check if range has blocked dates once
  const rangeHasBlockedDates = useMemo(() => {
    if (startDate && endDate) {
      return hasBlockedDatesInRange(startDate, endDate);
    }
    return false;
  }, [startDate, endDate, hasBlockedDatesInRange]);

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
        <RangePicker
          value={startDate && endDate ? [startDate, endDate] : null}
          onChange={onChange}
          disabledDate={disabledDate}
          disabled={isScheduleBlocked}
          minDate={minDateTz}
          maxDate={maxDateTz}
          cellRender={cellRender}
          format="MMM D, YYYY"
          placeholder={["Start Date", "End Date"]}
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
            {blockedDates.size} locked date(s) cannot be modified
          </p>
        </div>
      )}

      {minDateTz && (
        <div className="mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-blue-800">
            Event dates must be from {minDateTz.format("MMM D, YYYY")} onwards
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

      {isEditMode && rangeHasBlockedDates && (
        <div className="mt-3 p-2.5 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-purple-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-purple-800">
            Select dates after{" "}
            {endDateTz ? endDateTz.format("MMM D, YYYY") : ""} to extend
          </p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleClear}
          disabled={(!startDate && !endDate) || isScheduleBlocked}
          type="default"
          className="w-full"
        >
          <X size={14} />
          Clear
        </Button>
      </div>
    </div>
  );
};

export default CalendarWidget;
