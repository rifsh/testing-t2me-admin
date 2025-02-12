class TimeSlotValidator {
  static validateTimeSlot = (
    timeSlots,
    dateStr,
    form,
    time,
    currentIndex,
    fieldType
  ) => {
    try {
      // 1. Initial Validation
      if (!this.validateInitialConditions(time, form)) {
        return {
          isValid: false,
          message: "Please set all required date and time fields first.",
        };
      }

      // 2. Get and validate form values
      const formValues = this.getFormValues(form);
      if (!formValues.isValid) {
        return formValues;
      }

      const { booking_start_date_time, start_date } = formValues;

      // 3. Time Format Validation
      const timeValues = this.formatTimeValues(
        time,
        booking_start_date_time,
        start_date
      );
      if (!timeValues.isValid) {
        return timeValues;
      }

      const { selectedTime, bookingStartTime, bookingDate, eventDate } =
        timeValues;

      // 4. Check if time is already used across all dates
      const timeUsageValidation = this.validateTimeUsageAcrossDates(
        timeSlots,
        selectedTime,
        dateStr,
        currentIndex
      );
      if (!timeUsageValidation.isValid) {
        return timeUsageValidation;
      }

      // 5. Start/End Time Relationship Validation
      const relationshipValidation = this.validateTimeRelationship(
        fieldType,
        selectedTime,
        timeSlots[dateStr]?.[currentIndex] || {}
      );
      if (!relationshipValidation.isValid) {
        return relationshipValidation;
      }

      // 6. Event Time Constraints
      const constraintValidation = this.validateTimeConstraints(
        selectedTime,
        bookingStartTime,
        bookingDate,
        eventDate,
        dateStr
      );
      if (!constraintValidation.isValid) {
        return constraintValidation;
      }

      // 7. Subsequent Slots Impact
      const impactValidation = this.validateSubsequentSlots(
        timeSlots,
        dateStr,
        currentIndex,
        selectedTime,
        fieldType
      );
      if (impactValidation.isWarning) {
        return impactValidation;
      }

      // 8. Overlap Validation
      const overlapValidation = this.validateOverlaps(
        timeSlots,
        dateStr,
        currentIndex,
        selectedTime,
        fieldType
      );
      if (!overlapValidation.isValid) {
        return overlapValidation;
      }

      return { isValid: true };
    } catch (error) {
      console.error("Validation error:", error);
      return {
        isValid: false,
        message: "An error occurred during validation. Please try again.",
      };
    }
  };

  static validateTimeUsageAcrossDates(
    timeSlots,
    selectedTime,
    currentDateStr,
    currentIndex
  ) {
    for (const dateStr in timeSlots) {
      const slots = timeSlots[dateStr];
      for (let i = 0; i < slots.length; i++) {
        if (dateStr === currentDateStr && i === currentIndex) continue;

        const slot = slots[i];
        if (!slot.start_time) continue;

        const startTime = slot.start_time.format("HH:mm");
        const endTime = slot.end_time?.format("HH:mm");

        if (startTime === selectedTime) {
          return {
            isValid: false,
            message: `This time is already used as a start time on ${dateStr}`,
          };
        }

        if (endTime === selectedTime) {
          return {
            isValid: false,
            message: `This time is already used as an end time on ${dateStr}`,
          };
        }
      }
    }
    return { isValid: true };
  }

  static validateInitialConditions(time, form) {
    return time && form;
  }

  static getFormValues(form) {
    const booking_start_date_time = form.getFieldValue(
      "booking_start_date_time"
    );
    const start_date = form.getFieldValue("start_date");

    if (!booking_start_date_time || !start_date) {
      return {
        isValid: false,
        message: "Please set booking start date and event start date first.",
      };
    }

    return {
      isValid: true,
      booking_start_date_time,
      start_date,
    };
  }

  static formatTimeValues(time, booking_start_date_time, start_date) {
    try {
      const selectedTime = time.format("HH:mm");
      const bookingStartTime = booking_start_date_time.format("HH:mm");

      const bookingDate = booking_start_date_time.format("YYYY-MM-DD");
      const eventDate = start_date.format("YYYY-MM-DD");

      // Validate time format
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(selectedTime)) {
        return {
          isValid: false,
          message: "Please enter a valid time in 24-hour format (HH:mm).",
        };
      }

      return {
        isValid: true,
        selectedTime,
        bookingStartTime,
        bookingDate,
        eventDate,
      };
    } catch (error) {
      return {
        isValid: false,
        message: "Invalid time format provided.",
      };
    }
  }

  static validateTimeRelationship(fieldType, selectedTime, existingSlot) {
    if (fieldType === "end_time" && existingSlot.start_time) {
      const startTime = existingSlot.start_time.format("HH:mm");
      if (selectedTime <= startTime) {
        return {
          isValid: false,
          message: "End time must be after the start time.",
        };
      }
    }

    // if (fieldType === "start_time" && existingSlot.end_time) {
    //   const endTime = existingSlot.end_time.format("HH:mm");
    //   if (selectedTime >= endTime) {
    //     return {
    //       isValid: true,
    //       isWarning: true,
    //       message: "Start time must be before the start time.",
    //     };
    //   }
    // }

    return { isValid: true };
  }

  static validateTimeConstraints(
    selectedTime,
    bookingStartTime,
    bookingDate,
    eventDate,
    dateStr
  ) {
    if (bookingDate === eventDate && eventDate === dateStr) {
      if (selectedTime < bookingStartTime) {
        return {
          isValid: false,
          message: "Time slot cannot be earlier than booking start time.",
        };
      }
    }

    return { isValid: true };
  }
  static validateSubsequentSlots(
    timeSlots,
    dateStr,
    currentIndex,
    selectedTime,
    fieldType
  ) {
    if (!timeSlots[dateStr]?.length) return { isValid: true };

    const laterSlots = timeSlots[dateStr].slice(currentIndex + 1);
    const selectedMinutes = this.timeToMinutes(selectedTime);

    const affectedSlots = laterSlots.reduce((acc, slot, idx) => {
      if (!slot.start_time) return acc;

      const slotStartMinutes = this.timeToMinutes(
        slot.start_time.format("HH:mm")
      );
      if (selectedMinutes >= slotStartMinutes) {
        acc.push({ ...slot, index: currentIndex + idx + 1 });
      }
      return acc;
    }, []);

    if (affectedSlots.length > 0) {
      return {
        isValid: true,
        isWarning: true,
        message:
          "This change will affect later time slots. Would you like to continue?",
        affectedSlots,
      };
    }

    return { isValid: true };
  }

  static validateOverlaps(
    timeSlots,
    dateStr,
    currentIndex,
    selectedTime,
    fieldType
  ) {
    const slots = timeSlots[dateStr] || [];
    const selectedMinutes = this.timeToMinutes(selectedTime);
    const currentSlot = slots[currentIndex] || {};

    // Get all valid slots except current one
    const otherSlots = slots
      .map((slot, idx) => ({ ...slot, index: idx }))
      .filter(
        (slot) =>
          slot.index !== currentIndex && slot.start_time && slot.end_time
      )
      .sort(
        (a, b) =>
          this.timeToMinutes(a.start_time.format("HH:mm")) -
          this.timeToMinutes(b.start_time.format("HH:mm"))
      );

    if (fieldType === "start_time") {
      // If this slot already has an end time, ensure start time is before it
      if (currentSlot.end_time) {
        const currentEndMinutes = this.timeToMinutes(
          currentSlot.end_time.format("HH:mm")
        );
        if (selectedMinutes >= currentEndMinutes) {
          return {
            isValid: false,
            message: "Start time must be before the slot's end time",
          };
        }
      }

      // Check overlaps with previous and next slots
      for (const slot of otherSlots) {
        const slotStartMinutes = this.timeToMinutes(
          slot.start_time.format("HH:mm")
        );
        const slotEndMinutes = this.timeToMinutes(
          slot.end_time.format("HH:mm")
        );

        // Check if selected start time falls within any existing slot
        if (
          selectedMinutes >= slotStartMinutes &&
          selectedMinutes <= slotEndMinutes
        ) {
          return {
            isValid: false,
            message: `Start time overlaps with slot ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }

        // If we have an end time, check if this creates an overlapping slot
        if (currentSlot.end_time) {
          const currentEndMinutes = this.timeToMinutes(
            currentSlot.end_time.format("HH:mm")
          );
          if (
            selectedMinutes < slotEndMinutes &&
            currentEndMinutes > slotStartMinutes
          ) {
            return {
              isValid: false,
              message: `Time slot would overlap with ${slot.start_time.format(
                "HH:mm"
              )} - ${slot.end_time.format("HH:mm")}`,
            };
          }
        }
      }
    }

    if (fieldType === "end_time") {
      // Must have a start time to set end time
      if (!currentSlot.start_time) {
        return {
          isValid: false,
          message: "Please set start time first",
        };
      }

      const currentStartMinutes = this.timeToMinutes(
        currentSlot.start_time.format("HH:mm")
      );

      // End time must be after start time
      if (selectedMinutes <= currentStartMinutes) {
        return {
          isValid: false,
          message: "End time must be after start time",
        };
      }

      // Check overlaps with other slots
      for (const slot of otherSlots) {
        const slotStartMinutes = this.timeToMinutes(
          slot.start_time.format("HH:mm")
        );
        const slotEndMinutes = this.timeToMinutes(
          slot.end_time.format("HH:mm")
        );

        // Check if selected end time falls within any existing slot
        if (
          selectedMinutes >= slotStartMinutes &&
          selectedMinutes <= slotEndMinutes
        ) {
          return {
            isValid: false,
            message: `End time overlaps with slot ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }

        // Check if the new slot would completely contain another slot
        if (
          currentStartMinutes <= slotStartMinutes &&
          selectedMinutes >= slotEndMinutes
        ) {
          return {
            isValid: false,
            message: `Time slot would contain existing slot ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }

        // Check if the new slot would be contained within another slot
        if (
          currentStartMinutes >= slotStartMinutes &&
          selectedMinutes <= slotEndMinutes
        ) {
          return {
            isValid: false,
            message: `Time slot would be contained within ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }

        // Check if the new slot would overlap with the start of another slot
        if (
          currentStartMinutes < slotStartMinutes &&
          selectedMinutes > slotStartMinutes
        ) {
          return {
            isValid: false,
            message: `Time slot would overlap with the start of ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }

        // Check if the new slot would overlap with the end of another slot
        if (
          currentStartMinutes < slotEndMinutes &&
          selectedMinutes > slotEndMinutes
        ) {
          return {
            isValid: false,
            message: `Time slot would overlap with the end of ${slot.start_time.format(
              "HH:mm"
            )} - ${slot.end_time.format("HH:mm")}`,
          };
        }
      }
    }

    return { isValid: true };
  }

  static validateSubsequentSlots(
    timeSlots,
    dateStr,
    currentIndex,
    selectedTime,
    fieldType
  ) {
    if (!timeSlots[dateStr]?.length) return { isValid: true };

    const selectedMinutes = this.timeToMinutes(selectedTime);
    const currentSlot = timeSlots[dateStr][currentIndex];

    // Only check subsequent slots if modifying start time
    // if (fieldType === "start_time") {
      const laterSlots = timeSlots[dateStr]
        .slice(currentIndex + 1)
        .map((slot, idx) => ({ ...slot, index: currentIndex + idx + 1 }))
        .filter((slot) => slot.start_time);

      const affectedSlots = laterSlots.filter((slot) => {
        const slotStartMinutes = this.timeToMinutes(
          slot.start_time.format("HH:mm")
        );
        // If new start time is after or equal to any later slot's start time
        return selectedMinutes >= slotStartMinutes;
      });

      if (affectedSlots.length > 0) {
        return {
          isValid: true,
          isWarning: true,
          message: "This change will affect later time slots. Continue?",
          affectedSlots,
        };
      }
    // }

    return { isValid: true };
  }

  static timeToMinutes(timeStr) {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }
}

export default TimeSlotValidator;
