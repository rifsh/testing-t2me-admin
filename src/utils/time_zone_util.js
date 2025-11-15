import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const createDateTimeValidation = ({
  compareToField,
  compareType = "before",
  timezone = dayjs.tz.guess(),
  allowPast = false,
  customMessage,
  includeTime = true,
}) => {
  return {
    validator: async (_, value) => {
      if (!value) return Promise.resolve();

      const dateInTimezone = dayjs.isDayjs(value)
        ? value.tz(timezone)
        : dayjs(value).tz(timezone);

      const nowInTimezone = dayjs().tz(timezone);

      // Past date validation
      if (
        !allowPast &&
        dateInTimezone.isBefore(nowInTimezone, includeTime ? "minute" : "day")
      ) {
        return Promise.reject(new Error("Cannot select a past date"));
      }

      if (compareToField) {
        const form = _.field?.form;
        if (!form) return Promise.resolve();

        const compareValue = form.getFieldValue(compareToField);
        if (!compareValue) return Promise.resolve();

        const compareDate = compareValue.tz(timezone);

        // For date-only comparisons, set time to start of day
        const dateToCompare = includeTime
          ? dateInTimezone
          : dateInTimezone.startOf("day");
        const compareDateTime = includeTime
          ? compareDate
          : compareDate.startOf("day");

        const comparisonMap = {
          before: {
            condition: dateToCompare.isBefore(compareDateTime),
            defaultMessage: `Must be before ${compareToField}`,
          },
          after: {
            condition: dateToCompare.isAfter(compareDateTime),
            defaultMessage: `Must be after ${compareToField}`,
          },
          same_or_before: {
            condition: dateToCompare.isSameOrBefore(compareDateTime),
            defaultMessage: `Must be same as or before ${compareToField}`,
          },
          same_or_after: {
            condition: dateToCompare.isSameOrAfter(compareDateTime),
            defaultMessage: `Must be same as or after ${compareToField}`,
          },
        };

        const comparison = comparisonMap[compareType];
        if (!comparison.condition) {
          return Promise.reject(
            new Error(customMessage || comparison.defaultMessage)
          );
        }
      }

      return Promise.resolve();
    },
  };
};

export const createDateTimePickerProps = ({
  timezone = dayjs.tz.guess(),
  allowPast = false,
  includeTime = true,
  depend_timesOn,
  form,
  additionalProps = {},
}) => {
  return {
    showTime: includeTime ? { format: "HH:mm" } : false,
    format: includeTime ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD",
    style: { width: "100%" },
    disabledDate: (current) => {
      if (!allowPast && current) {
        const now = dayjs().tz(timezone);
        const currentInTz = current.tz(timezone);

        // Check against the dependent field if specified
        if (depend_timesOn && form) {
          const dependentValue = form.getFieldValue(depend_timesOn);
          if (dependentValue) {
            const dependentDate = dayjs(dependentValue).tz(timezone);
            return (
              currentInTz
                .startOf("day")
                .isBefore(dependentDate.startOf("day")) ||
              currentInTz.startOf("day").isBefore(now.startOf("day"))
            );
          }
        }

        return currentInTz.startOf("day").isBefore(now.startOf("day"));
      }
      return false;
    },
    disabledTime: includeTime
      ? (current) => {
          if (!allowPast && current) {
            const now = dayjs().tz(timezone);
            const currentInTz = current.tz(timezone);

            if (currentInTz.format("YYYY-MM-DD") === now.format("YYYY-MM-DD")) {
              return {
                disabledHours: () => {
                  const hours = [];
                  for (let i = 0; i < now.hour(); i++) {
                    hours.push(i);
                  }
                  return hours;
                },
                disabledMinutes: (selectedHour) => {
                  if (selectedHour === now.hour()) {
                    const minutes = [];
                    for (let i = 0; i < now.minute(); i++) {
                      minutes.push(i);
                    }
                    return minutes;
                  }
                  return [];
                },
              };
            }
          }
          return {};
        }
      : undefined,
    ...additionalProps,
  };
};

