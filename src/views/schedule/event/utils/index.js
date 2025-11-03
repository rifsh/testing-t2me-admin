import dayjs from "dayjs";

// All your existing utility functions remain the same...
export const getDaysInMonth = (currentDate) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Previous month's trailing days
  for (let i = 0; i < startingDayOfWeek; i++) {
    const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
    days.push({
      date: prevDate.getDate(),
      fullDate: prevDate,
      isCurrentMonth: false,
    });
  }

  // Current month's days
  for (let day = 1; day <= daysInMonth; day++) {
    const fullDate = new Date(year, month, day);
    days.push({
      date: day,
      fullDate,
      isCurrentMonth: true,
    });
  }

  // Next month's leading days to fill the grid
  const totalCells = Math.ceil(days.length / 7) * 7;
  const remainingCells = totalCells - days.length;

  for (let day = 1; day <= remainingCells; day++) {
    const nextDate = new Date(year, month + 1, day);
    days.push({
      date: day,
      fullDate: nextDate,
      isCurrentMonth: false,
    });
  }

  return days;
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;

  const d1 = new Date(date1);
  const d2 = new Date(date2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

export const isDateInRange = (date, startDate, endDate) => {
  if (!date || !startDate || !endDate) return false;

  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);

  return checkDate >= start && checkDate <= end;
};

export const formatTime = (hour, minute = 0) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
};

export const timeToMinutes = (hour, minute = 0) => {
  return hour * 60 + minute;
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      minute: 0,
      time12: formatTime(hour, 0),
      isHourMark: true,
    });
  }
  return slots;
};

export const getDaysDiff = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
};

export const getTypeColor = (type) => {
  const colors = {
    timeslot: "blue",
    blocked: "red",
    multiday: "purple",
  };
  return colors[type] || "gray";
};

