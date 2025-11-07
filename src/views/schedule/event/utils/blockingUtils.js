// ==================== BLOCKING UTILITY FUNCTIONS ====================

/**
 * Get comprehensive blocking info from schedule details
 */
export const getBlockingInfo = (checkedScheduleDetails) => {
  if (!checkedScheduleDetails) {
    return {
      isScheduleBlocked: false,
      isVenueBlocked: false,
      isPlaceBlocked: false,
      blockedDates: new Set(),
      blockedTimeSlots: new Map(), // Map<dateId, Set<timeSlotId>>
      blockingTicketIds: [],
      blockingSeatIds: [],
      couponEditable: true,
      offerEditable: true,
      venueEditable: true,
      placeEditable: true,
      scheduleEditableStatus: true,
    };
  }

  // Global blocking flags - if venue or place is not editable, entire schedule is affected
  const isVenueBlocked = checkedScheduleDetails.venue_editable === false;
  const isPlaceBlocked = checkedScheduleDetails.place_editable === false;
  const isScheduleBlocked = checkedScheduleDetails.editable === false;
  const isScheduleEditableStatus =
    isScheduleBlocked || isVenueBlocked || isPlaceBlocked;

  const blockedDates = new Set();
  const blockedTimeSlots = new Map(); // Map<showDateId, Set<showTimeId>>

  // Process show_dates and show_times
  if (
    checkedScheduleDetails.show_dates &&
    Array.isArray(checkedScheduleDetails.show_dates)
  ) {
    checkedScheduleDetails.show_dates.forEach((dateInfo) => {
      const dateId = dateInfo.show_date_id;

      // If entire date is blocked
      if (dateInfo.editable === false) {
        blockedDates.add(dateId);
      } else {
        // Check individual time slots
        const blockedTimes = new Set();
        if (dateInfo.show_times && Array.isArray(dateInfo.show_times)) {
          dateInfo.show_times.forEach((timeSlot) => {
            if (
              timeSlot.editable === false ||
              (timeSlot.blocking_ticket_ids &&
                timeSlot.blocking_ticket_ids.length > 0)
            ) {
              blockedTimes.add(timeSlot.show_time_id);
            }
          });
        }

        // Only add to map if there are blocked times
        if (blockedTimes.size > 0) {
          blockedTimeSlots.set(dateId, blockedTimes);
        }
      }
    });
  }

  return {
    isScheduleBlocked,
    isVenueBlocked,
    isPlaceBlocked,
    isScheduleEditableStatus,
    blockedDates,
    blockedTimeSlots,
    blockingTicketIds: checkedScheduleDetails.blocking_ticket_ids || [],
    blockingSeatIds: checkedScheduleDetails.blocking_seat_ids || [],
    couponEditable: checkedScheduleDetails.coupon_editable !== false,
    offerEditable: checkedScheduleDetails.offer_editable !== false,
    venueEditable: checkedScheduleDetails.venue_editable !== false,
    placeEditable: checkedScheduleDetails.place_editable !== false,
  };
};

/**
 * Check if a specific event can be edited
 */
export const canEditEvent = (
  eventId,
  eventShowDateId,
  eventShowTimeId,
  blockingInfo
) => {
  if (!blockingInfo) return true;

  // If schedule is globally blocked
  if (
    blockingInfo.isScheduleBlocked ||
    blockingInfo.isVenueBlocked ||
    blockingInfo.isPlaceBlocked
  ) {
    return false;
  }

  // If entire date is blocked
  if (blockingInfo.blockedDates.has(eventShowDateId)) {
    return false;
  }

  // If specific time slot is blocked
  const timeSlots = blockingInfo.blockedTimeSlots.get(eventShowDateId);
  if (timeSlots && timeSlots.has(eventShowTimeId)) {
    return false;
  }

  return true;
};

/**
 * Format date consistently (YYYY-MM-DD)
 */
export const formatDateForAPI = (date) => {
  if (!date) return null;

  if (typeof date === "string") {
    // If already a string date, validate and return
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Try to parse it
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date;
  }

  // Convert Date object to YYYY-MM-DD
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return null;
};

/**
 * Format date time consistently (YYYY-MM-DD HH:mm)
 */
