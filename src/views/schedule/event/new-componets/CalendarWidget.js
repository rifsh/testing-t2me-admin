import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Button, DatePicker, message, Modal } from "antd";
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
  timezone: userTimezone = "Asia/Dubai",
}) => {
  const [startDate, setStartDate] = useState(
    initialStartDate ? dayjs(initialStartDate).tz(userTimezone) : null
  );
  const [endDate, setEndDate] = useState(
    initialEndDate ? dayjs(initialEndDate).tz(userTimezone) : null
  );

  // ✅ FIX: Track pending changes and modal state
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);
  const previousDatesRef = useRef({ startDate, endDate });

  useEffect(() => {
    setStartDate(
      initialStartDate ? dayjs(initialStartDate).tz(userTimezone) : null
    );
    setEndDate(initialEndDate ? dayjs(initialEndDate).tz(userTimezone) : null);
  }, [initialStartDate, initialEndDate, userTimezone]);

  // ✅ FIX: Get min and max blocked dates properly
  const blockedDateRange = useMemo(() => {
    if (!blockedDates || blockedDates.size === 0) {
      return { minBlocked: null, maxBlocked: null, blockedArray: [] };
    }

    // Parse dates and sort them
    const sortedDates = Array.from(blockedDates)
      .map((dateStr) => ({
        str: dateStr,
        dayObj: dayjs(dateStr, "YYYY-MM-DD").tz(userTimezone),
      }))
      .sort((a, b) => a.dayObj.valueOf() - b.dayObj.valueOf());

    return {
      minBlocked: sortedDates[0]?.str,
      maxBlocked: sortedDates[sortedDates.length - 1]?.str,
      blockedArray: sortedDates.map((d) => d.dayObj),
    };
  }, [blockedDates, userTimezone]);

  // OPTIMIZATION 1: Memoize timezone-converted dates
  const minDateTz = useMemo(
    () => (minDate ? dayjs(minDate).tz(userTimezone).startOf("day") : null),
    [minDate, userTimezone]
  );

  const maxDateTz = useMemo(
    () => (maxDate ? dayjs(maxDate).tz(userTimezone).startOf("day") : null),
    [maxDate, userTimezone]
  );

  const startDateTz = useMemo(
    () => (startDate ? dayjs(startDate).tz(userTimezone).startOf("day") : null),
    [startDate, userTimezone]
  );

  const endDateTz = useMemo(
    () => (endDate ? dayjs(endDate).tz(userTimezone).startOf("day") : null),
    [endDate, userTimezone]
  );

  // OPTIMIZATION 2: Convert blocked dates to a Map for O(1) lookup
  const blockedDatesMap = useMemo(() => {
    const map = new Map();
    if (blockedDates) {
      blockedDates.forEach((dateStr) => {
        map.set(dateStr, true);
      });
    }
    return map;
  }, [blockedDates]);

  // OPTIMIZATION 3: Memoize date check functions
  const isDateBlocked = useCallback(
    (date) => {
      if (!date) return false;
      const dateStr = dayjs(date).tz(userTimezone).format("YYYY-MM-DD");
      return blockedDatesMap.has(dateStr);
    },
    [blockedDatesMap, userTimezone]
  );

  // ✅ FIX: Validate that range includes ALL blocked dates
  const validateRangeIncludesAllBlockedDates = useCallback(
    (start, end) => {
      if (!isEditMode || blockedDates.size === 0) {
        return { isValid: true, excludedDates: [] };
      }

      const startDay = dayjs(start).tz(userTimezone).startOf("day");
      const endDay = dayjs(end).tz(userTimezone).startOf("day");

      const excludedDates = [];

      // Check each blocked date
      blockedDates.forEach((blockedDateStr) => {
        const blockedDay = dayjs(blockedDateStr, "YYYY-MM-DD")
          .tz(userTimezone)
          .startOf("day");

        // If blocked date is outside the new range, it's excluded
        if (
          blockedDay.isBefore(startDay, "day") ||
          blockedDay.isAfter(endDay, "day")
        ) {
          excludedDates.push(blockedDateStr);
        }
      });

      return {
        isValid: excludedDates.length === 0,
        excludedDates,
      };
    },
    [isEditMode, blockedDates, userTimezone]
  );

  // ✅ FIX: Smarter date disabling logic
  const disabledDate = useCallback(
    (current) => {
      if (!current) return false;

      const currentDate = dayjs(current).tz(userTimezone).startOf("day");

      // Block dates before minDate
      if (minDateTz && currentDate.isBefore(minDateTz, "day")) {
        return true;
      }

      // Block dates after maxDate
      if (maxDateTz && currentDate.isAfter(maxDateTz, "day")) {
        return true;
      }

      return false;
    },
    [minDateTz, maxDateTz, userTimezone]
  );

  /// ✅ FIX: Handle onChange with modal confirmation for blocked dates
  const onChange = useCallback(
    (dates) => {
      if (isScheduleBlocked) {
        message.error("Schedule is locked. Cannot modify dates.");
        return;
      }

      if (!dates || dates.length === 0) {
        // ✅ FIX: In edit mode with blocked dates, prevent clearing
        if (isEditMode && blockedDates.size > 0) {
          message.error(
            "Cannot clear dates. There are active bookings that must be preserved."
          );
          return;
        }

        setStartDate(null);
        setEndDate(null);
        previousDatesRef.current = { startDate: null, endDate: null };

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

      // ✅ CRITICAL: Block selection immediately if it excludes blocked dates
      if (isEditMode && blockedDates.size > 0 && start && end) {
        const validation = validateRangeIncludesAllBlockedDates(start, end);

        if (!validation.isValid) {
          // ✅ PREVENT any state changes - show modal instead
          const excludedList = validation.excludedDates.join(", ");

          Modal.error({
            title: (
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "20px" }}>❌</span>
                <span>Invalid Date Selection</span>
              </div>
            ),
            content: (
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#fef2f2",
                    border: "2px solid #fca5a5",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#991b1b",
                      marginBottom: "8px",
                    }}
                  >
                    ⚠️ The following booked dates would be EXCLUDED:
                  </p>
                  <p
                    style={{
                      color: "#dc2626",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {excludedList}
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#dbeafe",
                    border: "2px solid #93c5fd",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#1e3a8a",
                      marginBottom: "8px",
                    }}
                  >
                    ✓ Your selection MUST include ALL booking dates:
                  </p>
                  <p
                    style={{
                      color: "#0891b2",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    From: {blockedDateRange.minBlocked}
                    <br />
                    To: {blockedDateRange.maxBlocked}
                  </p>
                </div>

                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f0fdf4",
                    border: "2px solid #86efac",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{
                      fontWeight: "bold",
                      color: "#166534",
                      marginBottom: "8px",
                    }}
                  >
                    📋 Allowed selections:
                  </p>
                  <ul
                    style={{
                      color: "#15803d",
                      fontSize: "13px",
                      margin: 0,
                      paddingLeft: "20px",
                    }}
                  >
                    <li>
                      Start date ON or BEFORE {blockedDateRange.minBlocked}
                    </li>
                    <li>End date ON or AFTER {blockedDateRange.maxBlocked}</li>
                    <li>You can extend dates, but cannot exclude bookings</li>
                  </ul>
                </div>
              </div>
            ),
            okText: "I Understand",
            centered: true,
            width: 520,
            maskClosable: false,
          });

          // ✅ CRITICAL: Do NOT update any state or call parent
          return; // Stop execution completely
        }
      }

      // ✅ FIX: If edit mode with blocked dates and dates will be reset, show modal
      if (
        isEditMode &&
        blockedDates.size > 0 &&
        start &&
        end &&
        previousDatesRef.current.startDate &&
        previousDatesRef.current.endDate
      ) {
        // Save previous dates in case user cancels
        previousDatesRef.current = {
          startDate: previousDatesRef.current.startDate,
          endDate: previousDatesRef.current.endDate,
        };

        // Show modal asking about time slots
        setPendingDateChange({ type: "dateRange", range: dates });
        setShowResetConfirmModal(true);
        return;
      }

      // Update state and notify parent
      setStartDate(start);
      setEndDate(end);
      previousDatesRef.current = { startDate: start, endDate: end };

      if (onDateRangeChange) {
        onDateRangeChange({
          startDate: start ? start.toDate() : null,
          endDate: end ? end.toDate() : null,
          isSelecting: start && !end,
        });
      }
    },
    [
      isScheduleBlocked,
      isEditMode,
      blockedDates,
      blockedDateRange,
      validateRangeIncludesAllBlockedDates,
      onDateRangeChange,
    ]
  );

  // ✅ FIX: Handle modal confirmation
  const handleModalOk = useCallback(() => {
    if (pendingDateChange?.type === "dateRange") {
      const [start, end] = pendingDateChange.range;
      setStartDate(start);
      setEndDate(end);
      previousDatesRef.current = { startDate: start, endDate: end };

      if (onDateRangeChange) {
        onDateRangeChange({
          startDate: start ? start.toDate() : null,
          endDate: end ? end.toDate() : null,
          isSelecting: false,
        });
      }

      message.success(
        `✓ Date range updated. Bookings preserved from ${blockedDateRange.minBlocked} to ${blockedDateRange.maxBlocked}`
      );
    }

    setShowResetConfirmModal(false);
    setPendingDateChange(null);
  }, [pendingDateChange, onDateRangeChange, blockedDateRange]);

  // ✅ FIX: Handle modal cancel - revert to previous dates
  const handleModalCancel = useCallback(() => {
    // Revert to previous dates - this prevents the field from changing
    setStartDate(previousDatesRef.current.startDate);
    setEndDate(previousDatesRef.current.endDate);

    setShowResetConfirmModal(false);
    setPendingDateChange(null);

    message.info("Date change cancelled. Previous dates restored.");
  }, []);

  // OPTIMIZATION 6: Memoize cellRender with blocked date highlighting
  const cellRender = useCallback(
    (current, info) => {
      if (info.type !== "date") return current.date();

      const isBlocked = isDateBlocked(current);
      const isBeforeMin = minDateTz && current.isBefore(minDateTz, "day");
      const isAfterMax = maxDateTz && current.isAfter(maxDateTz, "day");

      if (isBlocked) {
        return (
          <div
            className="ant-picker-cell-inner"
            style={{
              position: "relative",
              backgroundColor: "#fee2e2",
              fontWeight: "bold",
              color: "#991b1b",
              borderRadius: "4px",
            }}
            title="Booking date - must be included"
          >
            {current.date()}
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "4px",
                height: "4px",
                backgroundColor: "#dc2626",
                borderRadius: "50%",
              }}
            />
          </div>
        );
      }

      if (isBeforeMin || isAfterMax) {
        return (
          <div
            className="ant-picker-cell-inner"
            style={{
              opacity: 0.4,
              textDecoration: "line-through",
            }}
          >
            {current.date()}
          </div>
        );
      }

      return current.date();
    },
    [isDateBlocked, minDateTz, maxDateTz]
  );

  // ✅ FIX: Smart clear button logic
  const handleClear = useCallback(() => {
    if (isScheduleBlocked) {
      message.error("Schedule is locked. Cannot modify dates.");
      return;
    }

    // ✅ FIX: In edit mode with blocked dates, absolutely prevent clearing
    if (isEditMode && blockedDates.size > 0) {
      message.error(
        `Cannot clear dates! There are active bookings from ${blockedDateRange.minBlocked} to ${blockedDateRange.maxBlocked}.\n\nYou can only modify the date range while keeping these bookings included.`
      );
      return;
    }

    setStartDate(null);
    setEndDate(null);
    previousDatesRef.current = { startDate: null, endDate: null };

    message.info("Event dates cleared.");

    if (onDateRangeChange) {
      onDateRangeChange({
        startDate: null,
        endDate: null,
        isSelecting: false,
      });
    }
  }, [
    isScheduleBlocked,
    isEditMode,
    blockedDates,
    blockedDateRange,
    onDateRangeChange,
  ]);

  // ✅ FIX: Clear button should be disabled in edit mode with blocked dates
  const isClearButtonDisabled = useMemo(() => {
    // Always disabled if schedule is locked
    if (isScheduleBlocked) return true;

    // ✅ CRITICAL FIX: Disable in edit mode if there are ANY blocked dates
    if (isEditMode && blockedDates && blockedDates.size > 0) {
      return true;
    }

    // Disable if no dates selected
    if (!startDate && !endDate) return true;

    return false;
  }, [isScheduleBlocked, isEditMode, blockedDates, startDate, endDate]);

  return (
    <div className="w-full space-y-3">
      {isScheduleBlocked && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
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
          allowClear={false}
        />
      </div>

      {blockedDates && blockedDates.size > 0 && (
        <div className="p-3 bg-red-50 border border-red-300 rounded-lg flex items-start gap-2">
          <AlertCircle
            size={16}
            className="text-red-700 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-bold text-red-900">
              ⚠️ Active Bookings ({blockedDates.size} dates)
            </p>
            <p className="text-xs text-red-800 mt-1 font-semibold">
              Booking dates: {blockedDateRange.minBlocked} to{" "}
              {blockedDateRange.maxBlocked}
            </p>
            {isEditMode && (
              <p className="text-xs text-red-800 mt-2 bg-red-100 p-1.5 rounded">
                🔒 <strong>In edit mode:</strong> Your new date range MUST
                include all booking dates. You cannot exclude any booked dates.
              </p>
            )}
          </div>
        </div>
      )}

      {minDateTz && (
        <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
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
        <div className="p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-2">
          <AlertCircle
            size={14}
            className="text-indigo-600 mt-0.5 flex-shrink-0"
          />
          <p className="text-xs text-indigo-800">
            Select end date from{" "}
            {dayjs(startDate).tz(userTimezone).format("MMM D, YYYY")} onwards
            {blockedDates.size > 0 && (
              <span className="block mt-1 font-semibold">
                ✓ Must include booking dates: {blockedDateRange.minBlocked} to{" "}
                {blockedDateRange.maxBlocked}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ✅ FIX: Updated Modal for blocked dates */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-600" />
            <span>Confirm Date Range Change</span>
          </div>
        }
        open={showResetConfirmModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Confirm & Update"
        cancelText="Cancel (Keep Previous Dates)"
        width={500}
        maskClosable={false}
      >
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ℹ️ Active Bookings Detected
            </p>
            <p className="text-xs text-blue-800">
              Your schedule has active bookings from{" "}
              <strong>{blockedDateRange.minBlocked}</strong> to{" "}
              <strong>{blockedDateRange.maxBlocked}</strong>.
            </p>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
            <p className="text-sm font-semibold text-amber-900 mb-2">
              ⚠️ Time Slots Cannot Be Reset
            </p>
            <p className="text-xs text-amber-800">
              Since you have confirmed bookings on these dates, all booked time
              slots will be preserved. You can only extend the date range to
              include additional dates.
            </p>
          </div>

          <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">
              ✓ What happens next:
            </p>
            <ul className="text-xs text-green-800 space-y-1">
              <li>• All booked time slots remain protected</li>
              <li>• New dates can be added before or after bookings</li>
              <li>• Existing bookings will not be affected</li>
            </ul>
          </div>

          <div className="p-3 bg-red-50 border border-red-300 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-1">
              ❌ Cannot Do:
            </p>
            <p className="text-xs text-red-800">
              Exclude booking dates or reset time slots
            </p>
          </div>
        </div>
      </Modal>

      <div className="mt-4 flex gap-2">
        <Button
          onClick={handleClear}
          disabled={isClearButtonDisabled}
          type="default"
          danger={isClearButtonDisabled && isEditMode && blockedDates.size > 0}
          className="w-full"
          title={
            isClearButtonDisabled && isEditMode && blockedDates.size > 0
              ? `Cannot clear - Active bookings from ${blockedDateRange.minBlocked} to ${blockedDateRange.maxBlocked}`
              : ""
          }
        >
          <X size={14} />
          {isClearButtonDisabled && isEditMode && blockedDates.size > 0
            ? "Locked (Has Bookings)"
            : "Clear"}
        </Button>
      </div>
    </div>
  );
};

export default CalendarWidget;
