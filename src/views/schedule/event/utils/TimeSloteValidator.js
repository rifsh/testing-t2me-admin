import dayjs from "dayjs";

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
      // const timeUsageValidation = this.validateTimeUsageAcrossDates(
      //   timeSlots,
      //   selectedTime,
      //   dateStr,
      //   currentIndex
      // );
      // if (!timeUsageValidation.isValid) {
      //   return timeUsageValidation;
      // }

      // 5. Start/End Time Relationship Validation
      const relationshipValidation = this.validateTimeRelationship(
        fieldType,
        selectedTime,
        timeSlots[dateStr]?.[currentIndex] || {},
        timeSlots,
        dateStr,
        currentIndex
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

  static validateTimeRelationship(
    fieldType,
    selectedTime,
    existingSlot,
    timeSlots,
    dateStr,
    currentIndex
  ) {
    const slots = timeSlots[dateStr] || [];
    const currentSlot = slots[currentIndex] || {};
    const isMidnightPassed = currentSlot.is_midnight_passed;

    // Convert selected time to minutes for comparison
    const selectedMinutes = this.timeToMinutes(selectedTime);

    // Check previous slots when adding start_time
    if (fieldType === "start_time") {
      // Get all previous slots that have start times
      const previousSlots = slots
        .slice(0, currentIndex)
        .filter((slot) => slot.start_time);

      if (previousSlots.length > 0) {
        // Get the last previous slot
        const lastPreviousSlot = previousSlots[previousSlots.length - 1];
        const lastEndTime = lastPreviousSlot.end_time?.format("HH:mm");

        if (lastEndTime) {
          const lastEndMinutes = this.timeToMinutes(lastEndTime);

          // New start time must be after the end time of the last previous slot
          if (selectedMinutes < lastEndMinutes) {
            return {
              isValid: false,
              message: `Start time must be after the end time (${lastEndTime}) of the previous slot`,
            };
          }
        }
      }
    }

    // Check next slots when adding end_time
    if (fieldType === "end_time") {
      // First check if we have a start time
      if (!existingSlot.start_time) {
        return {
          isValid: false,
          message: "Please set start time first",
        };
      }

      // Then check if end time is after start time (except for midnight passed)
      const startTime = existingSlot.start_time.format("HH:mm");
      if (selectedTime <= startTime && !isMidnightPassed) {
        return {
          isValid: false,
          message: "End time must be after the start time",
        };
      }

      // Get all next slots that have start times
      const nextSlots = slots
        .slice(currentIndex + 1)
        .filter((slot) => slot.start_time);

      if (nextSlots.length > 0) {
        // Get the first next slot
        const firstNextSlot = nextSlots[0];
        const nextStartTime = firstNextSlot.start_time.format("HH:mm");
        const nextStartMinutes = this.timeToMinutes(nextStartTime);

        // New end time must be before the start time of the next slot
        if (selectedMinutes > nextStartMinutes) {
          return {
            isValid: false,
            message: `End time must be before the start time (${nextStartTime}) of the next slot`,
          };
        }
      }
    }

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
    const isMidnightPassed = currentSlot.is_midnight_passed;

    // Check if there's any slot with show_end_date for the current date
    const slotWithShowEnd = Object.keys(timeSlots).reduce((found, date) => {
      const dateSlots = timeSlots[date] || [];
      const matchingSlot = dateSlots.find(
        (slot) =>
          slot.show_end_date &&
          dayjs(slot.show_end_date).format("YYYY-MM-DD") === dateStr
      );
      return found || matchingSlot;
    }, null);

    // If there's a slot with show_end_date, validate against it
    if (slotWithShowEnd) {
      const showEndTime = dayjs(slotWithShowEnd.show_end_date).format("HH:mm");
      const showEndMinutes = this.timeToMinutes(showEndTime);

      if (selectedMinutes <= showEndMinutes) {
        return {
          isValid: false,
          message: `Cannot select time before show end time (${showEndTime}) for this date`,
        };
      }
    }

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
      if (selectedMinutes <= currentStartMinutes && !isMidnightPassed) {
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

        // Various overlap checks...
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

        // Check other overlap conditions...
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

  // First, let's update the coverage check function to handle show end times
  static isFullDayCovered(timeSlots, dateStr, checkShowEndTime = false) {
    const currentDateSlots = timeSlots[dateStr] || [];
    const slots = timeSlots[dateStr] || [];
    const isMidnightPassed =
      slots.some((slot) => slot.is_midnight_passed === true) || false;

    if (currentDateSlots.length === 0) return false;

    // Sort slots by start time
    const sortedSlots = [...currentDateSlots]
      .filter((slot) => slot.start_time && slot.end_time)
      .sort((a, b) => {
        const aTime = dayjs(a.start_time);
        const bTime = dayjs(b.start_time);
        return aTime.isBefore(bTime) ? -1 : 1;
      });

    if (sortedSlots.length === 0) return false;

    // Check if first slot starts at beginning of day and last slot ends at end of day
    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    const firstSlotStart = dayjs(firstSlot.start_time);
    const lastSlotEnd = dayjs(lastSlot.end_time);

    // Check if slots cover entire day (00:01 to 23:59)
    const startsAtBeginning =
      firstSlotStart.hour() === 0 && firstSlotStart.minute() <= 1;
    const endsAtEnd = lastSlotEnd.hour() === 23 && lastSlotEnd.minute() >= 59;

    // Check for gaps between slots
    for (let i = 0; i < sortedSlots.length - 1; i++) {
      const currentSlotEnd = dayjs(sortedSlots[i].end_time);
      const nextSlotStart = dayjs(sortedSlots[i + 1].start_time);

      if (nextSlotStart.diff(currentSlotEnd, "minute") > 0) {
        return false; // Found a gap
      }
    }

    // Additional check for show_end_time coverage if requested
    if (checkShowEndTime) {
      const hasAllShowEndTimes = sortedSlots.every(
        (slot) => slot.show_end_date
      );
      if (!hasAllShowEndTimes) return false;
    }

    return isMidnightPassed || (startsAtBeginning && endsAtEnd);
  }

  static areAllSlotsComplete(timeSlots, dateStr) {
    const currentDateSlots = timeSlots[dateStr] || [];

    // If no slots, allow adding new slot
    if (currentDateSlots.length === 0) {
      return true;
    }

    // Check if all existing slots have required fields filled
    return currentDateSlots.every(
      (slot) => slot.start_time && slot.end_time && slot.ticketType&&slot.seat_structure_id
    );
  }

  static hasFormErrors(form, dateStr) {
    const fields = form.getFieldsError();
    const timeSlotFields = fields.filter(
      (field) => field.name[0] === "timeSlots" && field.name[1] === dateStr
    );

    return timeSlotFields.some((field) => field.errors.length > 0);
  }

  static getDateCoverage(timeSlots, dateStr) {
    const allDates = Object.keys(timeSlots).sort();
    const coverage = {
      isFullyCovered: false,
      partialCoverage: null,
      availableFrom: null,
    };

    // Check previous dates for midnight passed slots
    for (const date of allDates) {
      if (date > dateStr) break;

      const slots = timeSlots[date] || [];
      for (const slot of slots) {
        if (slot.is_midnight_passed && slot.show_end_date) {
          const showEndDate = dayjs(slot.show_end_date);
          const showEndDateStr = showEndDate.format("YYYY-MM-DD");

          if (showEndDateStr === dateStr) {
            coverage.partialCoverage = true;
            coverage.availableFrom = showEndDate;
          } else if (showEndDateStr > dateStr) {
            coverage.isFullyCovered = true;
          }
        }
      }
    }

    return coverage;
  }

  static shouldShowTimeSlots(timeSlots, dateStr) {
    const coverage = this.getDateCoverage(timeSlots, dateStr);
    return !coverage.isFullyCovered;
  }

  static shouldShowAddButton(timeSlots, dateStr, form) {
    const coverage = this.getDateCoverage(timeSlots, dateStr);
    if (coverage.isFullyCovered) return false;

    const currentDateSlots = timeSlots[dateStr] || [];
    if (currentDateSlots.length === 0) {
      return true;
    }

    const lastSlot = currentDateSlots[currentDateSlots.length - 1];
    const isLastSlotComplete =
      lastSlot.start_time && lastSlot.end_time && lastSlot.ticketType && lastSlot.seat_structure_id;

    return (
      isLastSlotComplete &&
      !this.hasFormErrors(form, dateStr) &&
      !this.isFullDayCovered(timeSlots, dateStr)
    );
  }

  // static validateShowEndTime(timeSlots, dateStr, index, value) {
  //   if (!value) {
  //     return { isValid: false, message: "Show end time is required" };
  //   }

  //   const selectedEndTime = value.format("YYYY-MM-DD HH:mm");
  //   const selectedEndDate = value.format("YYYY-MM-DD");
  //   const allDates = Object.keys(timeSlots).sort();
  //   const firstEventDate = allDates[0];
  //   const lastEventDate = allDates[allDates.length - 1];
  //   const currentDate = dayjs(dateStr);
  //   const currentSlot = timeSlots[dateStr]?.[index];

  //   // Basic validations
  //   if (!value.isAfter(currentDate, "day")) {
  //     return {
  //       isValid: false,
  //       message: "Show end date must be after the current date"
  //     };
  //   }

  //   if (!currentSlot?.start_time || !currentSlot?.is_midnight_passed) {
  //     return {
  //       isValid: false,
  //       message: "Please set start time and enable midnight passed first"
  //     };
  //   }

  //   if (selectedEndDate < dateStr) {
  //     return {
  //       isValid: false,
  //       message: "Show end date cannot be before the current slot date",
  //     };
  //   }

  //   if (selectedEndDate < firstEventDate) {
  //     return {
  //       isValid: false,
  //       message: "Show end date cannot be before the first event date",
  //     };
  //   }

  //   if (selectedEndDate > lastEventDate) {
  //     return {
  //       isValid: false,
  //       message: "Show end date cannot be after the last event date",
  //     };
  //   }

  //   // Get coverage analysis
  //   const {
  //     coverageMap,
  //     datesToUpdate,
  //     skippedDates,
  //     hasConflicts,
  //     conflictMessage,
  //     coverageStatus
  //   } = this.validateDateCoverage(timeSlots, dateStr, index, value);

  //   if (hasConflicts) {
  //     return {
  //       isValid: false,
  //       message: conflictMessage
  //     };
  //   }

  //   // Validate end time against start times on end date
  //   const endDateSlots = timeSlots[selectedEndDate] || [];
  //   if (endDateSlots.length > 0) {
  //     const endTimeOnDay = dayjs(selectedEndTime);
  //     const firstStartTime = endDateSlots[0].start_time;

  //     if (firstStartTime && endTimeOnDay.isBefore(firstStartTime)) {
  //       return {
  //         isValid: false,
  //         message: `Show end time must be after the start time (${firstStartTime.format("HH:mm")}) on ${selectedEndDate}`,
  //       };
  //     }
  //   }

  //   return {
  //     isValid: true,
  //     datesToUpdate,
  //     skippedDates,
  //     selectedEndDate,
  //     coverageMap,
  //     coverageStatus
  //   };
  // }

  // static validateDateCoverage(timeSlots, dateStr, index, value) {
  //   const coverageMap = new Map();
  //   const coverageStatus = new Map();
  //   let hasConflicts = false;
  //   let conflictMessage = "";

  //   // First pass: Map out existing coverage excluding the slot being edited
  //   Object.entries(timeSlots).forEach(([date, slots]) => {
  //     slots.forEach((slot, slotIdx) => {
  //       // Skip the current slot being edited and any empty slots
  //       if ((date === dateStr && slotIdx === index) || !slot) {
  //         return;
  //       }

  //       if (slot.is_midnight_passed && slot.show_end_date) {
  //         const slotStartDate = dayjs(date);
  //         const slotEndDate = dayjs(slot.show_end_date);

  //         let currentDate = slotStartDate;
  //         while (currentDate.isSameOrBefore(slotEndDate, "day")) {
  //           const dateKey = currentDate.format("YYYY-MM-DD");
  //           if (!coverageMap.has(dateKey)) {
  //             coverageMap.set(dateKey, new Set());
  //             coverageStatus.set(dateKey, {
  //               coveredByOthers: false,
  //               slots: [],
  //             });
  //           }

  //           // Add slot reference to coverage
  //           coverageMap.get(dateKey).add(`${date}-${slotIdx}`);
  //           coverageStatus.get(dateKey).slots.push({
  //             date,
  //             index: slotIdx,
  //             startTime: slot.start_time,
  //             endDate: slotEndDate,
  //           });

  //           currentDate = currentDate.add(1, "day");
  //         }
  //       }
  //     });
  //   });

  //   // Second pass: Check the proposed coverage against existing coverage
  //   const targetEndDate = dayjs(value);
  //   let currentDate = dayjs(dateStr);
  //   const datesToUpdate = new Set();

  //   while (currentDate.isSameOrBefore(targetEndDate, "day")) {
  //     const dateKey = currentDate.format("YYYY-MM-DD");
  //     const existingCoverage = coverageStatus.get(dateKey);

  //     if (existingCoverage) {
  //       // Check if any existing slot already covers this date
  //       const conflictingSlots = existingCoverage.slots.filter(
  //         (slot) => slot.date !== dateStr || slot.index !== index
  //       );

  //       if (conflictingSlots.length > 0) {
  //         // Check if the conflicting slots fully cover the date
  //         const hasFullCoverage = conflictingSlots.some((slot) => {
  //           const slotEndDate = dayjs(slot.endDate);
  //           return slotEndDate.isAfter(targetEndDate);
  //         });

  //         if (hasFullCoverage) {
  //           hasConflicts = true;
  //           conflictMessage = `Cannot modify end date - Date ${dateKey} is covered by another slot`;
  //           break;
  //         }
  //       }
  //     }

  //     datesToUpdate.add(dateKey);
  //     currentDate = currentDate.add(1, "day");
  //   }

  //   return {
  //     hasConflicts,
  //     conflictMessage,
  //     datesToUpdate: Array.from(datesToUpdate),
  //     coverageMap,
  //     coverageStatus,
  //   };
  // }
  static normalizeTimeSlots(timeSlots) {
    if (!timeSlots) return {};

    const normalized = {};

    Object.entries(timeSlots).forEach(([date, slots]) => {
      // Ensure slots is an array and handle null/undefined slots
      const validSlots = Array.isArray(slots) ? slots : [];

      normalized[date] = validSlots.map((slot) => {
        if (!slot) return {};

        // If slot has nested show_end_date structure, flatten it
        if (slot.show_end_date && typeof slot.show_end_date === "object") {
          return {
            ...slot,
            is_midnight_passed: slot.show_end_date.is_midnight_passed,
            show_end_date: slot.show_end_date.show_end_date,
            end_time: slot.show_end_date.end_time,
          };
        }
        return slot;
      });

      // Always preserve the array for the date
      if (!normalized[date]) {
        normalized[date] = [];
      }
    });

    return normalized;
  }

  static analyzeTimeSlotCoverage(timeSlots) {
    const coverage = {};
    const normalizedSlots = this.normalizeTimeSlots(timeSlots);

    Object.entries(normalizedSlots).forEach(([date, slots]) => {
      coverage[date] = {
        isFullyCovered: false,
        isPartiallyCovered: false,
        totalSlots: slots.length,
        midnightSlots: 0,
        coveringDates: new Set(),
      };

      // Count midnight slots and track covering dates
      slots.forEach((slot) => {
        if (slot.is_midnight_passed && slot.show_end_date) {
          coverage[date].midnightSlots++;

          // Track the range of dates this slot covers
          const startDate = dayjs(date);
          const endDate = dayjs(slot.show_end_date);
          let currentDate = startDate;

          while (currentDate.isSameOrBefore(endDate, "day")) {
            coverage[date].coveringDates.add(currentDate.format("YYYY-MM-DD"));
            currentDate = currentDate.add(1, "day");
          }
        }
      });

      // Update coverage status
      coverage[date].isFullyCovered =
        coverage[date].midnightSlots === coverage[date].totalSlots;
      coverage[date].isPartiallyCovered =
        coverage[date].midnightSlots > 0 && !coverage[date].isFullyCovered;
    });

    return coverage;
  }

  static cleanupTimeSlots(timeSlots) {
    const coverage = this.analyzeTimeSlotCoverage(timeSlots);
    const cleaned = {};

    Object.entries(timeSlots).forEach(([date, slots]) => {
      cleaned[date] = slots.map((slot) => {
        if (!slot) return {};
        return slot;
      });
    });

    return this.normalizeTimeSlots(cleaned);
  }

  static validateDateCoverage(timeSlots, dateStr, index, value) {
    const coverageMap = new Map();
    const coverageStatus = new Map();
    let hasConflicts = false;
    let conflictingSlots = [];

    // First pass: Map out existing coverage excluding the slot being edited
    Object.entries(timeSlots).forEach(([date, slots]) => {
      slots.forEach((slot, slotIdx) => {
        // Skip the current slot being edited and any empty slots
        if ((date === dateStr && slotIdx === index) || !slot) {
          return;
        }

        if (slot.is_midnight_passed && slot.show_end_date) {
          const slotStartDate = dayjs(date);
          const slotEndDate = dayjs(slot.show_end_date);

          let currentDate = slotStartDate;
          while (currentDate.isSameOrBefore(slotEndDate, "day")) {
            const dateKey = currentDate.format("YYYY-MM-DD");
            if (!coverageMap.has(dateKey)) {
              coverageMap.set(dateKey, new Set());
              coverageStatus.set(dateKey, {
                coveredByOthers: false,
                slots: [],
              });
            }

            coverageMap.get(dateKey).add(`${date}-${slotIdx}`);
            coverageStatus.get(dateKey).slots.push({
              date,
              index: slotIdx,
              startTime: slot.start_time,
              endDate: slotEndDate,
              originalStartDate: date,
              originalEndDate: slot.show_end_date,
            });

            currentDate = currentDate.add(1, "day");
          }
        }
      });
    });

    // Second pass: Check the proposed coverage for overlaps
    const startDate = dayjs(dateStr);
    const targetEndDate = dayjs(value);
    const datesToUpdate = new Set();

    // Check for any overlapping slots
    for (const [dateKey, coverage] of coverageStatus.entries()) {
      const currentDate = dayjs(dateKey);

      // Only check dates that would be affected by the new range
      if (currentDate.isBetween(startDate, targetEndDate, "day", "[]")) {
        const overlappingSlots = coverage.slots.filter((slot) => {
          const slotStart = dayjs(slot.originalStartDate);
          const slotEnd = dayjs(slot.originalEndDate);

          // Check if the ranges overlap
          return !(
            startDate.isAfter(slotEnd) || targetEndDate.isBefore(slotStart)
          );
        });

        if (overlappingSlots.length > 0) {
          hasConflicts = true;
          conflictingSlots = [
            ...new Set([...conflictingSlots, ...overlappingSlots]),
          ];
        }
      }
    }

    // Collect all dates that would be affected by this change
    let currentDate = startDate;
    while (currentDate.isSameOrBefore(targetEndDate, "day")) {
      datesToUpdate.add(currentDate.format("YYYY-MM-DD"));
      currentDate = currentDate.add(1, "day");
    }

    return {
      hasConflicts,
      conflictingSlots,
      conflictMessage: hasConflicts
        ? `Overlapping time slots found between ${startDate.format(
            "YYYY-MM-DD"
          )} and ${targetEndDate.format("YYYY-MM-DD")}`
        : "",
      datesToUpdate: Array.from(datesToUpdate),
      coverageMap,
      coverageStatus,
    };
  }

  static validateShowEndTime(timeSlots, dateStr, index, value, formValues) {
    if (!timeSlots || !dateStr || index === undefined || !value) {
      return {
        isValid: false,
        message: "Invalid input parameters",
      };
    }

    const normalizedSlots = this.normalizeTimeSlots(timeSlots);
    const currentSlot = normalizedSlots[dateStr]?.[index] || {};
    const formSlot = formValues?.timeSlots?.[dateStr]?.[index] || {};

    // Basic validation checks
    const hasStartTime = Boolean(currentSlot.start_time || formSlot.start_time);
    const isMidnightPassed = Boolean(
      currentSlot.is_midnight_passed || formSlot.is_midnight_passed
    );

    if (!hasStartTime || !isMidnightPassed) {
      return {
        isValid: false,
        message: "Please set start time and enable midnight passed first",
      };
    }

    // Date range validation
    const allDates = Object.keys(timeSlots).sort();
    const firstEventDate = allDates[0];
    const lastEventDate = allDates[allDates.length - 1];
    const selectedEndDate = value.format("YYYY-MM-DD");

    if (selectedEndDate === dateStr) {
      return {
        isValid: false,
        message: "Show end date cannot be same the current slot date",
      };
    }
    if (selectedEndDate < dateStr) {
      return {
        isValid: false,
        message: "Show end date cannot be before the current slot date",
      };
    }

    if (selectedEndDate < firstEventDate || selectedEndDate > lastEventDate) {
      return {
        isValid: false,
        message: `Show end date must be between ${firstEventDate} and ${lastEventDate}`,
      };
    }

    // Check coverage and conflicts
    const coverageResult = this.validateDateCoverage(
      normalizedSlots,
      dateStr,
      index,
      value
    );

    if (coverageResult.hasConflicts) {
      return {
        isValid: true,
        warning: true,
        message: coverageResult.conflictMessage,
        conflictingSlots: coverageResult.conflictingSlots,
        affectedDates: coverageResult.datesToUpdate,
      };
    }

    return {
      isValid: true,
      coverage: coverageResult.coverageStatus,
      affectedDates: coverageResult.datesToUpdate,
    };
  }

  // Add this helper method to handle show end date changes
  static handleShowEndDateChange(timeSlots, dateStr, index, value) {
    const normalizedSlots = this.normalizeTimeSlots(timeSlots);
    const validation = this.validateShowEndTime(
      normalizedSlots,
      dateStr,
      index,
      value,
      {
        timeSlots: normalizedSlots,
      }
    );

    if (!validation.isValid) {
      return {
        isValid: false,
        message: validation.message,
        updates: [],
      };
    }

    // Prepare updates for all affected dates
    const updates = [];

    // Update the current slot
    updates.push({
      dateStr,
      index,
      field: "show_end_date",
      value,
    });

    return {
      isValid: true,
      updates,
      affectedDates: validation.affectedDates,
    };
  }

  static getAffectedDates(startDate, endDate, timeSlots) {
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    const dates = [];

    let current = start;
    while (current.isSameOrBefore(end, "day")) {
      dates.push(current.format("YYYY-MM-DD"));
      current = current.add(1, "day");
    }

    return dates;
  }
}

export default TimeSlotValidator;