const formatDateForAPI = (date) => {
  if (!date) return null;
  if (typeof date === "string") return date;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatDateTimeForAPI = (dateTime) => {
  if (!dateTime) return null;
  if (typeof dateTime === "string") return dateTime;

  const date = new Date(dateTime);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Validation functions
export const validateEventData = (eventData) => {
  const requiredFields = [
    "start_date",
    "end_date",
    "available_types",
    "max_ticket_per_booking",
    "is_multi_date",
    "booking_start_date_time",
    "ad_start_date_time",
    "name",
    "event_id",
    "venue_id",
  ];

  const errors = [];

  for (const field of requiredFields) {
    if (
      !eventData[field] &&
      eventData[field] !== 0 &&
      eventData[field] !== false
    ) {
      errors.push(`${field} is required`);
    }
  }

  // UPDATED: Validate based on booking type
  const hasShowDates =
    eventData.show_dates &&
    Array.isArray(eventData.show_dates) &&
    eventData.show_dates.length > 0;
  const hasShowSeatDetails =
    eventData.show_seat_details &&
    Array.isArray(eventData.show_seat_details) &&
    eventData.show_seat_details.length > 0;

  if (!hasShowDates && !hasShowSeatDetails) {
    errors.push("Either show_dates or show_seat_details is required");
  }

  // Validate show_dates structure if present
  if (hasShowDates) {
    eventData.show_dates.forEach((showDate, index) => {
      if (!showDate.start_date) {
        errors.push(`show_dates[${index}].start_date is required`);
      }

      if (!showDate.show_times || !Array.isArray(showDate.show_times)) {
        errors.push(`show_dates[${index}].show_times must be an array`);
      } else {
        showDate.show_times.forEach((showTime, timeIndex) => {
          const requiredTimeFields = [
            "start_time",
            "end_time",
            "ticket_structure_id",
            "ticket_set",
          ];

          requiredTimeFields.forEach((timeField) => {
            if (!showTime[timeField] && showTime[timeField] !== 0) {
              errors.push(
                `show_dates[${index}].show_times[${timeIndex}].${timeField} is required`
              );
            }
          });
        });
      }
    });
  }

  // ADDED: Validate show_seat_details structure if present
  if (hasShowSeatDetails) {
    eventData.show_seat_details.forEach((seatDetail, index) => {
      const requiredSeatFields = [
        "start_date",
        "start_time",
        "end_time",
        "event_seat_id",
      ];

      requiredSeatFields.forEach((field) => {
        if (!seatDetail[field] && seatDetail[field] !== 0) {
          errors.push(`show_seat_details[${index}].${field} is required`);
        }
      });
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const normalizeEventData = (eventData) => {
  const normalized = { ...eventData };

  // Convert camelCase to snake_case
  const fieldMappings = {
    startDate: "start_date",
    endDate: "end_date",
    availableTypes: "available_types",
    maxTicketPerBooking: "max_ticket_per_booking",
    isMultiDate: "is_multi_date",
    bookingStartDateTime: "booking_start_date_time",
    adStartDateTime: "ad_start_date_time",
    bookingLimitPerUser: "booking_limit_per_user",
    paymentRequired: "payment_required",
    bookingLimitPerUserToggle: "booking_limit_per_user_toggle",
    addOns: "add_ons",
    foodSlots: "food_slots",
    eventId: "event_id",
    venueId: "venue_id",
    showDates: "show_dates",
    showSeatDetails: "show_seat_details",
    offerIds: "offer_ids",
    couponIds: "coupon_ids",
    // Time slot specific mappings
    startTime: "start_time",
    endTime: "end_time",
    ticketType: "ticket_structure_id",
    ticketSet: "ticket_set",
    seatStructure: "seat_structure_id",
    eventSeatId: "event_seat_id",
    isMultiDay: "is_multi_date",
    isMidnight: "is_midnight",
  };

  Object.keys(fieldMappings).forEach((camelCase) => {
    if (normalized[camelCase] !== undefined) {
      normalized[fieldMappings[camelCase]] = normalized[camelCase];
      delete normalized[camelCase];
    }
  });

  return normalized;
};

// FIXED: Process offers and coupons into three levels
export const processOffersAndCoupons = (
  items,
  itemType = "offer",
  totalAvailableDates = 0
) => {
  const scheduleLevelItems = [];
  const dateLevelItems = new Map();
  const timeLevelItems = new Map();

  items.forEach((item) => {
    const itemData = itemType === "offer" ? item.offer : item.coupons;
    const selectedDates = itemData.selected_dates || [];
    const selectedTimeSlots = itemData.selected_time_slots || [];

    if (selectedTimeSlots.length > 0) {
      // Time Level - specific time slots selected
      selectedTimeSlots.forEach((timeSlotId) => {
        if (!timeLevelItems.has(timeSlotId)) {
          timeLevelItems.set(timeSlotId, []);
        }
        timeLevelItems.get(timeSlotId).push({
          [`${itemType}_id`]: itemData.id,
          valid_from: itemData.start_date,
          valid_to: itemData.end_date,
        });
      });
    } else if (
      selectedDates.length > 0 &&
      selectedDates.length < totalAvailableDates
    ) {
      // Date Level - specific dates selected (not all dates)
      selectedDates.forEach((dateStr) => {
        if (!dateLevelItems.has(dateStr)) {
          dateLevelItems.set(dateStr, []);
        }
        dateLevelItems.get(dateStr).push({
          [`${itemType}_id`]: itemData.id,
          valid_from: dateStr,
          valid_to: dateStr,
        });
      });
    } else {
      // Schedule Level - no specific selection or all dates selected
      scheduleLevelItems.push({
        [`${itemType}_id`]: itemData.id,
        valid_from: itemData.start_date,
        valid_to: itemData.end_date,
      });
    }
  });

  return {
    scheduleLevelItems,
    dateLevelItems,
    timeLevelItems,
  };
};

// FIXED: Update prepareEventDataForSubmission
export const prepareEventDataForSubmission = (formData, scheduleFormData) => {
  // Calculate total available dates
  const totalAvailableDates = (formData.show_dates || []).length;

  // Process offers and coupons
  const offersProcessed = processOffersAndCoupons(
    formData.selected_offers || [],
    "offer",
    totalAvailableDates
  );

  const couponsProcessed = processOffersAndCoupons(
    formData.selected_coupons || [],
    "coupon",
    totalAvailableDates
  );

  // Build show_dates with hierarchical offers/coupons
  const show_dates = (formData.show_dates || []).map((showDate) => {
    const dateStr = showDate.start_date;

    // Get date-level offers/coupons
    const dateOffers = offersProcessed.dateLevelItems.get(dateStr) || [];
    const dateCoupons = couponsProcessed.dateLevelItems.get(dateStr) || [];

    // Process show_times with time-level offers/coupons
    const show_times = (showDate.show_times || []).map((showTime) => {
      const timeSlotId = showTime.show_time_id || showTime.id;

      const timeOffers = offersProcessed.timeLevelItems.get(timeSlotId) || [];
      const timeCoupons = couponsProcessed.timeLevelItems.get(timeSlotId) || [];

      return {
        ...showTime,
        offer_ids: timeOffers,
        coupon_ids: timeCoupons,
      };
    });

    return {
      start_date: dateStr,
      end_date: showDate.end_date || null,
      offer_ids: dateOffers,
      coupon_ids: dateCoupons,
      show_times: show_times,
    };
  });

  const baseData = {
    start_date: formatDateForAPI(
      formData.start_date || scheduleFormData.start_date
    ),
    end_date: formatDateForAPI(formData.end_date || scheduleFormData.end_date),
    available_types: formData.available_types || 2,
    max_ticket_per_booking: String(formData.max_ticket_per_booking || "23"),
    is_multi_date: Boolean(formData.is_multi_date),
    booking_start_date_time: formatDateTimeForAPI(
      formData.booking_start_date_time
    ),
    ad_start_date_time: formatDateTimeForAPI(formData.ad_start_date_time),
    booking_limit_per_user: formData.booking_limit_per_user_toggle
      ? formData.booking_limit_per_user
      : null,
    payment_required: Boolean(formData.payment_required),
    booking_limit_per_user_toggle: Boolean(
      formData.booking_limit_per_user_toggle
    ),
    add_ons: formData.add_ons || [],
    food_slots: formData.food_slots || [],
    name: formData.name || "",
    event_id: formData.event_id,
    venue_id: formData.venue_id,

    // Show dates with hierarchical offers/coupons
    show_dates: show_dates,
    show_seat_details: formData.show_seat_details || [],

    // Schedule-level offers and coupons
    offer_ids: offersProcessed.scheduleLevelItems,
    coupon_ids: couponsProcessed.scheduleLevelItems,
  };

  const normalizedData = normalizeEventData(baseData);
  const validation = validateEventData(normalizedData);

  if (!validation.isValid) {
    console.error("Event data validation failed:", validation.errors);
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  return normalizedData;
};

// Enhanced ScheduleUtil with proper support for both booking types
export const ScheduleUtil = {
  isTimeOverlapping: (event1, event2) => {
    if (
      !event1?.startTime ||
      !event1?.endTime ||
      !event2?.startTime ||
      !event2?.endTime
    ) {
      return false;
    }

    // Convert to minutes for easier comparison
    const event1StartMinutes =
      (event1.startTime.day || 0) * 1440 +
      event1.startTime.hour * 60 +
      (event1.startTime.minute || 0);

    const event1EndMinutes =
      (event1.endTime.day || 0) * 1440 +
      event1.endTime.hour * 60 +
      (event1.endTime.minute || 0);

    const event2StartMinutes =
      (event2.startTime.day || 0) * 1440 +
      event2.startTime.hour * 60 +
      (event2.startTime.minute || 0);

    const event2EndMinutes =
      (event2.endTime.day || 0) * 1440 +
      event2.endTime.hour * 60 +
      (event2.endTime.minute || 0);

    // Check for overlap: events overlap if one starts before the other ends
    return (
      event1StartMinutes < event2EndMinutes &&
      event2StartMinutes < event1EndMinutes
    );
  },

  findConflictingEvents: (testEvent, existingEvents, excludeId = null) => {
    return existingEvents.filter((existingEvent) => {
      if (excludeId && existingEvent.id === excludeId) return false;

      const testStart = testEvent?.startTime;
      const testEnd = testEvent?.endTime;
      const existingStart = existingEvent?.startTime;
      const existingEnd = existingEvent?.endTime;

      // Convert to minutes for easier comparison
      const testStartMinutes =
        testStart?.day * 1440 + testStart?.hour * 60 + (testStart?.minute || 0);
      const testEndMinutes =
        testEnd?.day * 1440 + testEnd?.hour * 60 + (testEnd?.minute || 0);
      const existingStartMinutes =
        existingStart?.day * 1440 +
        existingStart?.hour * 60 +
        (existingStart?.minute || 0);
      const existingEndMinutes =
        existingEnd?.day * 1440 +
        existingEnd?.hour * 60 +
        (existingEnd?.minute || 0);

      // Check for overlap
      return (
        testStartMinutes < existingEndMinutes &&
        testEndMinutes > existingStartMinutes
      );
    });
  },

  formatDuration: (startTime, endTime) => {
    const startMinutes = startTime?.hour * 60 + (startTime?.minute || 0);
    const endMinutes = endTime?.hour * 60 + (endTime?.minute || 0);
    const durationMinutes = endMinutes - startMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  },

  // UPDATED: Enhanced to handle both ticket and seat-based events
  convertEventDataToAPIFormat: (events, allDays, bookingType = "TICKET") => {
    if (bookingType === "SEAT") {
      // Handle seat-based booking
      const show_seat_details = [];

      events.forEach((event) => {
        const dayIndex = event?.startTime?.day;
        if (dayIndex >= 0 && dayIndex < allDays.length) {
          const dateKey = formatDateForAPI(allDays[dayIndex]);

          show_seat_details.push({
            start_date: dateKey,
            start_time: `${String(event?.startTime?.hour || 0).padStart(
              2,
              "0"
            )}:${String(event?.startTime?.minute || 0).padStart(2, "0")}`,
            end_time: `${String(event?.endTime?.hour || 0).padStart(
              2,
              "0"
            )}:${String(event?.endTime?.minute || 0).padStart(2, "0")}`,
            event_seat_id:
              event?.event_seat_id || event?.seatStructureId || null,
            is_midnight: event?.is_midnight || false,
          });
        }
      });

      return { show_seat_details };
    }

    // Handle ticket-based booking (original logic)
    const show_dates = [];
    const eventsByDate = {};

    events.forEach((event) => {
      const dayIndex = event?.startTime?.day;
      if (dayIndex >= 0 && dayIndex < allDays.length) {
        const dateKey = formatDateForAPI(allDays[dayIndex]);
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }

        eventsByDate[dateKey].push({
          start_time: `${String(event?.startTime?.hour || 0).padStart(
            2,
            "0"
          )}:${String(event?.startTime?.minute || 0).padStart(2, "0")}`,
          end_time: `${String(event?.endTime?.hour || 0).padStart(
            2,
            "0"
          )}:${String(event?.endTime?.minute || 0).padStart(2, "0")}`,
          ticket_structure_id:
            event?.ticket_structure_id || event?.ticketType || null,
          ticket_set: event?.ticket_set || event?.ticketSet || "",
          seat_structure_id:
            event?.seat_structure_id || event?.seatStructure || null,
          is_midnight: event?.is_midnight || false,
        });
      }
    });

    // Convert to show_dates format
    Object.keys(eventsByDate).forEach((dateKey) => {
      show_dates.push({
        start_date: dateKey,
        end_date: null,
        show_times: eventsByDate[dateKey],
      });
    });

    return { show_dates };
  },

  // UPDATED: Enhanced restructuring to handle both booking types
  restructuredScheduleDetails: (data) => {
    const bookingType = data?.show_seat_details?.length > 0 ? "SEAT" : "TICKET";

    return {
      // Event Basic Info
      id: data?.id || null,
      name: data?.name || "",
      status: data?.status || false,
      event_id: data?.event?.id || null,
      event_name: data?.event?.event_name || "",

      // Schedule Dates
      start_date: data?.start_date || null,
      end_date: data?.end_date || null,
      ad_start_date_time: data?.ad_start_date_time || null,
      booking_start_date_time: data?.booking_start_date_time || null,

      // Venue Info
      venue_id: data?.venue_id || null,
      venue_name: data?.venue?.name || "",
      venue_description: data?.venue?.description || "",

      // Location Details
      place_id: data?.venue?.place?.id || null,
      place_name: data?.venue?.place?.name || "",
      country_name: data?.venue?.place?.country?.name || "",
      time_zone: data?.venue?.place?.country?.time_zone || "",
      currency_code: data?.venue?.place?.country?.currency_code || "",

      // Booking Type
      booking_type: bookingType,

      // Show Time Details (for ticket-based)
      show_date_id: data?.show_dates?.[0]?.id || null,
      show_time_id: data?.show_dates?.[0]?.show_times?.[0]?.id || null,
      show_start_time:
        data?.show_dates?.[0]?.show_times?.[0]?.start_time || null,
      show_end_time: data?.show_dates?.[0]?.show_times?.[0]?.end_time || null,

      // Ticket Structure (for ticket-based)
      ticket_structure_id:
        data?.show_dates?.[0]?.show_times?.[0]?.event_ticket_structures?.id ||
        null,
      ticket_structure_name:
        data?.show_dates?.[0]?.show_times?.[0]?.event_ticket_structures
          ?.ticket_structure?.name || "",
      ticket_set:
        data?.show_dates?.[0]?.show_times?.[0]?.event_ticket_structures
          ?.ticket_set || "",

      // Show Time Ticket Types (List)
      show_time_ticket_types:
        data?.show_dates?.[0]?.show_times?.[0]?.show_time_ticket_types || [],

      // Seat Details (for seat-based)
      show_seat_details: data?.show_seat_details || [],
      show_dates: data?.show_dates || [],

      // Additional Settings
      is_multi_date: data?.is_multi_date || false,
      max_ticket_per_booking: data?.max_ticket_per_booking || 0,
      available_types: data?.available_types || "ticket_structure",

      // Offers and Coupons
      offer_schedule: data?.offer_schedule || [],
      coupon_schedule: data?.coupon_schedule || [],
      schedule_status: data?.schedule_status || null,

      // Add-ons and Food Slots
      payment_required: data?.payment_required || false,
      booking_limit_per_user_toggle:
        data?.booking_limit_per_user_toggle || false,
      booking_limit_per_user: data?.booking_limit_per_user || null,
      add_ons: data?.add_ons || [],
      add_ons_slim: data?.add_ons_slim || [],
      food_slots: data?.food_slots || [],
      food_slots_slim: data?.food_slots_slim || [],
    };
  },

  // In your utils file - Update createFormValues
  createFormValues: (scheduleDetails) => {
    const scheduleData =
      ScheduleUtil.restructuredScheduleDetails(scheduleDetails);

    // FIXED: Transform add_ons properly
    let addOnsArray = [];
    if (scheduleData.add_ons_slim && Array.isArray(scheduleData.add_ons_slim)) {
      addOnsArray = scheduleData.add_ons_slim
        .filter((item) => item && item.name && item.status === true)
        .map((item) => item.name);
    } else if (scheduleData.add_ons && Array.isArray(scheduleData.add_ons)) {
      addOnsArray = scheduleData.add_ons
        .map((item) => {
          if (typeof item === "string") return item;
          if (item && item.name) return item.name;
          return null;
        })
        .filter(Boolean);
    }

    console.log("🔧 createFormValues - add_ons transformation:", {
      input: scheduleData.add_ons_slim || scheduleData.add_ons,
      output: addOnsArray,
    });

    return {
      event_id: scheduleData.event_id || null,
      name: scheduleData.name || "",
      start_date: scheduleData.start_date
        ? dayjs(scheduleData.start_date)
        : null,
      venue_id: scheduleData.venue_id || null,
      booking_type: scheduleData.booking_type,
      max_ticket_per_booking: scheduleData.max_ticket_per_booking || 0,
      is_multi_date: scheduleData.is_multi_date || false,
      end_date: scheduleData.end_date ? dayjs(scheduleData.end_date) : null,
      booking_limit_per_user: scheduleData.booking_limit_per_user || 1,
      booking_limit_per_user_toggle:
        scheduleData.booking_limit_per_user_toggle || false,
      payment_required: scheduleData.payment_required || false,
      booking_start_date_time: scheduleData.booking_start_date_time
        ? dayjs(scheduleData.booking_start_date_time)
        : null,
      ad_start_date_time: scheduleData.ad_start_date_time
        ? dayjs(scheduleData.ad_start_date_time)
        : null,

      // FIXED: Return array of addon names
      add_ons: addOnsArray,

      // Include food_slots
      food_slots: scheduleData.food_slots_slim || [],

      show_time_ticket_types:
        scheduleData.show_time_ticket_types?.map((ticket) => ({
          id: ticket.id,
          ticket_type_id: ticket.ticket_type_id,
          ticket_used_count: ticket.ticket_used_count,
        })) || [],

      available_types: scheduleData.available_types || "ticket_structure",

      // Include offer and coupon schedules
      offer_ids: scheduleData.offer_schedule || [],
      coupon_ids: scheduleData.coupon_schedule || [],
    };
  },
};

// Export all utilities
export default {
  getDaysInMonth,
  isSameDay,
  isDateInRange,
  formatTime,
  timeToMinutes,
  generateTimeSlots,
  getDaysDiff,
  getTypeColor,
  formatDateForAPI,
  validateEventData,
  normalizeEventData,
  formatDateTimeForAPI,
  prepareEventDataForSubmission,
  processOffersAndCoupons,
  ScheduleUtil,
};
