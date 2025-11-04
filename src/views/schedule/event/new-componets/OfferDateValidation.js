import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export class OfferDateValidation {
  static formatDate(date) {
    if (!date) return "";
    return dayjs(date).format("YYYY-MM-DD");
  }

  static parseDate(dateString) {
    if (!dateString) return null;
    return dayjs(dateString);
  }

  // Check if offer is currently active
  static isOfferActive(startDate, endDate, currentDate = new Date()) {
    if (!startDate || !endDate) {
      return true; // If no dates required, offer is always active
    }

    const current = dayjs(currentDate).startOf("day");
    const start = dayjs(startDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    return current.isSameOrAfter(start) && current.isSameOrBefore(end);
  }

  // Check if offer is expired
  static isOfferExpired(endDate, currentDate = new Date()) {
    if (!endDate) return false;

    const current = dayjs(currentDate).startOf("day");
    const end = dayjs(endDate).endOf("day");

    return current.isAfter(end);
  }

  // Check if offer is upcoming
  static isOfferUpcoming(startDate, currentDate = new Date()) {
    if (!startDate) return false;

    const current = dayjs(currentDate).startOf("day");
    const start = dayjs(startDate).startOf("day");

    return current.isBefore(start);
  }

  // Get offer status with label and color
  static getOfferStatus(
    startDate,
    endDate,
    dateRequired = true,
    currentDate = new Date()
  ) {
    if (!dateRequired || (!startDate && !endDate)) {
      return {
        status: "active",
        label: "Always Active",
        color: "green",
      };
    }

    const isExpired = this.isOfferExpired(endDate, currentDate);
    const isUpcoming = this.isOfferUpcoming(startDate, currentDate);
    const isActive = this.isOfferActive(startDate, endDate, currentDate);

    if (isExpired) {
      return {
        status: "expired",
        label: "Expired",
        color: "red",
      };
    }

    if (isUpcoming) {
      return {
        status: "upcoming",
        label: "Upcoming",
        color: "blue",
      };
    }

    if (isActive) {
      return {
        status: "active",
        label: "Active",
        color: "green",
      };
    }

    return {
      status: "inactive",
      label: "Inactive",
      color: "gray",
    };
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

    // Check if dates are valid
    if (!start.isValid() || !end.isValid()) {
      return {
        ...result,
        isValid: false,
        message: "Invalid date format",
      };
    }

    // Check if start date is before end date
    if (start.isAfter(end)) {
      return {
        ...result,
        isValid: false,
        message: "Start date must be before end date",
      };
    }

    // Check if dates overlap with schedule dates
    const isStartWithinSchedule = start.isBetween(
      scheduleStart,
      scheduleEnd,
      null,
      "[]"
    );
    const isEndWithinSchedule = end.isBetween(
      scheduleStart,
      scheduleEnd,
      null,
      "[]"
    );

    if (!isStartWithinSchedule || !isEndWithinSchedule) {
      // Auto-adjust dates to fit within schedule
      const adjustedStart = start.isBefore(scheduleStart)
        ? scheduleStart
        : start;
      const adjustedEnd = end.isAfter(scheduleEnd) ? scheduleEnd : end;

      return {
        ...result,
        isValid: true,
        wasAdjusted: true,
        message: `${itemName} dates adjusted to fit schedule range (${scheduleStart.format(
          "MMM DD"
        )} - ${scheduleEnd.format("MMM DD, YYYY")})`,
        adjustedDates: {
          start_date: adjustedStart.format("YYYY-MM-DD"),
          end_date: adjustedEnd.format("YYYY-MM-DD"),
        },
      };
    }

    return result;
  }

  // Validate if dates overlap with available show dates
  static validateAvailableDates(startDate, endDate, availableShowDates = []) {
    if (!startDate || !endDate || availableShowDates.length === 0) {
      return {
        isValid: true,
        hasOverlap: false,
        overlappingDates: [],
      };
    }

    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const overlappingDates = [];

    availableShowDates.forEach((dateStr) => {
      const showDate = dayjs(dateStr);
      if (showDate.isBetween(start, end, null, "[]")) {
        overlappingDates.push(dateStr);
      }
    });

    return {
      isValid: overlappingDates.length > 0,
      hasOverlap: overlappingDates.length > 0,
      overlappingDates,
      message:
        overlappingDates.length === 0
          ? "No available show dates within this date range"
          : `${overlappingDates.length} show dates available`,
    };
  }

  // Check if a specific date is within offer's valid period
  static isDateWithinOfferPeriod(checkDate, offerStartDate, offerEndDate) {
    if (!offerStartDate || !offerEndDate) return true;

    const date = dayjs(checkDate);
    const start = dayjs(offerStartDate);
    const end = dayjs(offerEndDate);

    return date.isBetween(start, end, null, "[]");
  }

  // Filter available dates based on offer's date range
  static filterAvailableDates(availableDates, offerStartDate, offerEndDate) {
    if (!offerStartDate || !offerEndDate) {
      return availableDates;
    }

    return availableDates.filter((dateStr) =>
      this.isDateWithinOfferPeriod(dateStr, offerStartDate, offerEndDate)
    );
  }
}

// Default export
export default OfferDateValidation;
