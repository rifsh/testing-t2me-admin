import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/**
 * Comprehensive date-time validation and formatting utilities with timezone support
 */
export const DateTimeValidator = {
  /**
   * Main validation function - validates all rules with timezone awareness
   * @param {Object} params - Validation parameters
   * @param {Date|string} params.selectedDate - The selected date
   * @param {Object} params.selectedTime - The selected time {hour, minute}
   * @param {string} params.timezone - Target timezone (e.g., "Asia/Dubai")
   * @param {Date|string} params.minDateTime - Minimum allowed datetime
   * @param {Date|string} params.maxDateTime - Maximum allowed datetime
   * @param {Set} params.blockedDates - Set of blocked date strings (YYYY-MM-DD)
   * @param {boolean} params.disablePastDates - Whether to disable past dates
   * @param {boolean} params.disablePastTimes - Whether to disable past times
   * @returns {Object} Validation result with isValid, errors, and combinedDateTime
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

    // ✅ Combine date and time IN THE SPECIFIED TIMEZONE
    const combined = dayjs(selectedDate)
      .tz(timezone)
      .hour(selectedTime.hour)
      .minute(selectedTime.minute)
      .second(0)
      .millisecond(0);

    const now = dayjs().tz(timezone);

    // 1. Check if date/time is in the past (in the target timezone)
    if (disablePastDates || disablePastTimes) {
      if (combined.isBefore(now)) {
        errors.push(
          `Selected date/time is in the past. Current time: ${now.format(
            "MMM D, YYYY hh:mm A"
          )} (${timezone})`
        );
      }
    }

    // 2. Check against minDateTime (convert to target timezone)
    if (minDateTime) {
      const minDt = dayjs(minDateTime).tz(timezone);
      if (combined.isBefore(minDt)) {
        errors.push(
          `Date/time must be after ${minDt.format("MMM D, YYYY hh:mm A")}`
        );
      }
    }

    // 3. Check against maxDateTime (convert to target timezone)
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
      combinedDateTime: combined.toDate(), // Return as JavaScript Date
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
   * Format date for API with timezone preservation
   * @param {Date|string|dayjs.Dayjs} date - The date to format
   * @param {string} timezone - Target timezone (default: UTC)
   * @returns {string} Formatted date string in "YYYY-MM-DD" format
   */
  formatDateForAPI: (date, timezone = "UTC") => {
    if (!date) return null;
    try {
      // ✅ Convert to target timezone before formatting
      return dayjs(date).tz(timezone).format("YYYY-MM-DD");
    } catch (error) {
      console.error("Error formatting date for API:", error);
      return null;
    }
  },

  /**
   * Format date-time for API with timezone preservation
   * @param {Date|string|dayjs.Dayjs} dateTime - The datetime to format
   * @param {string} timezone - Target timezone (default: UTC)
   * @returns {string} Formatted datetime string in "YYYY-MM-DDTHH:mm:ss" format
   */
  formatDateTimeForAPI: (dateTime, timezone = "UTC") => {
    if (!dateTime) return null;
    try {
      // ✅ Convert to target timezone before formatting
      return dayjs(dateTime).tz(timezone).format("YYYY-MM-DDTHH:mm:ss");
    } catch (error) {
      console.error("Error formatting datetime for API:", error);
      return null;
    }
  },

  /**
   * Format date-time for API without seconds (common format)
   * @param {Date|string|dayjs.Dayjs} dateTime - The datetime to format
   * @param {string} timezone - Target timezone (default: UTC)
   * @returns {string} Formatted datetime string in "YYYY-MM-DDTHH:mm" format
   */
  formatDateTimeForAPIShort: (dateTime, timezone = "UTC") => {
    if (!dateTime) return null;
    try {
      return dayjs(dateTime).tz(timezone).format("YYYY-MM-DDTHH:mm");
    } catch (error) {
      console.error("Error formatting datetime for API (short):", error);
      return null;
    }
  },

  /**
   * Get current time in a specific timezone
   * @param {string} timezone - Target timezone
   * @returns {dayjs.Dayjs} Current time in the specified timezone
   */
  getCurrentTimeInTimezone: (timezone = "UTC") => {
    return dayjs().tz(timezone);
  },

  /**
   * Parse API datetime string and convert to timezone
   * @param {string} dateTimeString - API datetime string
   * @param {string} timezone - Target timezone
   * @returns {Date} JavaScript Date object
   */
  parseAPIDateTime: (dateTimeString, timezone = "UTC") => {
    if (!dateTimeString) return null;
    try {
      return dayjs.tz(dateTimeString, timezone).toDate();
    } catch (error) {
      console.error("Error parsing API datetime:", error);
      return null;
    }
  },

  /**
   * Convert a date from one timezone to another
   * @param {Date|string|dayjs.Dayjs} date - The date to convert
   * @param {string} fromTimezone - Source timezone
   * @param {string} toTimezone - Target timezone
   * @returns {dayjs.Dayjs} Converted date
   */
  convertTimezone: (date, fromTimezone, toTimezone) => {
    if (!date) return null;
    try {
      return dayjs.tz(date, fromTimezone).tz(toTimezone);
    } catch (error) {
      console.error("Error converting timezone:", error);
      return null;
    }
  },

  /**
   * Format datetime for display with timezone
   * @param {Date|string|dayjs.Dayjs} date - Date to format
   * @param {string} timezone - Timezone to use
   * @param {string} format - Display format (default: "MMM D, YYYY • hh:mm A")
   * @returns {string} Formatted datetime string
   */
  formatDateTimeForDisplay: (
    date,
    timezone = "UTC",
    format = "MMM D, YYYY • hh:mm A"
  ) => {
    if (!date) return "";
    try {
      return dayjs(date).tz(timezone).format(format);
    } catch (error) {
      console.error("Error formatting datetime for display:", error);
      return "";
    }
  },

  /**
   * Check if a datetime is in the past for a specific timezone
   * @param {Date|string|dayjs.Dayjs} date - Date to validate
   * @param {string} timezone - Timezone to use for comparison
   * @returns {boolean} True if date is in the past
   */
  isDateInPast: (date, timezone = "UTC") => {
    if (!date) return false;
    try {
      const dt = dayjs(date).tz(timezone);
      const now = dayjs().tz(timezone);
      return dt.isBefore(now);
    } catch (error) {
      console.error("Error checking if date is in past:", error);
      return false;
    }
  },

  /**
   * Round time to nearest interval
   * @param {number} minutes - Current minutes
   * @param {number} interval - Rounding interval (e.g., 15)
   * @returns {number} Rounded minutes
   */
  roundToNearestInterval: (minutes, interval = 15) => {
    return Math.round(minutes / interval) * interval;
  },

  /**
   * Get rounded current time in timezone
   * @param {number} interval - Rounding interval in minutes
   * @param {string} timezone - Target timezone
   * @returns {dayjs.Dayjs} Rounded current time
   */
  getCurrentTimeRounded: (interval = 15, timezone = "UTC") => {
    const now = dayjs().tz(timezone);
    const roundedMinutes = DateTimeValidator.roundToNearestInterval(
      now.minute(),
      interval
    );
    return now.minute(roundedMinutes).second(0).millisecond(0);
  },
};

// Export individual functions for convenience
export const {
  validateDateTime,
  isDateBlocked,
  getBlockedDateRange,
  formatDateForAPI,
  formatDateTimeForAPI,
  formatDateTimeForAPIShort,
  getCurrentTimeInTimezone,
  parseAPIDateTime,
  convertTimezone,
  formatDateTimeForDisplay,
  isDateInPast,
  getCurrentTimeRounded,
} = DateTimeValidator;

export default DateTimeValidator;