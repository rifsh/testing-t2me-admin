import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/**
 * Comprehensive date-time validation on Apply button
 */
export const DateTimeValidator = {
  /**
   * Main validation function - validates all rules
   */
  validateDateTime: ({
    selectedDate,
    selectedTime,
    timezone = "Asia/Dubai",
    minDateTime = null,
    maxDateTime = null,
    blockedDates = new Set(),
    disablePastDates = true,
    disablePastTimes = true,
  }) => {
    const errors = [];

    // Check if date and time are selected
    if (!selectedDate) {
      errors.push("Please select a date");
      return { isValid: false, errors };
    }

    if (!selectedTime) {
      errors.push("Please select a time");
      return { isValid: false, errors };
    }

    // Combine date and time
    const combined = dayjs(selectedDate)
      .tz(timezone)
      .hour(selectedTime.hour)
      .minute(selectedTime.minute)
      .second(0)
      .millisecond(0);

    const now = dayjs().tz(timezone);

    // 1. Check if date/time is in the past
    if (disablePastDates || disablePastTimes) {
      if (combined.isBefore(now)) {
        errors.push(
          `Selected date/time is in the past. Current time: ${now.format(
            "MMM D, YYYY hh:mm A"
          )}`
        );
      }
    }

    // 2. Check against minDateTime
    if (minDateTime) {
      const minDt = dayjs(minDateTime).tz(timezone);
      if (combined.isBefore(minDt)) {
        errors.push(
          `Date/time must be after ${minDt.format("MMM D, YYYY hh:mm A")}`
        );
      }
    }

    // 3. Check against maxDateTime
    if (maxDateTime) {
      const maxDt = dayjs(maxDateTime).tz(timezone);
      if (combined.isAfter(maxDt)) {
        errors.push(
          `Date/time must be before ${maxDt.format("MMM D, YYYY hh:mm A")}`
        );
      }
    }

    // 4. Check if date is blocked
    if (blockedDates && blockedDates.size > 0) {
      const dateStr = combined.format("YYYY-MM-DD");
      if (blockedDates.has(dateStr)) {
        errors.push(
          `Date ${combined.format(
            "MMM D, YYYY"
          )} is blocked due to active bookings`
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      combinedDateTime: combined.toDate(),
    };
  },

  /**
   * Check if a date is blocked (for visual indicators only)
   */
  isDateBlocked: (date, blockedDates = new Set(), timezone = "Asia/Dubai") => {
    if (!date || !blockedDates || blockedDates.size === 0) return false;
    const dateStr = dayjs(date).tz(timezone).format("YYYY-MM-DD");
    return blockedDates.has(dateStr);
  },

  /**
   * Get blocked date range
   */
  getBlockedDateRange: (blockedDates = new Set(), timezone = "Asia/Dubai") => {
    if (blockedDates.size === 0) {
      return { minBlocked: null, maxBlocked: null };
    }

    const sortedDates = Array.from(blockedDates)
      .map((dateStr) => dayjs(dateStr, "YYYY-MM-DD").tz(timezone))
      .sort((a, b) => a.valueOf() - b.valueOf());

    return {
      minBlocked: sortedDates[0].format("YYYY-MM-DD"),
      maxBlocked: sortedDates[sortedDates.length - 1].format("YYYY-MM-DD"),
    };
  },

  /**
   * Format date for API
   */
  formatDateForAPI: (date) => {
    if (!date) return null;
    return dayjs(date).format("YYYY-MM-DD");
  },

  /**
   * Format date-time for API
   */
  formatDateTimeForAPI: (dateTime) => {
    if (!dateTime) return null;
    return dayjs(dateTime).format("YYYY-MM-DDTHH:mm:ss");
  },
};

export default DateTimeValidator;
