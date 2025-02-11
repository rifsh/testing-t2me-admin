const { getCurrentTimeByTimezone } = require("utils/time_zone_util");
export class ScheduleTimeSlotsUtil {
  static clearFieldValue = (form, removeItems = []) => {
    if (!Array.isArray(removeItems) || removeItems.length === 0) {
      return; // Prevent errors if removeItems is undefined or empty
    }

    removeItems.forEach((item) => {
      form.setFieldsValue({ [item]: null }); // Correct way to clear a field
    });
  };

  static validateAdStartTime = ({ date, form, timezone }) => {
    // Get the current time based on the specified timezone
    const currentTime = getCurrentTimeByTimezone(timezone);

    if (!date) {
      return { isValid: false, message: "Please select a valid date." };
    }

    // Check if the selected date is in the past
    if (date < currentTime) {
      return {
        isValid: false,
        message: "You can't choose a time before the current time.",
      };
    }

    const bookingDate = form.getFieldValue("booking_start_date_time");
    const start_date = form.getFieldValue("start_date");
    const end_date = form.getFieldValue("end_date");

    if (bookingDate && date > bookingDate) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["booking_start_date_time", "start_date", "end_date"],
        message:
          "This change will affect your booking date, event start date, event end date, and time slots.",
      };
    } else if (start_date && date > start_date) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["start_date", "end_date"],
        message:
          "This change will affect your event start date, event end date, and time slots.",
      };
    } else if (end_date && date > end_date) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["end_date"],
        message: "This change will affect your event end date, and time slots.",
      };
    } else {
      return { isValid: true, isWarning: false };
    }
  };
  static validateBookingStartTime = ({ date, form, timezone }) => {
    // Get the current time based on the specified timezone
    const currentTime = getCurrentTimeByTimezone(timezone);

    if (!date) {
      return { isValid: false, message: "Please select a valid date." };
    }

    // Check if the selected date is in the past
    if (date < currentTime) {
      return {
        isValid: false,
        message: "You can't choose a time before the current time.",
      };
    }

    const adStartDate = form.getFieldValue("ad_start_date_time");
    const start_date = form.getFieldValue("start_date");
    const end_date = form.getFieldValue("end_date");

    if (adStartDate && date < adStartDate) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: [],
        message: "You can't choose a time before the Ad Start Time",
      };
    } else if (start_date && date > start_date) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["start_date", "end_date"],
        message:
          "This change will affect your event start date, event end date, and time slots.",
      };
    } else if (end_date && date > end_date) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["end_date"],
        message: "This change will affect your event end date, and time slots.",
      };
    } else {
      return { isValid: true, isWarning: false };
    }
  };
  static validateEventStartTime = ({ date, form, timezone }) => {
    // Get the current time based on the specified timezone
    const currentTime = getCurrentTimeByTimezone(timezone);

    if (!date) {
      return { isValid: false, message: "Please select a valid date." };
    }

    // Check if the selected date is in the past
    if (date < currentTime) {
      return {
        isValid: false,
        message: "You can't choose a time before the current time.",
      };
    }

    const adStartDate = form.getFieldValue("ad_start_date_time");
    const bookingDate = form.getFieldValue("booking_start_date_time");
    const end_date = form.getFieldValue("end_date");

    if (adStartDate && date < adStartDate) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: [],
        message: "You can't choose a date before the Ad Start Time",
      };
    } else if (bookingDate && date < bookingDate) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: [],
        message: "You can't choose a date before the Booking Start Time",
      };
    } else if (end_date && date > end_date) {
      return {
        isValid: true,
        isWarning: true,
        clearFields: ["end_date"],
        message: "This change will affect your event end date, and time slots.",
      };
    } else {
      return { isValid: true, isWarning: false };
    }
  };
  static validateEventEndTime = ({ date, form, timezone }) => {
    // Get the current time based on the specified timezone
    const currentTime = getCurrentTimeByTimezone(timezone);

    if (!date) {
      return { isValid: false, message: "Please select a valid date." };
    }

    // Check if the selected date is in the past
    if (date < currentTime) {
      return {
        isValid: false,
        message: "You can't choose a time before the current time.",
      };
    }

    const adStartDate = form.getFieldValue("ad_start_date_time");
    const bookingDate = form.getFieldValue("booking_start_date_time");
    const start_date = form.getFieldValue("start_date");

    if (adStartDate && date < adStartDate) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: [],
        message: "You can't choose a date before the Ad Start Time",
      };
    } else if (bookingDate && date < bookingDate) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: [],
        message: "You can't choose a date before the Booking Start Time",
      };
    } else if (start_date && date < start_date) {
      return {
        isValid: false,
        isWarning: false,
        clearFields: ["start_date", "end_date"],
        message: "You can't choose a date before the Start Time",
      };
    } else {
      return { isValid: true, isWarning: false };
    }
  };
}