export const formatDateTimeForAPI = (date) => {
  if (!date) return null;

  if (date instanceof Date) {
    if (isNaN(date.getTime())) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return null;
};

/**
 * Get blocked dates as a Set of YYYY-MM-DD strings
 * ✅ FIXED: Now works with actual API response structure
 */
export const getBlockedDatesSet = (
  scheduleFormData,
  blockingInfo,
  checkedScheduleDetails
) => {
  const blockedDates = new Set();

  console.log("🔍 getBlockedDatesSet called with:", {
    hasScheduleFormData: !!scheduleFormData,
    hasBlockingInfo: !!blockingInfo,
    hasCheckedScheduleDetails: !!checkedScheduleDetails,
    showDatesLength: checkedScheduleDetails?.show_dates?.length || 0,
  });

  // ✅ FIX 1: Return empty set if critical data missing
  if (!checkedScheduleDetails || !checkedScheduleDetails.show_dates) {
    console.log(
      "⚠️ No checkedScheduleDetails or show_dates - returning empty set"
    );
    return blockedDates;
  }

  // ✅ FIX 2: Extract dates from show_dates array
  // Each show_date has: id, start_date, end_date, show_times
  // show_times has bookings indicated by ticket_used_count > 0
  checkedScheduleDetails.show_dates.forEach((showDate) => {
    // Get the date string (YYYY-MM-DD format)
    const dateStr = showDate.start_date;

    if (!dateStr) {
      console.log("⚠️ show_date has no start_date:", showDate);
      return;
    }

    // ✅ FIX 3: Check if this date has ANY show times with BOOKINGS
    // A date is "blocked" if it has show_times with ticket_used_count > 0
    const hasBookings =
      showDate.show_times && showDate.show_times.length > 0
        ? showDate.show_times.some((showTime) => {
            // Check if this time slot has any booked tickets
            const hasTicketBookings = showTime.show_time_ticket_types
              ? showTime.show_time_ticket_types.some(
                  (ticketType) => ticketType.ticket_used_count > 0
                )
              : false;

            console.log(`  📅 ${dateStr} - TimeSlot ${showTime.id}:`, {
              ticketTypesCount: showTime.show_time_ticket_types?.length || 0,
              hasTicketBookings,
            });

            return hasTicketBookings;
          })
        : false;

    if (hasBookings) {
      blockedDates.add(dateStr);
      console.log(`  ✅ Added to blocked dates: ${dateStr}`);
    }
  });

  console.log("📊 Final blocked dates set:", {
    count: blockedDates.size,
    dates: Array.from(blockedDates),
  });

  return blockedDates;
};

/**
 * Check if a date can be selected in the calendar
 */
export const canSelectDate = (
  dateStr,
  blockingInfo,
  checkedScheduleDetails
) => {
  if (!blockingInfo) return true;

  // If schedule is globally blocked, cannot select any dates
  if (
    blockingInfo.isScheduleBlocked ||
    blockingInfo.isVenueBlocked ||
    blockingInfo.isPlaceBlocked
  ) {
    return false;
  }

  // Check if this date is in the blocked dates list
  if (checkedScheduleDetails?.show_dates) {
    const showDate = checkedScheduleDetails.show_dates.find(
      (sd) => sd.start_date === dateStr
    );

    if (showDate && blockingInfo.blockedDates.has(showDate.show_date_id)) {
      return false;
    }
  }

  return true;
};

/**
 * Check if a time slot can be selected on a specific date
 */
export const canSelectTimeSlot = (
  dateStr,
  showTimeId,
  blockingInfo,
  checkedScheduleDetails
) => {
  if (!blockingInfo) return true;

  // If schedule is globally blocked
  if (
    blockingInfo.isScheduleBlocked ||
    blockingInfo.isVenueBlocked ||
    blockingInfo.isPlaceBlocked
  ) {
    return false;
  }

  // Find the show_date for this date
  if (checkedScheduleDetails?.show_dates) {
    const showDate = checkedScheduleDetails.show_dates.find(
      (sd) => sd.start_date === dateStr
    );

    if (!showDate) return true;

    // Check if entire date is blocked
    if (blockingInfo.blockedDates.has(showDate.show_date_id)) {
      return false;
    }

    // Check if this specific time slot is blocked
    const timeSlots = blockingInfo.blockedTimeSlots.get(showDate.show_date_id);
    if (timeSlots && timeSlots.has(showTimeId)) {
      return false;
    }
  }

  return true;
};

/**
 * Validate date range against blocking info
 */
export const validateDateRange = (
  startDate,
  endDate,
  blockingInfo,
  checkedScheduleDetails
) => {
  if (!blockingInfo || !checkedScheduleDetails?.show_dates) {
    return { isValid: true, message: "" };
  }

  // If schedule is completely blocked, cannot change dates
  if (
    blockingInfo.isScheduleBlocked ||
    blockingInfo.isVenueBlocked ||
    blockingInfo.isPlaceBlocked
  ) {
    return {
      isValid: false,
      message:
        "Schedule is locked and cannot be modified due to active bookings",
    };
  }

  // Check if any of the dates in the new range have blocking issues
  const startDateStr = formatDateForAPI(startDate);
  const endDateStr = formatDateForAPI(endDate);

  if (!startDateStr || !endDateStr) {
    return { isValid: false, message: "Invalid date format" };
  }

  // Check each date in the range
  const current = new Date(startDateStr);
  const end = new Date(endDateStr);

  while (current <= end) {
    const currentDateStr = formatDateForAPI(current);
    if (!canSelectDate(currentDateStr, blockingInfo, checkedScheduleDetails)) {
      return {
        isValid: false,
        message: `Date ${currentDateStr} is locked due to active bookings`,
      };
    }
    current.setDate(current.getDate() + 1);
  }

  return { isValid: true, message: "" };
};

/**
 * Get blocking message for UI display
 */
export const getBlockingMessage = (blockingInfo) => {
  if (!blockingInfo) return null;

  // Global blocking (most severe)
  if (blockingInfo.isScheduleBlocked) {
    return {
      title: "Schedule Cannot Be Edited",
      message:
        "This schedule has active bookings and cannot be modified. All editing actions are disabled.",
      level: "schedule",
      severity: "critical",
    };
  }

  // Venue blocking
  if (blockingInfo.isVenueBlocked) {
    return {
      title: "Venue Cannot Be Modified",
      message:
        "The venue for this schedule has active bookings and cannot be changed. All date and time modifications are blocked.",
      level: "venue",
      severity: "critical",
    };
  }

  // Place blocking
  if (blockingInfo.isPlaceBlocked) {
    return {
      title: "Place Cannot Be Modified",
      message:
        "The place for this schedule has active bookings and cannot be changed. All date and time modifications are blocked.",
      level: "place",
      severity: "critical",
    };
  }

  // Date-level blocking
  const blockedDatesCount = blockingInfo.blockedDates.size;
  if (blockedDatesCount > 0) {
    return {
      title: "Some Dates Are Locked",
      message: `${blockedDatesCount} date(s) have active bookings and cannot be edited. Other dates and time slots can still be modified.`,
      level: "date",
      severity: "warning",
      count: blockedDatesCount,
    };
  }

  // Time slot blocking
  const blockedTimeSlotsCount = Array.from(
    blockingInfo.blockedTimeSlots.values()
  ).reduce((sum, set) => sum + set.size, 0);

  if (blockedTimeSlotsCount > 0) {
    return {
      title: "Some Time Slots Are Locked",
      message: `${blockedTimeSlotsCount} time slot(s) have active bookings and cannot be edited. Other time slots can still be modified.`,
      level: "timeSlot",
      severity: "warning",
      count: blockedTimeSlotsCount,
    };
  }

  return null;
};

// ==================== CALENDAR WIDGET UPDATES ====================

/**
 * Updated CalendarWidget props for blocking
 */
export const getCalendarWidgetProps = (
  blockingInfo,
  checkedScheduleDetails,
  scheduleFormData
) => {
  const blockedDatesSet = getBlockedDatesSet(
    scheduleFormData,
    blockingInfo,
    checkedScheduleDetails
  );

  return {
    blockedDates: blockedDatesSet,
    isScheduleBlocked: blockingInfo?.isScheduleEditableStatus || false,
    isEditMode: true,
    canSelectDate: (dateStr) =>
      canSelectDate(dateStr, blockingInfo, checkedScheduleDetails),
  };
};

// ==================== DATE PICKER UPDATES ====================

/**
 * Updated CompactDateTimePicker props for blocking
 */
export const getDateTimePickerProps = (
  blockingInfo,
  checkedScheduleDetails
) => {
  const blockedDatesSet = getBlockedDatesSet(
    {},
    blockingInfo,
    checkedScheduleDetails
  );

  return {
    blockedDates: blockedDatesSet,
    isScheduleBlocked: blockingInfo?.isScheduleEditableStatus || false,
    disabled: blockingInfo?.isScheduleEditableStatus || false,
  };
};
