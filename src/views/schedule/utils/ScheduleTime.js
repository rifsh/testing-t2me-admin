const { getCurrentTimeByTimezone } = require("utils/time_zone_util");
export class ScheduleTimeUtil {
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

  static validateTimeSlote = (timeSlots, dateStr, form, time, currentIndex, fieldType) => {
    
  
    // 1. Basic Validation Checks
    // -------------------------
    // 1.1 Check if time exists
    if (!time) {
      return { isValid: false, message: "Please select a valid time." };
    }
  
    // 1.2 Get required form values
    const booking_start_date_time = form.getFieldValue("booking_start_date_time");
    const start_date = form.getFieldValue("start_date");
    const currentSlot = timeSlots[dateStr]?.[currentIndex] || {};
  
    // 1.3 Validate required dates exist
    if (!booking_start_date_time || !start_date) {
      return {
        isValid: false,
        message: "Please set booking start date and event start date first.",
      };
    }
  
    // 1.4 Format times for comparison
    const selectedTime = time.format("HH:mm");
    const bookingStartTime = booking_start_date_time.format("HH:mm");
    const bookingDate = booking_start_date_time.format("YYYY-MM-DD");
    const startDate = start_date.format("YYYY-MM-DD");
  
    // 2. Start/End Time Relationship Validation
    // ---------------------------------------
    // 2.1 Validate end time is after start time
    if (fieldType === 'end_time' && currentSlot.start_time) {
      const startTime = currentSlot.start_time.format("HH:mm");
      if (selectedTime <= startTime) {
        return {
          isValid: false,
          message: "End time must be after the start time.",
        };
      }
    }
  
    // 2.2 Validate start time is before end time
    if (fieldType === 'start_time' && currentSlot.end_time) {
      const endTime = currentSlot.end_time.format("HH:mm");
      if (selectedTime >= endTime) {
        return {
          isValid: false,
          message: "Start time must be before the end time.",
        };
      }
    }
  
    // 3. Booking Time Constraints
    // -------------------------
    // 3.1 Check booking start time constraint
    if (bookingDate === startDate && startDate === dateStr) {
      if (selectedTime < bookingStartTime) {
        return {
          isValid: false,
          message: "Time slot cannot be earlier than booking start time.",
        };
      }
    }
  
    // 3.2 Skip further validations if no time slots exist
    if (!timeSlots[dateStr] || !timeSlots[dateStr].length) {
      return { isValid: true };
    }
  
    // 4. Impact on Subsequent Slots
    // ---------------------------
    // 4.1 Check effect on later slots
    if (timeSlots[dateStr] && timeSlots[dateStr].length > currentIndex + 1) {
      const laterSlots = timeSlots[dateStr].slice(currentIndex + 1);
      
      const hasEffectOnLaterSlots = laterSlots.some(slot => 
        slot.start_time && slot.start_time.format("HH:mm") <= selectedTime
      );
  
      if (hasEffectOnLaterSlots) {
        return {
          isValid: true,
          isWarning: true,
          message: "Changing this time slot will affect subsequent time slots. Would you like to continue?",
          affectedSlots: laterSlots
        };
      }
    }
  
    // 5. Overlap Validation
    // -------------------
    // 5.1 Check for overlapping slots
    for (let i = 0; i < timeSlots[dateStr].length; i++) {
      if (i === currentIndex) continue;
  
      const slot = timeSlots[dateStr][i];
      if (!slot.start_time) continue;
  
      const existingStartTime = slot.start_time.format("HH:mm");
  
      // 5.2 Check for duplicate start times
      if (existingStartTime === selectedTime) {
        return {
          isValid: false,
          message: "This time is already used in another slot.",
        };
      }
  
      // 5.3 Check for time range overlaps
      if (slot.end_time) {
        const existingEndTime = slot.end_time.format("HH:mm");
        const isOverlapping = (selectedTime >= existingStartTime && selectedTime < existingEndTime) ||
                            (fieldType === "end_time" && selectedTime <= existingEndTime && selectedTime > existingStartTime);
  
        if (isOverlapping) {
          return {
            isValid: false,
            message: "Time slot overlaps with an existing slot.",
          };
        }
      }
    }
  
    // 6. Chronological Order Validation
    // ------------------------------
    // 6.1 Ensure slots are in order
    const slots = timeSlots[dateStr].filter((slot) => slot.start_time);
    if (slots.length > 0) {
      const sortedSlots = [...slots].sort((a, b) => 
        a.start_time.format("HH:mm").localeCompare(b.start_time.format("HH:mm"))
      );
  
      for (let i = 1; i < sortedSlots.length; i++) {
        const prevSlot = sortedSlots[i - 1];
        const currSlot = sortedSlots[i];
  
        if (prevSlot.end_time && currSlot.start_time) {
          const prevEndTime = prevSlot.end_time.format("HH:mm");
          const currStartTime = currSlot.start_time.format("HH:mm");
  
          if (currStartTime <= prevEndTime) {
            return {
              isValid: false,
              message: "Time slots must be in chronological order with no overlaps.",
            };
          }
        }
      }
    }
  
    // 7. Time Format Validation
    // ----------------------
    // 7.1 Validate 24-hour format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(selectedTime)) {
      return {
        isValid: false,
        message: "Please enter a valid time in 24-hour format (HH:mm).",
      };
    }
  
    
    return { isValid: true };
  };
}
