// utils/formDataTransformer.js

/**
 * Transform form data from current structure to API structure
 * @param {Object} formData - Current form data structure
 * @returns {Object} - Transformed data for API submission
 */
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
    eventId = null
  } = additionalContext;

  console.log('🔄 Starting data transformation...');
  console.log('📥 Input form data:', formData);
  console.log('📥 Additional context:', additionalContext);

  // Transform ticket structure from nested object to flat array
  const transformTicketStructure = () => {
    const ticketStructure = [];
    const ticketSets = formData.ticket_sets || {};

    Object.keys(ticketSets).forEach((venueId) => {
      const venueTicketSets = ticketSets[venueId] || {};
      
      Object.keys(venueTicketSets).forEach((ticketTypeId) => {
        const ticketSetNames = venueTicketSets[ticketTypeId] || [];
        
        ticketSetNames.forEach((ticketSetName) => {
          ticketStructure.push({
            id: parseInt(ticketTypeId),
            ticket_set: ticketSetName,
          });
        });
      });
    });

    console.log('🎫 Transformed ticket structure:', ticketStructure);
    return ticketStructure;
  };

  // Get max capacity - you might need to calculate this based on your business logic
  const calculateMaxCapacity = () => {
    // Option 1: Use form data if available
    if (formData.max_capacity) {
      return parseInt(formData.max_capacity);
    }
    
    // Option 2: Calculate from venue capacities
    if (selectedVenueList && selectedVenueList.length > 0) {
      const totalCapacity = selectedVenueList.reduce((total, venue) => {
        return total + (venue.capacity || 0);
      }, 0);
      return totalCapacity;
    }
    
    // Option 3: Default value
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
    
    // Fallback: get from selected ticket types
    const selectedTicketTypes = formData.selected_ticket_types || {};
    const venueIds = Object.keys(selectedTicketTypes);
    
    if (venueIds.length > 0) {
      const firstVenueTickets = selectedTicketTypes[venueIds[0]];
      return firstVenueTickets && firstVenueTickets.length > 0 ? firstVenueTickets[0] : 1;
    }
    
    return 1; // Default
  };

  // Transform file objects to the expected format
  const transformFileFields = (fileField) => {
    if (!fileField || !Array.isArray(fileField)) return null;
    
    return fileField.map((file, index) => ({
      uid: file.uid || `${Date.now()}-${index}`,
      name: file.name || `file-${index}`,
      status: file.status || 'done',
      url: file.url || file.thumbUrl || '',
      originFileObj: file.originFileObj || {},
      thumbUrl: file.thumbUrl || file.url || ''
    }));
  };

  // Build the transformed object
  const transformedData = {
    // Basic information
    event_name: formData.event_name || '',
    description: formData.description || '',
    
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
    place: formData.place || '',
    venue_ids: formData.venue_id || [],
    tax_ids: formData.tax_ids || [],
    
    // Venue and capacity information
    venues: getPrimaryVenue(),
    max_capacity: calculateMaxCapacity(),
    venue_ids: formData.venue_id || [],
    
    // Ticket information
    ticket_structure_id: getTicketStructureId(),
    ticket_set: null,
    ticket_structure: transformTicketStructure(),
    
    // Offers and coupons
    offer_ids: selectedOffers.map(offer => offer.id),
    coupon_ids: selectedCoupons.map(coupon => coupon.id),
    
    // Additional booking information
    additional_booking_details: formData.additional_booking_info || [],
    additional_notes: formData.additional_booking_notes || '',
    
    // Default/calculated fields
    max_tickets: parseInt(formData.max_tickets || '0', 10),
    event_type_id: formData.event_type_id,
    event_seat_structure_id: availableSeats && availableSeats.length > 0 
      ? availableSeats.map(item => item.id) 
      : null,
    
    // Include lead_id if in create mode
    ...(eventId && { lead_id: eventId })
  };

  console.log('📤 Transformed data:', transformedData);
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

  if (!transformedData.venue_id || transformedData.venue_id.length === 0) {
    errors.push("At least one venue is required");
  }

  if (!transformedData.ticket_structure || transformedData.ticket_structure.length === 0) {
    errors.push("Ticket structure is required");
  }

  // Validate file uploads
  if (!transformedData.thumbnail_image || transformedData.thumbnail_image.length === 0) {
    errors.push("Thumbnail image is required");
  }

  if (!transformedData.banner_images || transformedData.banner_images.length === 0) {
    errors.push("At least one banner image is required");
  }

  console.log('🔍 Validation result:', { isValid: errors.length === 0, errors });

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
