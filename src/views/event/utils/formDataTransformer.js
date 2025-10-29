// utils/formDataTransformer.js

/**
 * Helper function to determine media type from file
 */
const getMediaType = (file) => {
  // Check if type property exists
  if (file.type) {
    return file.type.startsWith("video/") ? "video" : "image";
  }

  // Check file extension as fallback
  const fileName = file.name || file.file_name || file.fileName || "";
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
  const isVideo = videoExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

  return isVideo ? "video" : "image";
};

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
    const selectedSeats =
      formData.selected_seats || formData.selectedseats || {};

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
    const selectedTicketTypes =
      formData.selected_ticket_types || formData.selectedtickettypes || {};
    const ticketSets = formData.ticket_sets || formData.ticketsets || {};

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
    const selectedSeats =
      formData.selected_seats || formData.selectedseats || {};
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
    if (formData.max_capacity || formData.maxcapacity) {
      return parseInt(formData.max_capacity || formData.maxcapacity);
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
    const venueIds = formData.venue_id || formData.venueid || [];
    return venueIds.length > 0 ? venueIds[0] : null;
  };

  // Get ticket structure ID
  const getTicketStructureId = () => {
    if (formData.ticket_structure_id || formData.ticketstructureid) {
      return formData.ticket_structure_id || formData.ticketstructureid;
    }

    const selectedTicketTypes =
      formData.selected_ticket_types || formData.selectedtickettypes || {};
    const venueIds = Object.keys(selectedTicketTypes);

    if (venueIds.length > 0) {
      const firstVenueTickets = selectedTicketTypes[venueIds[0]];
      return firstVenueTickets && firstVenueTickets.length > 0
        ? firstVenueTickets[0]
        : 1;
    }

    return 1;
  };

  /**
   * Transform thumbnail image to API format
   * Returns object with file_name and media_type, or null
   */
  const transformThumbnailImage = (fileField) => {
    console.log("🔍 transformThumbnailImage input:", fileField);

    if (!fileField || !Array.isArray(fileField) || fileField.length === 0) {
      console.log("❌ Thumbnail is null/empty");
      return null;
    }

    const file = fileField[0];
    console.log("✅ Processing thumbnail file:", file);

    const result = {
      file_name: file.name || file.file_name || file.fileName || null,
      media_type: "image",
    };

    console.log("✅ Thumbnail result:", result);
    return result;
  };

  /**
   * Transform multiple images/videos to API format
   * Returns array of objects with file_name and media_type
   */
  const transformMultipleMedia = (fileField) => {
    console.log("🔍 transformMultipleMedia input:", fileField);

    if (!fileField || !Array.isArray(fileField) || fileField.length === 0) {
      return [];
    }

    return fileField.map((file) => {
      const mediaType = getMediaType(file);

      return {
        id: file.id || null,
        file_name: file.name || file.file_name || file.fileName || null,
        media_type: mediaType,
      };
    });
  };

  // ✅ Extract field names with both naming conventions (underscore and camelCase)
  const thumbnailImage = formData.thumbnail_image || formData.thumbnailimage;
  const bannerImages = formData.banner_images || formData.bannerimages;
  const eventImages = formData.event_images || formData.eventimages;

  console.log("🖼️ Raw thumbnail_image from formData:", thumbnailImage);
  console.log("🖼️ Raw banner_images from formData:", bannerImages);
  console.log("🖼️ Raw event_images from formData:", eventImages);

  // Build the transformed object
  const transformedData = {
    // Basic information
    event_name: formData.event_name || formData.eventname || "",
    description: formData.description || "",

    // ✅ File uploads - Use extracted field variables with both conventions
    thumbnail_image: transformThumbnailImage(thumbnailImage),
    banner_images: transformMultipleMedia(bannerImages),
    event_images: transformMultipleMedia(eventImages),

    // Add-on services and QNA
    event_add_on_services:
      formData.event_add_on_services || formData.eventaddonservices || [],
    event_qna: formData.event_qna || formData.eventqna || [],

    // Category information
    category_id: formData.category_id || formData.categoryid || null,
    sub_category_id: formData.sub_category_id || formData.subcategoryid || null,

    // Location information
    place: formData.place || "",
    place_id: formData.place_id || formData.placeid || null,
    venue_ids: formData.venue_id || formData.venueid || [],
    tax_ids: formData.tax_ids || formData.taxids || [],

    // Venue and capacity information
    venues: getPrimaryVenue(),
    max_capacity: calculateMaxCapacity(),

    // Seat configuration - returns array of objects
    seat_structure: transformSeatStructure(),

    // Seat structure IDs - returns plain array of integers [1, 11], NOT "[1, 11]"
    event_seat_structure_id: getSeatStructureIds(),

    // Ticket information
    ticket_structure_id: getTicketStructureId(),
    ticket_structure: transformTicketStructure(),

    // Offers and coupons
    offer_ids: selectedOffers.map((offer) => offer.id),
    coupon_ids: selectedCoupons.map((coupon) => coupon.id),

    // Additional booking information
    additional_booking_details:
      formData.additional_booking_info || formData.additionalbookinginfo || [],
    additional_notes:
      formData.additional_booking_notes ||
      formData.additionalbookingnotes ||
      "",

    // Default/calculated fields
    max_tickets: parseInt(
      formData.max_tickets || formData.maxtickets || "0",
      10
    ),
    event_type_id: formData.event_type_id || formData.eventtypeid,

    // Include lead_id if in create mode
    ...(eventId && { lead_id: eventId }),
  };

  console.log("📤 Transformed data:", transformedData);
  console.log("🖼️ Final thumbnail_image:", transformedData.thumbnail_image);
  console.log("🖼️ Final banner_images:", transformedData.banner_images);
  console.log("🖼️ Final event_images:", transformedData.event_images);
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

  // Updated validation for new image format
  if (
    !transformedData.thumbnail_image ||
    !transformedData.thumbnail_image.file_name
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
