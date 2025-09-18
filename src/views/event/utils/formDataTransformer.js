// utils/formDataTransformer.js

/**
 * Transform form data from current structure to API structure
 * @param {Object} formData - Current form data structure
 * @returns {Object} - Transformed data for API submission
 */
export const transformFormDataForAPI = (formData) => {
  const {
    // Basic fields that map directly
    event_name,
    description,
    event_add_on_services,
    event_qna,
    category_id,
    sub_category_id,
    place,
    venue_id,
    tax_ids = [],

    // Fields that need transformation
    selected_ticket_types = {},
    ticket_sets = {},
    selected_seats = {},
    ticket_quantities = {},
    additional_booking_info = [],
    additional_booking_notes = "",

    // Fields that might have different names in old structure
    eventName,
    eventDescription,

    // Default values and calculated fields
    ...rest
  } = formData;

  // Transform ticket structure from nested object to flat array
  const transformTicketStructure = () => {
    const ticketStructure = [];

    // Iterate through each venue's ticket sets
    Object.keys(ticket_sets).forEach((venueId) => {
      const venueTicketSets = ticket_sets[venueId] || {};

      // For each ticket type in this venue
      Object.keys(venueTicketSets).forEach((ticketTypeId) => {
        const ticketSetNames = venueTicketSets[ticketTypeId] || [];

        // Create an entry for each ticket set name
        ticketSetNames.forEach((ticketSetName) => {
          ticketStructure.push({
            id: parseInt(ticketTypeId),
            ticket_set: ticketSetName,
          });
        });
      });
    });

    return ticketStructure;
  };

  // Calculate max capacity from venues (you might need to adjust this logic)
  const calculateMaxCapacity = () => {
    // This is a placeholder calculation
    // You might want to sum up capacity from venue data or use a different logic
    return 900; // Default or calculated value
  };

  // Get the primary venue (first one) for venues field
  const getPrimaryVenue = () => {
    return venue_id && venue_id.length > 0 ? venue_id[0] : null;
  };

  // Get ticket structure ID (you might need different logic here)
  const getTicketStructureId = () => {
    // Get the first ticket type ID from selected_ticket_types
    const venueIds = Object.keys(selected_ticket_types);
    if (venueIds.length > 0) {
      const firstVenueTickets = selected_ticket_types[venueIds[0]];
      return firstVenueTickets && firstVenueTickets.length > 0
        ? firstVenueTickets[0]
        : null;
    }
    return null;
  };

  // Transform additional booking info
  const transformAdditionalBookingInfo = () => {
    return additional_booking_info.map((section) => ({
      sectionTitle: section.sectionTitle,
      sectionItems: section.sectionItems || [],
    }));
  };

  // Build the transformed object
  const transformedData = {
    // Basic information (prioritize form fields over legacy fields)
    event_name: event_name || eventName || "",
    description: description || eventDescription || "",

    // Add-on services and QNA (direct mapping)
    event_add_on_services: event_add_on_services || [],
    event_qna: event_qna || [],

    // Category information
    category_id: category_id || null,
    sub_category_id: sub_category_id || null,

    // Location information
    place: place || "",
    venue_id: venue_id || [],
    tax_ids: tax_ids || [],

    // Venue and capacity information
    venues: getPrimaryVenue(),
    max_capacity: calculateMaxCapacity(),
    venue_ids: venue_id || [], // Duplicate of venue_id for API compatibility

    // Ticket information
    ticket_structure_id: getTicketStructureId(),
    ticket_set: null, // Usually null in the target structure
    ticket_structure: transformTicketStructure(),

    // Offers and coupons (empty by default, you can extend this)
    offer_ids: [],
    coupon_ids: [],

    // Additional booking information
    additional_booking_details: transformAdditionalBookingInfo(),
    additional_notes: additional_booking_notes || "",

    // Default/calculated fields
    max_tickets: 0,
    event_type_id: 1,
    event_seat_structure_id: null,
  };

  console.log("🔄 Data Transformation:");
  console.log("📥 Input data:", formData);
  console.log("📤 Transformed data:", transformedData);
  console.log("🎫 Ticket structure:", transformedData.ticket_structure);

  return transformedData;
};

/**
 * Validate transformed data before API submission
 * @param {Object} transformedData - Data transformed by transformFormDataForAPI
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
export const validateTransformedData = (transformedData) => {
  const errors = [];

  // Required fields validation
  if (!transformedData.event_name || !transformedData.event_name.trim()) {
    errors.push("Event name is required");
  }

  if (!transformedData.description || !transformedData.description.trim()) {
    errors.push("Event description is required");
  }

  if (!transformedData.category_id) {
    errors.push("Category is required");
  }

  if (!transformedData.sub_category_id) {
    errors.push("Sub-category is required");
  }

  if (!transformedData.venue_id || transformedData.venue_id.length === 0) {
    errors.push("At least one venue is required");
  }

  if (
    !transformedData.ticket_structure ||
    transformedData.ticket_structure.length === 0
  ) {
    errors.push("Ticket structure is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Complete transformation and validation utility
 * @param {Object} formData - Original form data
 * @returns {Object} - Result with transformedData, isValid, and errors
 */
export const transformAndValidateFormData = (formData) => {
  try {
    const transformedData = transformFormDataForAPI(formData);
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

// Export all utilities
export default {
  transformFormDataForAPI,
  validateTransformedData,
  transformAndValidateFormData,
};
