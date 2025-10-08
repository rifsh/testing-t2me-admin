// utils/formDataTransformer.js

/**
 * Transform form data from current structure to API structure
 */
export const transformFormDataForAPI = (formData, additionalContext = {}) => {
  const {
    selectedOffers = [],
    selectedCoupons = [],
    selectedVenueList = [],
    ticketTypes = [],
    availableSeats = [],
    eventId = null,
  } = additionalContext;

  console.log("🔄 Starting data transformation...");
  console.log("📥 Input form data:", formData);
  console.log("📥 Additional context:", additionalContext);

  // Transform seat structure - Extract seat IDs where selected
  const transformSeatStructure = () => {
    const seatStructure = [];
    const selectedSeats = formData.selected_seats || {};

    Object.entries(selectedSeats).forEach(([venueId, seatsObj]) => {
      if (seatsObj && typeof seatsObj === "object") {
        // Extract seat IDs where value is true
        const seatIds = Object.entries(seatsObj)
          .filter(([seatId, isSelected]) => isSelected === true)
          .map(([seatId, _]) => parseInt(seatId));

        if (seatIds.length > 0) {
          seatStructure.push({
            venue_id: parseInt(venueId),
            seat_ids: seatIds,
          });
        }
      }
    });

    console.log("🪑 Transformed seat structure:", seatStructure);
    return seatStructure;
  };

  // Transform ticket structure from nested object to flat array
  const transformTicketStructure = () => {
    const ticketStructure = [];
    const selectedTicketTypes = formData.selected_ticket_types || {};
    const ticketSets = formData.ticket_sets || {};

    // Iterate through each venue's selected ticket types
    Object.entries(selectedTicketTypes).forEach(([venueId, ticketTypeIds]) => {
      if (!Array.isArray(ticketTypeIds) || ticketTypeIds.length === 0) return;

      ticketTypeIds.forEach((ticketTypeId) => {
        const ticketSetNames =
          ticketSets?.[venueId]?.[String(ticketTypeId)] || [];

        // Only add if ticket sets are selected
        if (ticketSetNames.length > 0) {
          ticketSetNames.forEach((ticketSetName) => {
            ticketStructure.push({
              id: parseInt(ticketTypeId),
              ticket_set: ticketSetName,
            });
          });
        }
      });
    });

    console.log("🎫 Transformed ticket structure:", ticketStructure);
    return ticketStructure;
  };

  // Get seat structure IDs - returns array of integers, not JSON string
  const getSeatStructureIds = () => {
    const selectedSeats = formData.selected_seats || {};
    const seatStructureIds = [];

    Object.entries(selectedSeats).forEach(([venueId, seatsObj]) => {
      if (seatsObj && typeof seatsObj === "object") {
        // Get all selected seat IDs
        const seatIds = Object.entries(seatsObj)
          .filter(([seatId, isSelected]) => isSelected === true)
          .map(([seatId, _]) => parseInt(seatId));

        seatStructureIds.push(...seatIds);
      }
    });

    // Return unique seat structure IDs as plain array
    return [...new Set(seatStructureIds)];
  };

  // Get max capacity
  const calculateMaxCapacity = () => {
    if (formData.max_capacity) {
      return parseInt(formData.max_capacity);
    }

    if (selectedVenueList && selectedVenueList.length > 0) {
      const totalCapacity = selectedVenueList.reduce((total, venue) => {
        return total + (venue.capacity || 0);
      }, 0);
      return totalCapacity;
    }

    return 1200;
  };

  // Get primary venue ID
  const getPrimaryVenue = () => {
    const venueIds = formData.venue_id || [];
    return venueIds.length > 0 ? venueIds[0] : null;
  };

  // Get ticket structure ID
  const getTicketStructureId = () => {
    if (formData.ticket_structure_id) {
      return formData.ticket_structure_id;
    }

    const selectedTicketTypes = formData.selected_ticket_types || {};
    const venueIds = Object.keys(selectedTicketTypes);

    if (venueIds.length > 0) {
      const firstVenueTickets = selectedTicketTypes[venueIds[0]];
      return firstVenueTickets && firstVenueTickets.length > 0
        ? firstVenueTickets[0]
        : 1;
    }

    return 1;
  };

  // Transform file objects to the expected format
  const transformFileFields = (fileField) => {
    if (!fileField || !Array.isArray(fileField)) return null;

    return fileField.map((file, index) => ({
      uid: file.uid || `${Date.now()}-${index}`,
      name: file.name || `file-${index}`,
      status: file.status || "done",
      url: file.url || file.thumbUrl || "",
      originFileObj: file.originFileObj || {},
      thumbUrl: file.thumbUrl || file.url || "",
    }));
  };

  // Build the transformed object
  const transformedData = {
    // Basic information
    event_name: formData.event_name || "",
    description: formData.description || "",

    // File uploads
    thumbnail_image: transformFileFields(formData.thumbnail_image),
    banner_images: transformFileFields(formData.banner_images),
    event_images: transformFileFields(formData.event_images),

    // Add-on services and QNA
    event_add_on_services: formData.event_add_on_services || [],
    event_qna: formData.event_qna || [],

    // Category information
    category_id: formData.category_id || null,
    sub_category_id: formData.sub_category_id || null,

    // Location information
    place: formData.place || "",
    place_id: formData.place_id || null,
    venue_ids: formData.venue_id || [],
    tax_ids: formData.tax_ids || [],

    // Venue and capacity information
    venues: getPrimaryVenue(),
    max_capacity: calculateMaxCapacity(),

    // FIXED: Seat configuration - returns array of objects
    seat_structure: transformSeatStructure(),

    // FIXED: Seat structure IDs - returns plain array of integers [1, 11], NOT "[1, 11]"
    event_seat_structure_id: getSeatStructureIds(),

    // Ticket information
    ticket_structure_id: getTicketStructureId(),
    ticket_structure: transformTicketStructure(),

    // Offers and coupons
    offer_ids: selectedOffers.map((offer) => offer.id),
    coupon_ids: selectedCoupons.map((coupon) => coupon.id),

    // Additional booking information
    additional_booking_details: formData.additional_booking_info || [],
    additional_notes: formData.additional_booking_notes || "",

    // Default/calculated fields
    max_tickets: parseInt(formData.max_tickets || "0", 10),
    event_type_id: formData.event_type_id,

    // Include lead_id if in create mode
    ...(eventId && { lead_id: eventId }),
  };

  console.log("📤 Transformed data:", transformedData);
  console.log("🪑 Seat structure:", transformedData.seat_structure);
  console.log("🎫 Ticket structure:", transformedData.ticket_structure);
  console.log(
    "🆔 Seat structure IDs:",
    transformedData.event_seat_structure_id
  );

  return transformedData;
};

