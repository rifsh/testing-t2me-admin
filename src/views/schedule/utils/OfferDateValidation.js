import dayjs from "dayjs";
export class OfferDateValidation {
  static formatDate(date) {
    if (!date) return "";
    return dayjs(date).format("YYYY-MM-DD");
  }

  static parseDate(dateString) {
    if (!dateString) return null;
    return dayjs(dateString);
  }
  static validateDates({
    startDate,
    endDate,
    scheduleStartDate,
    scheduleEndDate,
    originalItemDates = null, // { start_date, end_date }
    isRequired = true,
    itemName = "Item",
  }) {
    // Initialize result object
    const result = {
      isValid: true,
      message: "",
      wasAdjusted: false,
      adjustedDates: null,
    };

    // Check if dates are required
    if (isRequired && (!startDate || !endDate)) {
      return {
        ...result,
        isValid: false,
        message: "Start and end dates are required",
      };
    }

    // If dates aren't required and not provided, return valid
    if (!isRequired && (!startDate || !endDate)) {
      return result;
    }

    // Convert all dates to dayjs objects
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const scheduleStart = dayjs(scheduleStartDate);
    const scheduleEnd = dayjs(scheduleEndDate);

    // Convert original item dates if provided
    const originalStart = originalItemDates?.start_date
      ? dayjs(originalItemDates.start_date)
      : null;
    const originalEnd = originalItemDates?.end_date
      ? dayjs(originalItemDates.end_date)
      : null;

    // Validate schedule dates
    if (!scheduleStartDate || !scheduleEndDate) {
      return {
        ...result,
        isValid: false,
        message: "Schedule dates are required",
      };
    }

    // Validate schedule date order
    if (scheduleEnd.isBefore(scheduleStart, "day")) {
      return {
        ...result,
        isValid: false,
        message: "Schedule end date cannot be before start date",
      };
    }

    // Validate item date order
    if (end.isBefore(start, "day")) {
      return {
        ...result,
        isValid: false,
        message: `${itemName} end date cannot be before start date`,
      };
    }

    // Check if dates are within original item dates (if provided)
    if (originalStart && originalEnd) {
      if (
        start.isBefore(originalStart, "day") ||
        end.isAfter(originalEnd, "day")
      ) {
        return {
          ...result,
          isValid: false,
          message: `Selected dates must be within original ${itemName.toLowerCase()} validity period (${originalStart.format(
            "YYYY-MM-DD"
          )} - ${originalEnd.format("YYYY-MM-DD")})`,
        };
      }
    }

    // Check if dates are completely outside schedule range
    if (
      start.isAfter(scheduleEnd, "day") ||
      end.isBefore(scheduleStart, "day")
    ) {
      return {
        ...result,
        isValid: false,
        message: `${itemName} dates must overlap with schedule dates`,
      };
    }

    // Check if dates need adjustment
    let adjustedStart = start;
    let adjustedEnd = end;
    let needsAdjustment = false;

    // Only adjust if within original item dates (if they exist)
    if (start.isBefore(scheduleStart, "day")) {
      if (!originalStart || scheduleStart.isSameOrAfter(originalStart, "day")) {
        adjustedStart = scheduleStart;
        needsAdjustment = true;
      }
    }

    if (end.isAfter(scheduleEnd, "day")) {
      if (!originalEnd || scheduleEnd.isSameOrBefore(originalEnd, "day")) {
        adjustedEnd = scheduleEnd;
        needsAdjustment = true;
      }
    }

    // If dates needed adjustment
    if (needsAdjustment) {
      return {
        isValid: true,
        message: `${itemName} dates adjusted to fit within schedule`,
        wasAdjusted: true,
        adjustedDates: {
          start_date: adjustedStart.format("YYYY-MM-DD"),
          end_date: adjustedEnd.format("YYYY-MM-DD"),
          original_start_date: start.format("YYYY-MM-DD"),
          original_end_date: end.format("YYYY-MM-DD"),
        },
      };
    }

    return {
      ...result,
      adjustedDates: {
        start_date: start.format("YYYY-MM-DD"),
        end_date: end.format("YYYY-MM-DD"),
      },
    };
  }
  static getDisabledDate(
    scheduleStartDate,
    scheduleEndDate,
    originalItemDates = null
  ) {
    return (current) => {
      if (!current) return false;

      const scheduleStart = dayjs(scheduleStartDate);
      const scheduleEnd = dayjs(scheduleEndDate);

      // Basic schedule range check
      const outsideSchedule =
        current.isBefore(scheduleStart, "day") ||
        current.isAfter(scheduleEnd, "day");

      // If we have original item dates, check those too
      if (originalItemDates?.start_date && originalItemDates?.end_date) {
        const itemStart = dayjs(originalItemDates.start_date);
        const itemEnd = dayjs(originalItemDates.end_date);

        const outsideItemDates =
          current.isBefore(itemStart, "day") || current.isAfter(itemEnd, "day");

        return outsideSchedule || outsideItemDates;
      }

      return outsideSchedule;
    };
  }
  static adjustDateToSchedule(startDate, endDate, scheduleStart, scheduleEnd) {
    // Convert inputs to dayjs objects
    let start = dayjs(startDate);
    let end = dayjs(endDate);
    const scheduleStartDate = dayjs(scheduleStart);
    const scheduleEndDate = dayjs(scheduleEnd);

    let wasAdjusted = false;
    let isValid = true;

    // If startDate is null, undefined, or invalid, assign scheduleStart
    if (!startDate || !start.isValid()) {
      start = scheduleStartDate;
      wasAdjusted = true;
    }

    // If endDate is null, undefined, or invalid, assign scheduleEnd
    if (!endDate || !end.isValid()) {
      end = scheduleEndDate;
      wasAdjusted = true;
    }

    // Check if dates are within schedule bounds
    if (
      end.isBefore(scheduleStartDate, "day") ||
      start.isAfter(scheduleEndDate, "day")
    ) {
      isValid = false;
      return {
        start_date: start.format("YYYY-MM-DD"),
        end_date: end.format("YYYY-MM-DD"),
        wasAdjusted,
        isValid,
      };
    }

    // Adjust dates if they fall outside the schedule range
    let adjustedStart = start.isBefore(scheduleStartDate, "day")
      ? scheduleStartDate
      : start;
    let adjustedEnd = end.isAfter(scheduleEndDate, "day")
      ? scheduleEndDate
      : end;

    if (!start.isSame(adjustedStart) || !end.isSame(adjustedEnd)) {
      wasAdjusted = true;
    }

    // Ensure end date is not before start date
    if (adjustedEnd.isBefore(adjustedStart, "day")) {
      adjustedEnd = adjustedStart;
      wasAdjusted = true;
    }

    return {
      start_date: adjustedStart.format("YYYY-MM-DD"),
      end_date: adjustedEnd.format("YYYY-MM-DD"),
      wasAdjusted,
      isValid,
    };
  }

