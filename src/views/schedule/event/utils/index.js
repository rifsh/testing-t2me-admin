// utils/index.js
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

export const ScheduleUtil = {
  findConflictingEvents: (testEvent, existingEvents, excludeId = null) => {
    return existingEvents.filter((existingEvent) => {
      if (excludeId && existingEvent.id === excludeId) return false;

      const testStart = testEvent.startTime;
      const testEnd = testEvent.endTime;
      const existingStart = existingEvent.startTime;
      const existingEnd = existingEvent.endTime;

      // Convert to minutes for easier comparison
      const testStartMinutes =
        testStart.day * 1440 + testStart.hour * 60 + (testStart.minute || 0);
      const testEndMinutes =
        testEnd.day * 1440 + testEnd.hour * 60 + (testEnd.minute || 0);
      const existingStartMinutes =
        existingStart.day * 1440 +
        existingStart.hour * 60 +
        (existingStart.minute || 0);
      const existingEndMinutes =
        existingEnd.day * 1440 +
        existingEnd.hour * 60 +
        (existingEnd.minute || 0);

      // Check for overlap
      return (
        testStartMinutes < existingEndMinutes &&
        testEndMinutes > existingStartMinutes
      );
    });
  },

  formatDuration: (startTime, endTime) => {
    const startMinutes = startTime.hour * 60 + (startTime.minute || 0);
    const endMinutes = endTime.hour * 60 + (endTime.minute || 0);
    const durationMinutes = endMinutes - startMinutes;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) return `${minutes}min`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}min`;
  },

  convertEventDataToAPIFormat: (events, allDays) => {
    const show_dates = [];
    const eventsByDate = {};

    // Group events by date
    events.forEach((event) => {
      const dayIndex = event.startTime.day;
      if (dayIndex >= 0 && dayIndex < allDays.length) {
        const dateKey = formatDateForAPI(allDays[dayIndex]);
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }

        eventsByDate[dateKey].push({
          start_time: `${String(event.startTime.hour).padStart(
            2,
            "0"
          )}:${String(event.startTime.minute || 0).padStart(2, "0")}`,
          end_time: `${String(event.endTime.hour).padStart(2, "0")}:${String(
            event.endTime.minute || 0
          ).padStart(2, "0")}`,
          ticket_structure_id: event.ticket_structure_id || event.ticketType,
          ticket_set: event.ticket_set || event.ticketSet,
          seat_structure_id: event.seat_structure_id || event.seatStructure,
          is_midnight: "false",
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

    return show_dates;
  },
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
    "show_dates",
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

  // Validate show_dates structure
  if (eventData.show_dates && Array.isArray(eventData.show_dates)) {
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
    offerIds: "offer_ids",
    couponIds: "coupon_ids",
    // Time slot specific mappings
    startTime: "start_time",
    endTime: "end_time",
    ticketType: "ticket_structure_id",
    ticketSet: "ticket_set",
    seatStructure: "seat_structure_id",
    isMultiDay: "is_multi_date",
  };

  Object.keys(fieldMappings).forEach((camelCase) => {
    if (normalized[camelCase] !== undefined) {
      normalized[fieldMappings[camelCase]] = normalized[camelCase];
      delete normalized[camelCase];
    }
  });

  return normalized;
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

// Updated data preparation function
export const prepareEventDataForSubmission = (formData, scheduleFormData) => {
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
    add_ons: formData.add_ons || [
      {
        name: "USER_AND_FOOD",
        status: true,
      },
    ],
    food_slots: formData.food_slots || [
      {
        id: 1,
        name: "Default Food Slot",
        start_time: "01:00",
        end_time: "06:00",
        num_of_tickets: 23,
      },
    ],
    name: formData.name || "",
    event_id: formData.event_id,
    venue_id: formData.venue_id,
    show_dates: formData.show_dates || [],
    offer_ids: (formData.offer_ids || []).map((offer) => ({
      offer_id: offer.offer_id,
      valid_from: offer.valid_from,
      valid_to: offer.valid_to,
    })),
    coupon_ids: (formData.coupon_ids || []).map((coupon) => ({
      coupon_id: coupon.coupon_id,
      valid_from: coupon.valid_from,
      valid_to: coupon.valid_to,
    })),
  };

  // Validate and normalize the data
  const normalizedData = normalizeEventData(baseData);
  const validation = validateEventData(normalizedData);

  if (!validation.isValid) {
    console.error("Event data validation failed:", validation.errors);
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`);
  }

  return normalizedData;
};