/**
 * Validate transformed data before API submission
 */
export const validateTransformedData = (transformedData) => {
  const errors = [];

  if (!transformedData.event_name?.trim()) {
    errors.push("Event name is required");
  }

  if (!transformedData.description?.trim()) {
    errors.push("Event description is required");
  }

  if (!transformedData.category_id) {
    errors.push("Category is required");
  }

  if (!transformedData.sub_category_id) {
    errors.push("Sub-category is required");
  }

  if (!transformedData.venue_ids || transformedData.venue_ids.length === 0) {
    errors.push("At least one venue is required");
  }

  const hasSeatStructure =
    transformedData.seat_structure && transformedData.seat_structure.length > 0;
  const hasTicketStructure =
    transformedData.ticket_structure &&
    transformedData.ticket_structure.length > 0;

  if (!hasSeatStructure && !hasTicketStructure) {
    errors.push("At least one seat structure or ticket structure is required");
  }

  if (
    !transformedData.thumbnail_image ||
    transformedData.thumbnail_image.length === 0
  ) {
    errors.push("Thumbnail image is required");
  }

  if (
    !transformedData.banner_images ||
    transformedData.banner_images.length === 0
  ) {
    errors.push("At least one banner image is required");
  }

  console.log("🔍 Validation result:", {
    isValid: errors.length === 0,
    errors,
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Complete transformation and validation utility
 */
export const transformAndValidateFormData = (
  formData,
  additionalContext = {}
) => {
  try {
    const transformedData = transformFormDataForAPI(
      formData,
      additionalContext
    );
    const validation = validateTransformedData(transformedData);

    return {
      transformedData,
      isValid: validation.isValid,
      errors: validation.errors,
    };
  } catch (error) {
    console.error("❌ Transformation error:", error);
    return {
      transformedData: null,
      isValid: false,
      errors: ["Data transformation failed: " + error.message],
    };
  }
};

export default {
  transformFormDataForAPI,
  validateTransformedData,
  transformAndValidateFormData,
};
