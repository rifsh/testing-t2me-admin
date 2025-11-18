// utils/offerCouponValidation.js
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const WEEKDAY_MAP = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 0,
};

/**
 * Validate if offer/coupon dates are within schedule date range
 * @param {string} offerStartDate - Offer start date
 * @param {string} offerEndDate - Offer end date
 * @param {string} scheduleStartDate - Schedule start date
 * @param {string} scheduleEndDate - Schedule end date
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateOfferWithinSchedule = (
  offerStartDate,
  offerEndDate,
  scheduleStartDate,
  scheduleEndDate
) => {
  // If no schedule dates provided, offer is valid
  if (!scheduleStartDate || !scheduleEndDate) {
    return { isValid: true, message: "" };
  }

  // NEW: If no offer dates provided, use schedule dates
  if (!offerStartDate || !offerEndDate) {
    return {
      isValid: true,
      message: "Using schedule dates as offer validity period",
      useScheduleDates: true, // Flag to indicate we should use schedule dates
    };
  }

  const offerStart = dayjs(offerStartDate);
  const offerEnd = dayjs(offerEndDate);
  const scheduleStart = dayjs(scheduleStartDate);
  const scheduleEnd = dayjs(scheduleEndDate);

  // Check if there's ANY overlap between offer and schedule ranges
  const hasOverlap =
    offerStart.isSameOrBefore(scheduleEnd, "day") &&
    offerEnd.isSameOrAfter(scheduleStart, "day");

  if (!hasOverlap) {
    return {
      isValid: false,
      message: `This offer/coupon (${offerStart.format(
        "MMM DD, YYYY"
      )} - ${offerEnd.format(
        "MMM DD, YYYY"
      )}) has no overlap with the schedule period (${scheduleStart.format(
        "MMM DD, YYYY"
      )} - ${scheduleEnd.format(
        "MMM DD, YYYY"
      )}). Please select an offer that falls within or overlaps with your event schedule.`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate if validity dates are within offer date range
 * @param {dayjs} validFrom - Validity start date
 * @param {dayjs} validTo - Validity end date
 * @param {string} offerStartDate - Offer start date
 * @param {string} offerEndDate - Offer end date
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateValidityDates = (
  validFrom,
  validTo,
  offerStartDate,
  offerEndDate
) => {
  if (
    validFrom.isBefore(dayjs(offerStartDate), "day") ||
    validTo.isAfter(dayjs(offerEndDate), "day")
  ) {
    return {
      isValid: false,
      message: `Validity dates must be within the offer range (${dayjs(
        offerStartDate
      ).format("MMM DD, YYYY")} - ${dayjs(offerEndDate).format(
        "MMM DD, YYYY"
      )})`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate configuration based on offer level
 * @param {string} offerLevel - Configuration type (schedule/date/timeslot)
 * @param {array} selectedDates - Selected dates
 * @param {object} timeSlotsByDate - Time slots by date
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateConfiguration = (
  offerLevel,
  selectedDates,
  timeSlotsByDate
) => {
  if (!offerLevel) {
    return {
      isValid: false,
      message: "Please select configuration type",
    };
  }

  if (offerLevel !== "schedule" && selectedDates.length === 0) {
    return {
      isValid: false,
      message: "Please select at least one date",
    };
  }

  if (offerLevel === "timeslot") {
    const hasAllSlots = selectedDates.every(
      (date) => timeSlotsByDate[date]?.length > 0
    );
    if (!hasAllSlots) {
      return {
        isValid: false,
        message: "Please select time slots for all selected dates",
      };
    }
  }

  return { isValid: true, message: "" };
};

/**
 * Filter available dates based on offer validity and weekdays
 * @param {array} availableDates - All available dates
 * @param {string} startDate - Offer start date
 * @param {string} endDate - Offer end date
 * @param {array} weekdayAssociations - Weekday restrictions
 * @param {string} scheduleStartDate - Schedule start date
 * @param {string} scheduleEndDate - Schedule end date
 * @returns {array} - Filtered dates
 */
