// utils/validation.js
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

export const formatDateForAPI = (date) => {
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
