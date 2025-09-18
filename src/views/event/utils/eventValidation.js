import {
  clearTicketSectionCompletion,
  setEventFormData,
} from "store/slices/eventSlice";

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
  },

  ticket: {
    venue_id: [{ required: true, message: "Please select venues first" }],
  },

  pricing: {},

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
          }
          return Promise.resolve();
        },
      },
    ],
  },
};

const makeFieldError = (pathArray, errMsg) => ({
  name: pathArray,
  errors: [errMsg],
});

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
        return await validateBasicSection(values);
      case "category":
        return await validateCategorySection(values);
      case "location":
        return await validateLocationSection(values);
      case "ticket":
        return await validateTicketSection(values);
      case "pricing":
        return await validatePricingSection();
      case "additionalinfo":
        return await validateAdditionalInfoSection(values);
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

const validateBasicSection = async (values = {}) => {
  const errors = [];

  // Event name validation
  if (!values.event_name || !values.event_name.trim()) {
    errors.push(makeFieldError(["event_name"], "Event name is required"));
  } else if (values.event_name.length < 3) {
    errors.push(
      makeFieldError(["event_name"], "Event name must be at least 3 characters")
    );
  }

  // Description validation
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

  // Thumbnail image validation
  const thumbnailImage = values.thumbnail_image;
  if (
    !thumbnailImage ||
    !Array.isArray(thumbnailImage) ||
    thumbnailImage.length === 0
  ) {
    errors.push(
      makeFieldError(["thumbnail_image"], "Thumbnail image is required")
    );
  } else {
    // Validate thumbnail image properties
    const validThumbnails = thumbnailImage.filter(
      (file) => file && (file.status === "done" || file.status === "uploading")
    );

    if (validThumbnails.length === 0) {
      errors.push(
        makeFieldError(
          ["thumbnail_image"],
          "Please upload a valid thumbnail image"
        )
      );
    }

    // Optional: Check file size (if available)
    const largeThumbnails = thumbnailImage.filter(
      (file) => file.size && file.size > 5 * 1024 * 1024 // 5MB limit
    );

    if (largeThumbnails.length > 0) {
      errors.push(
        makeFieldError(
          ["thumbnail_image"],
          "Thumbnail image must be less than 5MB"
        )
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length ? "Please fix the basic information errors" : "",
  };
};

const validateCategorySection = async (values = {}) => {
  const errors = [];

  if (!values.category_id) {
    errors.push(makeFieldError(["category_id"], "Event category is required"));
  }
  if (!values.sub_category_id) {
    errors.push(
      makeFieldError(["sub_category_id"], "Sub-category is required")
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length
      ? "Please select both category and sub-category"
      : "",
  };
};

const validateLocationSection = async (values = {}) => {
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

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length ? "Please complete location selection" : "",
  };
};

const validateTicketSection = async (values) => {
  const errors = [];
  const venues = values.venue_id;

  if (!venues || venues.length === 0) {
    errors.push(makeFieldError(["venue_id"], "Please select venues first"));
  }

  return {
    isValid: errors.length === 0,
    errors,
    message: errors.length > 0 ? "Please select venues first" : "",
  };
};

const validatePricingSection = async () => ({
  isValid: true,
  errors: [],
  message: "",
});

const validateAdditionalInfoSection = async (values = {}) => {
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

export const clearDependentFields = (
  form,
  fieldName,
  currentValues = {},
  dispatch = null
) => {
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
        dispatch(clearTicketSectionCompletion());
      }
      return { ...currentValues, ...placeResetValues };

    default:
      return currentValues;
  }
};

export default {
  ValidationRules,
  validateSection,
  clearDependentFields,
};