export const getCurrentTimeByTimezone = (timezone) => {
  try {
    // Get current time in the specified timezone
    const currentTime = new Date().toLocaleString("en-US", { timeZone: timezone });
    return new Date(currentTime); // Convert to Date object
  } catch (error) {
    console.error("Invalid timezone:", timezone, error);
    return null; // Return null if timezone is invalid
  }
};

// ✅ NEW: Timezone abbreviations mapping
export const TIMEZONE_ABBREVIATIONS = {
  "Asia/Dubai": "GST",
  "Asia/Kolkata": "IST",
  "Asia/Riyadh": "AST",
  "Asia/Kuwait": "AST",
  "Asia/Bahrain": "AST",
  "Asia/Qatar": "AST",
  "Asia/Muscat": "GST",
  "America/New_York": "EST/EDT",
  "America/Chicago": "CST/CDT",
  "America/Denver": "MST/MDT",
  "America/Los_Angeles": "PST/PDT",
  "Europe/London": "GMT/BST",
  "Europe/Paris": "CET/CEST",
  "Europe/Berlin": "CET/CEST",
  "Asia/Tokyo": "JST",
  "Asia/Shanghai": "CST",
  "Asia/Singapore": "SGT",
  "Australia/Sydney": "AEDT/AEST",
  UTC: "UTC",
};

/**
 * Get timezone abbreviation
 * @param {string} tz - Timezone identifier (e.g., "Asia/Dubai")
 * @returns {string} Timezone abbreviation (e.g., "GST")
 */
export const getTimezoneAbbr = (tz) => {
  return TIMEZONE_ABBREVIATIONS[tz] || dayjs().tz(tz).format("z");
};

/**
 * Format datetime with timezone abbreviation
 * @param {string|Date} dateTimeStr - DateTime to format
 * @param {string} timezone - Target timezone
 * @param {string} format - Date format (default: "MMMM D, YYYY h:mm A")
 * @returns {string} Formatted datetime with timezone
 */
export const formatDateTimeWithTimezone = (
  dateTimeStr,
  timezone = "UTC",
  format = "MMMM D, YYYY h:mm A"
) => {
  if (!dateTimeStr) return "-";
  const abbr = getTimezoneAbbr(timezone);
  return `${dayjs(dateTimeStr).tz(timezone).format(format)} ${abbr}`;
};

/**
 * Format date in timezone
 * @param {string|Date} dateStr - Date to format
 * @param {string} timezone - Target timezone
 * @param {string} format - Date format (default: "MMMM D, YYYY")
 * @returns {string} Formatted date
 */
export const formatDateInTimezone = (
  dateStr,
  timezone = "UTC",
  format = "MMMM D, YYYY"
) => {
  if (!dateStr) return "-";
  return dayjs(dateStr).tz(timezone).format(format);
};

/**
 * Format time in timezone
 * @param {string} timeStr - Time string (HH:mm format)
 * @param {string} timezone - Target timezone
 * @param {string} format - Time format (default: "h:mm A")
 * @returns {string} Formatted time
 */
export const formatTimeInTimezone = (
  timeStr,
  timezone = "UTC",
  format = "h:mm A"
) => {
  if (!timeStr) return "-";
  return dayjs(`2000-01-01T${timeStr}`).tz(timezone).format(format);
};

/**
 * Format time with timezone abbreviation
 * @param {string} timeStr - Time string (HH:mm format)
 * @param {string} timezone - Target timezone
 * @param {string} format - Time format (default: "h:mm A")
 * @returns {string} Formatted time with timezone
 */
export const formatTimeWithTimezone = (
  timeStr,
  timezone = "UTC",
  format = "h:mm A"
) => {
  if (!timeStr) return "-";
  const abbr = getTimezoneAbbr(timezone);
  return `${dayjs(`2000-01-01T${timeStr}`).tz(timezone).format(format)} ${abbr}`;
};