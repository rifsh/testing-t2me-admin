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
    originalItemDates = null,
    isRequired = true,
    itemName = "Item",
  }) {
    const result = {
      isValid: true,
      message: "",
      wasAdjusted: false,
      adjustedDates: null,
    };

    if (isRequired && (!startDate || !endDate)) {
      return {
        ...result,
        isValid: false,
        message: "Start and end dates are required",
      };
    }

    if (!isRequired && (!startDate || !endDate)) {
      return result;
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const scheduleStart = dayjs(scheduleStartDate);
    const scheduleEnd = dayjs(scheduleEndDate);

    const originalStart = originalItemDates?.start_date
      ? dayjs(originalItemDates.start_date)
      : null;
    const originalEnd = originalItemDates?.end_date
      ? dayjs(originalItemDates.end_date)
      : null;

    if (!scheduleStartDate || !scheduleEndDate) {
      return {
        ...result,
        isValid: false,
        message: "Schedule dates are required",
      };
    }

    if (scheduleEnd.isBefore(scheduleStart, "day")) {
      return {
        ...result,
        isValid: false,
        message: "Schedule end date cannot be before start date",
      };
    }

    if (end.isBefore(start, "day")) {
      return {
        ...result,
        isValid: false,
        message: `${itemName} end date cannot be before start date`,
      };
    }

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

    let adjustedStart = start;
    let adjustedEnd = end;
    let needsAdjustment = false;

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

    if (needsAdjustment) {
      return {
        isValid: true,
        message: `${itemName} dates adjusted to fit within schedule period`,
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

      const outsideSchedule =
        current.isBefore(scheduleStart, "day") ||
        current.isAfter(scheduleEnd, "day");

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

    if (item.wasAdjusted) {
      return {
        type: "warning",
        message: `Dates were automatically adjusted to fit within the schedule period`,
      };
    }

    if (schedule.end < itemDates.start) {
      return {
        type: "error",
        message: "Schedule ends before item validity period",
      };
    }

    if (schedule.start > itemDates.end) {
      return {
        type: "error",
        message: "Schedule starts after item validity period",
      };
    }

    return {
      type: "success",
      message: "Dates are within the valid schedule period",
    };
  };

  // New utility method for filtering items by date validity
  static filterValidItems(items, scheduleStartDate, scheduleEndDate) {
    if (!scheduleStartDate || !scheduleEndDate) return items;

    const scheduleStart = dayjs(scheduleStartDate);
    const scheduleEnd = dayjs(scheduleEndDate);

    return items.filter((item) => {
      const itemData = item.offer || item.coupons || item;
      const itemStart = dayjs(itemData.start_date);
      const itemEnd = dayjs(itemData.end_date);

      // Item is valid if it overlaps with schedule period
      return !(
        itemEnd.isBefore(scheduleStart, "day") ||
        itemStart.isAfter(scheduleEnd, "day")
      );
    });
  }

  // Utility to get overlap status
  static getOverlapStatus(
    itemStartDate,
    itemEndDate,
    scheduleStartDate,
    scheduleEndDate
  ) {
    const itemStart = dayjs(itemStartDate);
    const itemEnd = dayjs(itemEndDate);
    const scheduleStart = dayjs(scheduleStartDate);
    const scheduleEnd = dayjs(scheduleEndDate);

    if (
      itemEnd.isBefore(scheduleStart, "day") ||
      itemStart.isAfter(scheduleEnd, "day")
    ) {
      return "no-overlap";
    }

    if (
      itemStart.isSameOrAfter(scheduleStart, "day") &&
      itemEnd.isSameOrBefore(scheduleEnd, "day")
    ) {
      return "fully-contained";
    }

    return "partial-overlap";
  }
}
