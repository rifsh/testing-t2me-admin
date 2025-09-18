import { clearTicketSectionCompletion, setEventFormData } from "store/slices/eventSlice";

export const ValidationRules = {
  basic: {
    event_name: [
      { required: true, message: "Event name is required" },
      { min: 3, message: "Event name must be at least 3 characters" },
      { max: 100, message: "Event name cannot exceed 100 characters" },
    ],
    description: [
      { required: true, message: "Event description is required" },
      { min: 10, message: "Description must be at least 10 characters" },
      { max: 1000, message: "Description cannot exceed 1000 characters" },
    ],
    thumbnail_image: [],
    banner_images: [],
  },

  category: {
    category_id: [{ required: true, message: "Event category is required" }],
    sub_category_id: [{ required: true, message: "Sub-category is required" }],
  },

  location: {
    place_id: [{ required: true, message: "Place selection is required" }],
    venue_id: [
      { required: true, message: "At least one venue must be selected" },
    ],
    tax_ids: [],
  },

  ticket: {
    selected_ticket_types: [
      { required: true, message: "Ticket type selection is required" },
    ],
    selected_seats: [{ required: true, message: "Seat selection is required" }],
    ticket_sets: [],
    ticket_quantities: [],
  },

  pricing: {
    selectedOffers: [],
    selectedCoupons: [],
  },

  additionalinfo: {
    additional_booking_info: [
      {
        validator: (_, value) => {
          if (!value || value.length === 0) return Promise.resolve();
          for (const section of value) {
            if (!section.sectionTitle || section.sectionTitle.trim() === "") {
              return Promise.reject(new Error("Section title is required"));
            }
            if (!section.sectionItems || section.sectionItems.length === 0) {
              return Promise.reject(
                new Error("At least one item is required per section")
              );
            }
            for (const item of section.sectionItems) {
              if (!item || item.trim() === "") {
                return Promise.reject(
                  new Error("Section items cannot be empty")
                );
              }
            }
          }
          return Promise.resolve();
        },
      },
    ],
  },
};

export const getRequiredFields = (sectionKey) => {
  const rules = ValidationRules[sectionKey] || {};
  return Object.keys(rules).filter((fieldName) => {
    const fieldRules = rules[fieldName];
    return fieldRules.some((rule) => rule.required === true);
  });
};

export const getStepForField = (fieldName) => {
  const mapping = {
    event_name: 0,
    description: 0,
    category_id: 1,
    sub_category_id: 1,
    place_id: 2,
    venue_id: 2,
    selected_ticket_types: 3,
    selected_seats: 3,
    selectedOffers: 4,
    selectedCoupons: 4,
    additional_booking_info: 5,
  };
  return typeof mapping[fieldName] === "number" ? mapping[fieldName] : null;
};

const makeFieldError = (pathArray, errMsg) => ({
  name: pathArray,
  errors: [errMsg],
});

// Clear all venue-dependent data completely
export const clearAllVenueData = (form, dispatch = null) => {
  const resetValues = {
    selected_ticket_types: {},
    selected_seats: {},
    ticket_sets: {},
    ticket_quantities: {},
  };

  console.log("Clearing all venue data");
  form.setFieldsValue(resetValues);

  if (dispatch) {
    dispatch(setEventFormData(resetValues));
  }

  return resetValues;
};

// Clean venue data for specific venues only
export const cleanVenueDependentData = (
  selectedVenues = [],
  currentValues = {}
) => {
  const venueIds = Array.isArray(selectedVenues) ? selectedVenues : [];
  const venueIdsAsNumbers = venueIds.map((v) => parseInt(v));
  const venueIdsAsStrings = venueIds.map((v) => String(v));

  const fieldsToClean = [
    "selected_ticket_types",
    "selected_seats",
    "ticket_sets",
    "ticket_quantities",
  ];

  const cleanedValues = { ...currentValues };
  let hasChanges = false;

  fieldsToClean.forEach((fieldName) => {
    const fieldData = currentValues[fieldName] || {};
    const cleanedFieldData = {};

    Object.keys(fieldData).forEach((venueIdStr) => {
      const venueIdNum = parseInt(venueIdStr);

      if (
        venueIdsAsNumbers.includes(venueIdNum) ||
        venueIdsAsStrings.includes(venueIdStr)
      ) {
        cleanedFieldData[venueIdStr] = fieldData[venueIdStr];
      } else {
        hasChanges = true;
        console.log(
          `Cleaning ${fieldName} data for removed venue ${venueIdStr}`
        );
      }
    });

    cleanedValues[fieldName] = cleanedFieldData;
  });

  return {
    cleanedValues,
    hasChanges,
  };
};