export const filterAvailableDates = (
  availableDates,
  startDate,
  endDate,
  weekdayAssociations = [],
  scheduleStartDate = null,
  scheduleEndDate = null
) => {
  if (!startDate || !endDate) return availableDates;

  const allowedWeekdays = weekdayAssociations.map(
    (w) => WEEKDAY_MAP[w.weekday]
  );

  return availableDates.filter((date) => {
    const dateObj = dayjs(date);

    // Check if date is within offer range
    const isWithinOfferRange =
      dateObj.isSameOrAfter(dayjs(startDate), "day") &&
      dateObj.isSameOrBefore(dayjs(endDate), "day");

    // Check if date is within schedule range (if provided)
    let isWithinScheduleRange = true;
    if (scheduleStartDate && scheduleEndDate) {
      isWithinScheduleRange =
        dateObj.isSameOrAfter(dayjs(scheduleStartDate), "day") &&
        dateObj.isSameOrBefore(dayjs(scheduleEndDate), "day");
    }

    // If no weekday restrictions, just check date ranges
    if (allowedWeekdays.length === 0) {
      return isWithinOfferRange && isWithinScheduleRange;
    }

    // Check if date's weekday is allowed
    const dayOfWeek = dateObj.day();
    return (
      isWithinOfferRange &&
      isWithinScheduleRange &&
      allowedWeekdays.includes(dayOfWeek)
    );
  });
};

/**
 * Generate weekday message
 * @param {array} weekdayAssociations - Weekday restrictions
 * @returns {string} - Formatted weekday message
 */
export const getWeekdayMessage = (weekdayAssociations) => {
  if (weekdayAssociations.length === 0) {
    return "This offer/coupon is available on all days.";
  }

  const dayNames = weekdayAssociations
    .map((w) => w.weekday.charAt(0) + w.weekday.slice(1).toLowerCase())
    .join(", ");

  return `Available only on: ${dayNames}`;
};

/**
 * Disable dates outside offer and schedule range for RangePicker
 * @param {dayjs} current - Current date
 * @param {string} offerStartDate - Offer start date
 * @param {string} offerEndDate - Offer end date
 * @param {string} scheduleStartDate - Schedule start date (optional)
 * @param {string} scheduleEndDate - Schedule end date (optional)
 * @returns {boolean} - Whether the date should be disabled
 */
export const getDisabledDate = (
  current,
  offerStartDate,
  offerEndDate,
  scheduleStartDate = null,
  scheduleEndDate = null
) => {
  if (!current || !offerStartDate || !offerEndDate) return false;

  // Check offer range
  const isOutsideOfferRange =
    current.isBefore(dayjs(offerStartDate), "day") ||
    current.isAfter(dayjs(offerEndDate), "day");

  // Check schedule range if provided
  let isOutsideScheduleRange = false;
  if (scheduleStartDate && scheduleEndDate) {
    isOutsideScheduleRange =
      current.isBefore(dayjs(scheduleStartDate), "day") ||
      current.isAfter(dayjs(scheduleEndDate), "day");
  }

  return isOutsideOfferRange || isOutsideScheduleRange;
};

/**
 * Validate complete configuration before saving
 * @param {object} config - Configuration object
 * @param {object} itemData - Item data with offer/coupon details
 * @param {object} scheduleRange - Schedule date range { start_date, end_date }
 * @returns {object} - { isValid: boolean, message: string }
 */
export const validateCompleteConfiguration = (
  config,
  itemData,
  scheduleRange = null
) => {
  const { offerLevel, selectedDates, timeSlotsByDate, validFrom, validTo } =
    config;

  // Validate configuration type and selections
  const configValidation = validateConfiguration(
    offerLevel,
    selectedDates,
    timeSlotsByDate
  );
  if (!configValidation.isValid) {
    return configValidation;
  }

  const offerOrCoupon = itemData?.offer || itemData?.coupons || {};
  const startDate = offerOrCoupon.start_date;
  const endDate = offerOrCoupon.end_date;

  // Validate validity dates within offer range
  const validityValidation = validateValidityDates(
    validFrom,
    validTo,
    startDate,
    endDate
  );
  if (!validityValidation.isValid) {
    return validityValidation;
  }

  // Validate offer dates within schedule range (if provided)
  if (scheduleRange && scheduleRange.start_date && scheduleRange.end_date) {
    const scheduleValidation = validateOfferWithinSchedule(
      startDate,
      endDate,
      scheduleRange.start_date,
      scheduleRange.end_date
    );
    if (!scheduleValidation.isValid) {
      return scheduleValidation;
    }
  }

  return { isValid: true, message: "" };
};