  static isDateValid(scheduleStart, scheduleEnd, itemStart, itemEnd) {
    if (!scheduleStart || !scheduleEnd || !itemStart || !itemEnd) return false;

    const start = dayjs(itemStart);
    const end = dayjs(itemEnd);
    const scheduleStartDate = dayjs(scheduleStart);
    const scheduleEndDate = dayjs(scheduleEnd);

    return (
      start.isSameOrAfter(scheduleStartDate, "day") &&
      end.isSameOrBefore(scheduleEndDate, "day")
    );
  }

  static isFutureDate(date) {
    return dayjs(date).isSameOrAfter(dayjs(), "day");
  }

  static getDateValidationMessage = (
    item,
    scheduleStartDate,
    scheduleEndDate
  ) => {
    if (!item.start_date || !item.end_date) return null;

    const schedule = {
      start: new Date(scheduleStartDate).setHours(0, 0, 0, 0),
      end: new Date(scheduleEndDate).setHours(23, 59, 59, 999),
    };

    const itemDates = {
      start: new Date(item.start_date).setHours(0, 0, 0, 0),
      end: new Date(item.end_date).setHours(23, 59, 59, 999),
    };

    if (item.original_start_date || item.wasAdjusted) {
      if (!item.original_start_date) {
        return {
          type: "success",
          message: "The date has been successfully adjusted.",
        };
      }
      return {
        type: "success",
        message: `The schedule was adjusted from ${item.original_start_date} to ${item.original_end_date}.`,
      };
    }

    if (schedule.end < itemDates.start) {
      return {
        type: "error",
        message: "Schedule ends before valid period",
      };
    }
    if (schedule.start > itemDates.end) {
      return {
        type: "error",
        message: "Schedule starts after valid period",
      };
    }
    return null;
  };
}