export const validateSection = async (sectionKey, form, formData = {}) => {
  const sectionRules = ValidationRules[sectionKey];
  if (!sectionRules) {
    return { isValid: true, errors: [], message: "" };
  }

  try {
    const values =
      Object.keys(formData).length > 0
        ? formData
        : form && typeof form.getFieldsValue === "function"
        ? form.getFieldsValue()
        : {};

    switch (sectionKey) {
      case "basic":
        return await validateBasicSection(values, form);
      case "category":
        return await validateCategorySection(values, form);
      case "location":
        return await validateLocationSection(values, form);
      case "ticket":
        return await validateTicketSection(values, form);
      case "pricing":
        return await validatePricingSection(values, form);
      case "additionalinfo":
        return await validateAdditionalInfoSection(values, form);
      default:
        return { isValid: true, errors: [], message: "" };
    }
  } catch (err) {
    return {
      isValid: false,
      errors: [makeFieldError([sectionKey], err.message || "Validation error")],
      message: err.message || "Validation failed",
    };
  }
};

const validateBasicSection = async (values = {}, form = null) => {
  const errors = [];

  if (!values.event_name || !values.event_name.trim()) {
    errors.push(makeFieldError(["event_name"], "Event name is required"));
  } else if (values.event_name.length < 3) {
    errors.push(
      makeFieldError(["event_name"], "Event name must be at least 3 characters")
    );
  }

  if (!values.description || !values.description.trim()) {
    errors.push(
      makeFieldError(["description"], "Event description is required")
    );
  } else if (values.description.length < 10) {
    errors.push(
      makeFieldError(
        ["description"],
        "Description must be at least 10 characters"
      )
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length ? "Please fix the basic information errors" : "",
  };
};

const validateCategorySection = async (values = {}, form = null) => {
  const errors = [];

  if (!values.category_id) {
    errors.push(makeFieldError(["category_id"], "Event category is required"));
  }
  if (!values.sub_category_id) {
    errors.push(
      makeFieldError(["sub_category_id"], "Sub-category is required")
    );
  }

  if (form && values.category_id && !values.sub_category_id) {
    form.setFieldValue("sub_category_id", null);
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length
      ? "Please select both category and sub-category"
      : "",
  };
};

const validateLocationSection = async (values = {}, form = null) => {
  const errors = [];

  if (!values.place_id) {
    errors.push(makeFieldError(["place_id"], "Place selection is required"));
  }

  const venue = values.venue_id;
  if (!venue || (Array.isArray(venue) && venue.length === 0)) {
    errors.push(
      makeFieldError(["venue_id"], "At least one venue must be selected")
    );
  }

  if (form && venue && Array.isArray(venue)) {
    const currentFormValues = form.getFieldsValue();
    const { cleanedValues, hasChanges } = cleanVenueDependentData(
      venue,
      currentFormValues
    );

    if (hasChanges) {
      console.log("Location validation: Cleaning venue-dependent data");
      form.setFieldsValue(cleanedValues);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length ? "Please complete location selection" : "",
  };
};

const validatePricingSection = async (values = {}, form = null) => ({
  isValid: true,
  errors: [],
  message: "",
});

const validateTicketSection = async (values = {}, form = null) => {
  const errors = [];
  const venues = values.venue_id || [];

  console.log("=== TICKET VALIDATION START ===");
  console.log("Venues:", venues);
  console.log("All form values:", values);

  if (!venues || venues.length === 0) {
    errors.push(makeFieldError(["venue_id"], "Please select venues first"));
    return {
      isValid: false,
      errors,
      message: "Venue selection is required for ticket configuration",
    };
  }

  const selectedTicketTypes = values.selected_ticket_types || {};
  const selectedSeats = values.selected_seats || {};
  const ticketSets = values.ticket_sets || {};

  let hasAnyConfiguration = false;
  let hasValidConfiguration = false;

  for (const venueId of venues) {
    // Try both string and number keys
    const venueKey = String(venueId);
    const venueNumKey = parseInt(venueId);

    const venueTicketTypes = 
      selectedTicketTypes[venueKey] || 
      selectedTicketTypes[venueNumKey] || 
      [];
    
    const venueSeats = 
      selectedSeats[venueKey] || 
      selectedSeats[venueNumKey] || 
      {};
    
    const venueTicketSets = 
      ticketSets[venueKey] || 
      ticketSets[venueNumKey] || 
      {};

    console.log(`Venue ${venueId} configuration:`, {
      ticketTypes: venueTicketTypes,
      seats: venueSeats,
      ticketSets: venueTicketSets,
    });

    // Check if venue has seats selected
    const hasSeats = Object.keys(venueSeats).some(
      (seatId) => venueSeats[seatId] === true
    );

    // Check if venue has ticket types selected
    const hasTicketTypes = Array.isArray(venueTicketTypes) && venueTicketTypes.length > 0;

    if (hasSeats || hasTicketTypes) {
      hasAnyConfiguration = true;

      // Seats configuration is always valid
      if (hasSeats) {
        hasValidConfiguration = true;
        console.log(`✅ Venue ${venueId} has valid seat configuration`);
      }

      // Check ticket types configuration
      if (hasTicketTypes) {
        let allTicketTypesValid = true;

        for (const ticketTypeId of venueTicketTypes) {
          const ticketSetKey = String(ticketTypeId);
          const ticketSetNumKey = parseInt(ticketTypeId);
          const setsForType = 
            venueTicketSets[ticketSetKey] ||
            venueTicketSets[ticketSetNumKey] ||
            [];

          if (!Array.isArray(setsForType) || setsForType.length === 0) {
            allTicketTypesValid = false;
            console.log(`❌ Missing ticket sets for type ${ticketTypeId} in venue ${venueId}`);
            break;
          }

          const hasValidSets = setsForType.some(
            (set) => set && String(set).trim() !== ""
          );
          
          if (!hasValidSets) {
            allTicketTypesValid = false;
            console.log(`❌ Empty ticket sets for type ${ticketTypeId} in venue ${venueId}`);
            break;
          }
        }

        if (allTicketTypesValid) {
          hasValidConfiguration = true;
          console.log(`✅ Venue ${venueId} has valid ticket type configuration`);
        }
      }
    } else {
      console.log(`❌ Venue ${venueId} has no configuration`);
    }
  }

  // **KEY FIX**: More lenient validation
  if (!hasAnyConfiguration) {
    errors.push(
      makeFieldError(
        ["venue_configuration"],
        "At least one venue must have either ticket types or seats configured"
      )
    );
  }

  // **IMPORTANT**: Allow partial configurations during development
  const isValidForProduction = errors.length === 0 && hasValidConfiguration;
  const isValidForDevelopment = errors.length === 0 && hasAnyConfiguration;

  console.log("=== TICKET VALIDATION END ===");
  console.log("Has any configuration:", hasAnyConfiguration);
  console.log("Has valid configuration:", hasValidConfiguration);
  console.log("Errors:", errors);

  return {
    isValid: isValidForDevelopment, // Use this for more lenient validation
    errors,
    message: errors.length > 0 
      ? "Please complete ticket configuration for all venues"
      : !hasAnyConfiguration 
      ? "Please configure at least one venue"
      : "",
  };
};

export const clearDependentFields = (
  form,
  fieldName,
  currentValues = {},
  dispatch = null
) => {
  console.log("Clearing dependent fields for:", fieldName);

  switch (fieldName) {
    case "category_id":
      const categoryResetValues = { sub_category_id: null };
      if (form && typeof form.setFieldsValue === "function") {
        form.setFieldsValue(categoryResetValues);
      }
      if (dispatch) {
        dispatch(
          setEventFormData({ ...currentValues, ...categoryResetValues })
        );
      }
      return { ...currentValues, ...categoryResetValues };

    case "place_id":
      const placeResetValues = {
        venue_id: [],
        tax_ids: [],
        selected_ticket_types: {},
        selected_seats: {},
        ticket_sets: {},
        ticket_quantities: {},
      };
      if (form && typeof form.setFieldsValue === "function") {
        form.setFieldsValue(placeResetValues);
      }
      if (dispatch) {
        dispatch(setEventFormData({ ...currentValues, ...placeResetValues }));
        // Clear ticket section completion
        dispatch(clearTicketSectionCompletion());
      }
      return { ...currentValues, ...placeResetValues };

    case "venue_id":
      const selectedVenues = currentValues.venue_id || [];
      const { cleanedValues } = cleanVenueDependentData(
        selectedVenues,
        currentValues
      );

      if (form && typeof form.setFieldsValue === "function") {
        form.setFieldsValue(cleanedValues);
      }
      if (dispatch) {
        dispatch(setEventFormData(cleanedValues));
        // Clear ticket section completion when venues change
        dispatch(clearTicketSectionCompletion());
      }
      return cleanedValues;

    default:
      return currentValues;
  }
};

const validateAdditionalInfoSection = async (values = {}, form = null) => {
  const errors = [];
  const additionalInfo = values.additional_booking_info || [];

  for (let i = 0; i < additionalInfo.length; i++) {
    const section = additionalInfo[i];
    if (!section.sectionTitle || section.sectionTitle.trim() === "") {
      errors.push(
        makeFieldError(
          ["additional_booking_info", i, "sectionTitle"],
          "Section title is required"
        )
      );
    }
    if (!section.sectionItems || section.sectionItems.length === 0) {
      errors.push(
        makeFieldError(
          ["additional_booking_info", i, "sectionItems"],
          "At least one item is required"
        )
      );
    } else {
      for (let j = 0; j < section.sectionItems.length; j++) {
        const item = section.sectionItems[j];
        if (!item || item.trim() === "") {
          errors.push(
            makeFieldError(
              ["additional_booking_info", i, "sectionItems", j],
              "Item cannot be empty"
            )
          );
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length
      ? "Please complete all additional information sections"
      : "",
  };
};

export const mapErrorsToStep = (errors = []) => {
  if (!errors || errors.length === 0) return null;
  const first = errors[0];
  const fieldName = Array.isArray(first.name) ? first.name[0] : null;
  const step = fieldName ? getStepForField(fieldName) : null;
  return { step, fieldName, message: first.errors?.join(", ") || "" };
};

export default {
  ValidationRules,
  validateSection,
  getRequiredFields,
  clearDependentFields,
  cleanVenueDependentData,
  clearAllVenueData,
  getStepForField,
  mapErrorsToStep,
};
