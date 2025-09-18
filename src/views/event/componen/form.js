import React, { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Steps, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";

import EventDetailsField from "./EventDetailsField";
import TicketSelection from "./TicketSelection";
import OfferField from "./OfferField";
import EventBookingInfo from "./BookingInfo";
import CategoryField from "./CategoryFileds";
import LocationDetailsField from "./LocationDetailsField copy";

import {
  validateSection,
  clearDependentFields,
  clearAllVenueData,
  cleanVenueDependentData,
} from "../utils/eventValidation";

import {
  setEventFormData,
  updateSectionData,
  setCurrentStep,
  setCompletedSections,
  setValidationErrors,
  setLoading,
  resetEventForm,
  addEvent,
  editEvent,
  fetchEventDetails,
  checkEventValidation,
  setDialogVisible,
  setModalLoading,
  fetchEventType,
  toggleSelectedCoupon,
  toggleSelectedOffer,
  setSelectedEvent,
} from "store/slices/eventSlice";

import {
  validateSubCategory,
  setCategoryValidationDialogVisible,
  fetchSubcategories,
} from "store/slices/categorySlice";

import {
  validateVenue,
  setPlaceValidationDialogVisible,
  getVenues,
} from "store/slices/locationSlice";

import {
  validateTax,
  setTaxValidationDialogVisible,
  setSelectedTaxDetails,
} from "store/slices/taxSlice";

import {
  validateTicket,
  setTicketValidationDialogVisible,
  fetchAllTickets,
  getAvailableTicketsType,
} from "store/slices/ticketSlice";

import {
  validateOfferCoupon,
  setOfferCouponValidationDialogVisible,
} from "store/slices/offerSlice";

import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { transformAndValidateFormData } from "../utils/formDataTransformer";
import { EVENT_SECTIONS } from "constants/AppConstants";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import DraftSystem from "drafts/components/DraftSystem";

const { Step } = Steps;

export default function EventForm({ eventId, mode = "add" }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    formData,
    currentStep,
    completedSections,
    validationErrors,
    isLoading,
    eventDetails,
    selectedCoupons,
    selectedOffers,
    dialogVisible,
    modalLoading,
    responseData,
    responseMessage,
    responseImpactData,
    warningPagination,
    selectedEvent,
    editable_status,
    messages: warningMessage,
    eventType,
  } = useSelector((state) => state.event);

  const { selectedTax } = useSelector((state) => state.tax);
  const { selectedVenueList, selectedVenue } = useSelector(
    (state) => state.locations
  );
  const { ticketTypes, availableSeats } = useSelector((state) => state.tickets);

  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const completedSectionsSet = new Set(completedSections);

  // Initialize form with Redux data
  useEffect(() => {
    form.setFieldsValue(formData);
  }, [form, formData]);

  // Fetch initial data
  useEffect(() => {
    if (eventId && mode === "edit") {
      dispatch(fetchEventDetails(eventId));
    }
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
  }, [dispatch, eventId, mode, eventType.length]);

  // Pre-populate form for edit mode
  useEffect(() => {
    if (
      mode === "edit" &&
      eventDetails &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      const formValues = {
        event_name: eventDetails.event_name,
        description: eventDetails.description,
        category_id: eventDetails.category?.id,
        sub_category_id: eventDetails.sub_category?.id,
        place: eventDetails.venue?.place?.name,
        venue_id: eventDetails.venue?.map((venue) => venue.venue.id) || [],
        tax_ids: eventDetails.taxs?.map((tax) => tax.id) || [],
        available_types: eventDetails.available_types,
        max_capacity: eventDetails.max_tickets || 0,
        event_type_id: eventDetails.event_type_id,
        ticket_structure_id: eventDetails.ticket_structure_id,
        offer: eventDetails.event_offers?.map((offer) => offer.offer.id) || [],
        coupon:
          eventDetails.event_coupons?.map((coupon) => coupon.coupons.id) || [],
        thumbnail_image: eventDetails.thumbnail_image
          ? [
              {
                uid: "-1",
                name: eventDetails.thumbnail_image.split("/").pop(),
                status: "done",
                url: `${CDN_PATH}/${eventDetails.thumbnail_image}`,
              },
            ]
          : [],
        banner_images: eventDetails.media
          ? eventDetails.media.map((image, index) => ({
              uid: `-${index + 1}`,
              name: image.media_url.split("/").pop(),
              status: "done",
              url: `${CDN_PATH}/${image.media_url}`,
            }))
          : [],
      };

      form.setFieldsValue(formValues);

      if (eventDetails.taxs && eventDetails.taxs.length > 0) {
        dispatch(setSelectedTaxDetails(eventDetails.taxs));
      }
      if (eventDetails.category?.id) {
        dispatch(fetchSubcategories({ category_id: eventDetails.category.id }));
      }
      if (eventDetails.venue?.place?.id) {
        dispatch(getVenues({ place_id: eventDetails.venue.place.id }));
      }
      if (eventDetails.ticket_structure) {
        dispatch(fetchAllTickets({ venue_id: eventDetails.venue.id }));
      }
      dispatch(getAvailableTicketsType());

      if (eventDetails.event_offers && eventDetails.event_offers.length > 0) {
        eventDetails.event_offers.forEach((eventOffer) => {
          dispatch(
            toggleSelectedOffer({
              id: eventOffer.offer.id,
              name: eventOffer.offer.name,
              max_uses: eventOffer.offer.max_uses,
              date_required: eventOffer.offer.date_required,
              start_date: eventOffer.offer.start_date,
              end_date: eventOffer.offer.end_date,
            })
          );
        });
      }

      if (eventDetails.event_coupons && eventDetails.event_coupons.length > 0) {
        eventDetails.event_coupons.forEach((eventCoupon) => {
          dispatch(
            toggleSelectedCoupon({
              id: eventCoupon.coupons.id,
              name: eventCoupon.coupons.name,
              max_uses: eventCoupon.coupons.max_uses,
              start_date: eventCoupon.coupons.start_date,
              end_date: eventCoupon.coupons.end_date,
            })
          );
        });
      }
    }
  }, [
    eventDetails,
    mode,
    form,
    dispatch,
    selectedOffers.length,
    selectedCoupons.length,
  ]);

  const validateCurrentStep = async (values) => {
    const currentSection = EVENT_SECTIONS[currentStep];
    const sectionKey = currentSection.key;

    switch (sectionKey) {
      case "category":
        const subCategoryId = values.sub_category_id;
        const resultActionCat = await dispatch(
          validateSubCategory(subCategoryId)
        );
        if (validateSubCategory.fulfilled.match(resultActionCat)) {
          const response = resultActionCat.payload;
          if (response.message === "warning") {
            dispatch(setCategoryValidationDialogVisible(true));
            return false;
          } else if (response.data && response.data[0]?.validation_status) {
            return true;
          }
        }
        return false;

      case "location":
        const venueId = values.venue_id;
        const resultActionVenue = await dispatch(validateVenue(venueId[0]));
        if (validateVenue.fulfilled.match(resultActionVenue)) {
          const response = resultActionVenue.payload;
          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
            return false;
          } else if (response.data && response.data[0]?.validation_status) {
            return true;
          }
        }
        return false;

      case "pricing":
        if (selectedTax.length > 0) {
          const resultActionTax = await dispatch(validateTax(selectedTax));
          if (validateTax.fulfilled.match(resultActionTax)) {
            const response = resultActionTax.payload;
            if (response.message === "warning") {
              dispatch(setTaxValidationDialogVisible(true));
              return false;
            } else if (response.data && response.data[0]?.validation_status) {
              return true;
            }
          }
          return false;
        }
        return true;

      case "ticket":
        // Get the most current form values
        const currentFormValues = form.getFieldsValue();
        const completeValues = { ...formData, ...currentFormValues, ...values };

        console.log("=== TICKET VALIDATION START ===");
        console.log("Complete values for validation:", completeValues);

        // Step 1: Validate form data structure using your validateTicketSection
        const ticketValidation = await validateSection(
          "ticket",
          form,
          completeValues
        );

        if (!ticketValidation.isValid) {
          console.error("Form validation failed:", ticketValidation);
          message.error(
            ticketValidation.message || "Please complete ticket configuration"
          );
          return false;
        }

        console.log("✅ Form validation passed");

        // Step 2: Additional business logic validation (simplified)
        const venues = completeValues.venue_id || [];
        const selectedTicketTypes = completeValues.selected_ticket_types || {};
        const selectedSeats = completeValues.selected_seats || {};
        const ticketSets = completeValues.ticket_sets || {};

        let hasAnyValidConfiguration = false;

        // Check each venue for valid configuration
        for (const venueId of venues) {
          const venueKey = String(venueId);
          const venueTicketTypes = selectedTicketTypes[venueKey] || [];
          const venueSeats = selectedSeats[venueKey] || {};
          const venueTicketSets = ticketSets[venueKey] || {};

          // Check if venue has seats selected
          const hasSeatsConfig = Object.values(venueSeats).some(
            (selected) => selected === true
          );

          // Check if venue has complete ticket type configuration
          const hasTicketTypesConfig =
            Array.isArray(venueTicketTypes) &&
            venueTicketTypes.length > 0 &&
            venueTicketTypes.every((typeId) => {
              const sets = venueTicketSets[typeId] || [];
              return Array.isArray(sets) && sets.length > 0;
            });

          // At least one valid configuration per venue
          if (hasSeatsConfig || hasTicketTypesConfig) {
            hasAnyValidConfiguration = true;
            console.log(`✅ Venue ${venueId} has valid configuration`);
          } else {
            console.warn(`⚠️ Venue ${venueId} missing configuration`);
          }
        }

        if (!hasAnyValidConfiguration) {
          message.error(
            "Please configure at least one venue with either seats or complete ticket types"
          );
          return false;
        }

        console.log("✅ Business logic validation passed");

        // Step 3: API validation (if needed)
        const ticketStructureId = values.ticket_structure_id;

        if (ticketStructureId) {
          console.log(
            "Performing API validation for ticket structure:",
            ticketStructureId
          );

          try {
            const resultActionTicket = await dispatch(
              validateTicket(ticketStructureId)
            );

            if (validateTicket.fulfilled.match(resultActionTicket)) {
              const response = resultActionTicket.payload;

              if (response.message === "warning") {
                console.log("API validation returned warning");
                dispatch(setTicketValidationDialogVisible(true));
                return false;
              } else if (response.data && response.data[0]?.validation_status) {
                console.log("✅ API validation passed");
                return true;
              } else {
                console.error("API validation failed:", response);
                message.error("Ticket structure validation failed");
                return false;
              }
            } else {
              console.error("API validation request failed");
              message.error("Failed to validate ticket structure");
              return false;
            }
          } catch (error) {
            console.error("API validation error:", error);
            message.error("Error during ticket validation");
            return false;
          }
        } else {
          // No ticket structure ID - validation passes if form validation passed
          console.log("✅ No ticket structure ID - validation complete");
          return true;
        }

      default:
        return true;
    }
  };

  const validateCurrentSection = useCallback(async () => {
    const currentSection = EVENT_SECTIONS[currentStep];
    const sectionKey = currentSection.key;

    const currentFormValues = form.getFieldsValue();
    const completeValues = { ...formData, ...currentFormValues };

    try {
      const result = await validateSection(sectionKey, form, completeValues);

      if (!result.isValid) {
        dispatch(
          setValidationErrors({
            ...validationErrors,
            [sectionKey]: result.errors,
          })
        );
        setShowValidationSummary(true);
        return false;
      }

      const apiValid = await validateCurrentStep(completeValues);

      if (!apiValid) {
        return false;
      }

      const newErrors = { ...validationErrors };
      delete newErrors[sectionKey];
      dispatch(setValidationErrors(newErrors));
      setShowValidationSummary(false);

      return true;
    } catch (error) {
      return false;
    }
  }, [form, currentStep, dispatch, validationErrors, formData]);

  // Enhanced form values change handler
  const handleFormValuesChange = useCallback(
    (changedValues, allValues) => {
      console.log("Form values changed:", changedValues);

      dispatch(setEventFormData(allValues));

      const changedKey = Object.keys(changedValues)[0];
      if (["category_id", "place_id", "venue_id"].includes(changedKey)) {
        console.log("Clearing dependent fields for:", changedKey);
        const updated = clearDependentFields(
          form,
          changedKey,
          allValues,
          dispatch
        );

        setTimeout(() => {
          form.setFieldsValue(updated);
          dispatch(setEventFormData(updated));
        }, 0);
      }
    },
    [form, dispatch]
  );

  const handleNext = async () => {
    dispatch(setLoading(true));

    try {
      const currentValues = await form.validateFields();
      const currentSection = EVENT_SECTIONS[currentStep];

      dispatch(
        updateSectionData({ section: currentSection.key, data: currentValues })
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      const isValid = await validateCurrentSection();

      if (!isValid) {
        message.error("Please complete all required fields before proceeding");
        return;
      }

      const resultAction = await dispatch(checkEventValidation());

      if (checkEventValidation.fulfilled.match(resultAction)) {
        const newCompletedSections = [...completedSections, currentStep];
        dispatch(setCompletedSections(newCompletedSections));

        if (currentStep < EVENT_SECTIONS.length - 1) {
          dispatch(setCurrentStep(currentStep + 1));
        }
      } else {
        const errorMessage =
          resultAction && resultAction.payload
            ? resultAction.payload
            : "Event validation failed. Please try again.";
        message.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error && error.message
          ? error.message
          : "Please ensure all required fields are filled.";
      message.error(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFieldsChange = useCallback(
    (changedFields, allFields) => {
      const currentValues = form.getFieldsValue();
      const currentSection = EVENT_SECTIONS[currentStep];

      dispatch(
        updateSectionData({
          section: currentSection.key,
          data: currentValues,
        })
      );
    },
    [form, currentStep, dispatch]
  );

  const handlePrev = () => {
    if (currentStep > 0) {
      const currentValues = form.getFieldsValue();
      const currentSection = EVENT_SECTIONS[currentStep];

      dispatch(
        updateSectionData({
          section: currentSection.key,
          data: currentValues,
        })
      );

      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      const currentValues = form.getFieldsValue();
      const currentSection = EVENT_SECTIONS[currentStep];

      dispatch(
        updateSectionData({
          section: currentSection.key,
          data: currentValues,
        })
      );

      dispatch(setCurrentStep(step));
    } else {
      message.warning("Please use the Next button to proceed to the next step");
    }
  };

  const handleSubmit = async () => {
    dispatch(setLoading(true));

    try {
      console.log("=== FORM SUBMISSION START ===");

      // Step 1: Validate all form fields
      const finalValues = await form.validateFields();
      console.log("✅ Form fields validated:", finalValues);

      // Step 2: Combine all form data
      const completeFormData = {
        ...formData,
        ...finalValues,
        // Ensure ticket data is included
        selected_ticket_types: finalValues.selected_ticket_types || {},
        selected_seats: finalValues.selected_seats || {},
        ticket_sets: finalValues.ticket_sets || {},
        ticket_quantities: finalValues.ticket_quantities || {},
      };

      console.log("Complete form data:", completeFormData);

      // Step 3: Validate all sections
      const sectionValidations = {};
      let hasValidationErrors = false;

      for (const section of EVENT_SECTIONS) {
        try {
          const validation = await validateSection(
            section.key,
            form,
            completeFormData
          );
          sectionValidations[section.key] = validation;

          if (!validation.isValid) {
            hasValidationErrors = true;
            console.error(
              `❌ Section ${section.key} validation failed:`,
              validation
            );
          } else {
            console.log(`✅ Section ${section.key} validation passed`);
          }
        } catch (error) {
          console.error(`❌ Section ${section.key} validation error:`, error);
          hasValidationErrors = true;
          sectionValidations[section.key] = {
            isValid: false,
            errors: [{ name: [section.key], errors: [error.message] }],
          };
        }
      }

      if (hasValidationErrors) {
        const allErrors = {};
        Object.keys(sectionValidations).forEach((sectionKey) => {
          if (!sectionValidations[sectionKey].isValid) {
            allErrors[sectionKey] = sectionValidations[sectionKey].errors;
          }
        });

        dispatch(setValidationErrors(allErrors));
        setShowValidationSummary(true);
        message.error("Please fix all validation errors before submitting");
        return;
      }

      console.log("✅ All section validations passed");

      // Step 4: Prepare submission data based on mode
      if (mode === "edit") {
        await handleEditModeSubmission(completeFormData);
      } else {
        await handleCreateModeSubmission(completeFormData);
      }
    } catch (error) {
      console.error("❌ Form submission error:", error);

      // Provide more specific error messages
      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        message.error(
          `Validation error: ${
            firstError.errors?.[0] || "Please check required fields"
          }`
        );
      } else if (error.message) {
        message.error(`Submission failed: ${error.message}`);
      } else {
        message.error(
          "Failed to create event. Please check all fields and try again."
        );
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Separate function for edit mode
  const handleEditModeSubmission = async (completeFormData) => {
    console.log("=== EDIT MODE SUBMISSION ===");

    const offers = {
      offer_ids: selectedOffers?.map((offer) => offer.id) || [],
      coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
    };

    const editData = {
      ...completeFormData,
      ...offers,
      max_tickets: parseInt(completeFormData.max_tickets || "0", 10),
      id: eventId,
    };

    console.log("Edit data prepared:", editData);

    try {
      const offerValidationResult = await dispatch(
        validateOfferCoupon({
          offers: selectedOffers,
          coupons: selectedCoupons,
        })
      );

      if (validateOfferCoupon.fulfilled.match(offerValidationResult)) {
        const response = offerValidationResult.payload;

        if (response.message === "warning") {
          dispatch(setOfferCouponValidationDialogVisible(true));
          return;
        } else if (response.data && response.data[0]?.validation_status) {
          const editResult = await dispatch(
            editEvent({ data: editData, action: ActionType.WARNING })
          );

          if (editEvent.fulfilled.match(editResult)) {
            dispatch(setSelectedEvent(editData));
            dispatch(setDialogVisible(true));
            console.log("✅ Edit event successful");
          } else {
            throw new Error(editResult.payload || "Failed to update event");
          }
        } else {
          throw new Error("Offer/coupon validation failed");
        }
      } else {
        throw new Error(
          offerValidationResult.payload || "Offer validation failed"
        );
      }
    } catch (error) {
      console.error("❌ Edit submission error:", error);
      throw error;
    }
  };

  // Separate function for create mode
  const handleCreateModeSubmission = async (completeFormData) => {
    console.log("=== CREATE MODE SUBMISSION ===");

    const offers = {
      offer_ids: selectedOffers?.map((offer) => offer.id) || [],
      coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
    };

    const venue_id = {
      venue_ids: selectedVenueList?.map((venue) => venue.id) || [],
    };

    // **FIXED**: Better ticket structure handling
    const ticket_structure = {
      ticket_structure:
        ticketTypes?.reduce((acc, ticketType) => {
          if (
            ticketType.ticket_types &&
            Array.isArray(ticketType.ticket_types)
          ) {
            const structureItems = ticketType.ticket_types
              .filter((ticket) => ticket.ticket_set) // Only include tickets with sets
              .map((ticket) => ({
                id: ticket.ticketStructureId,
                ticket_set: ticket.ticket_set,
              }));
            return [...acc, ...structureItems];
          }
          return acc;
        }, []) || [],
    };

    // **ENHANCED**: Include ticket selection data
    const ticketSelectionData = {
      selected_ticket_types: completeFormData.selected_ticket_types || {},
      selected_seats: completeFormData.selected_seats || {},
      ticket_sets: completeFormData.ticket_sets || {},
      ticket_quantities: completeFormData.ticket_quantities || {},
    };

    const createData = {
      ...completeFormData,
      ...venue_id,
      ...ticket_structure,
      ...offers,
      ...ticketSelectionData,
      lead_id: eventId,
      additional_booking_details:
        completeFormData.additional_booking_info || [],
      additional_notes: completeFormData.additional_booking_notes || "",
      event_add_on_services: completeFormData.event_add_on_services || [],
      event_qna: completeFormData.event_qna || [],
      max_tickets: parseInt(completeFormData.max_tickets || "0", 10),
      event_seat_structure_id:
        availableSeats.length > 0
          ? availableSeats.map((item) => item.id)
          : null,
    };

    console.log("Create data prepared:", createData);

    try {
      const offerValidationResult = await dispatch(
        validateOfferCoupon({
          offers: selectedOffers,
          coupons: selectedCoupons,
        })
      );

      if (validateOfferCoupon.fulfilled.match(offerValidationResult)) {
        const response = offerValidationResult.payload;

        if (response.message === "warning") {
          dispatch(setOfferCouponValidationDialogVisible(true));
          return;
        } else if (response.data && response.data[0]?.validation_status) {
          dispatch(setSelectedSubmitItem(createData));
          console.log("✅ Create event data submitted");
        } else {
          throw new Error("Offer/coupon validation failed");
        }
      } else {
        throw new Error(
          offerValidationResult.payload || "Offer validation failed"
        );
      }
    } catch (error) {
      console.error("❌ Create submission error:", error);
      throw error;
    }
  };

  // Modal handlers
  const handleWarningPagination = (page, size) => {
    dispatch(
      editEvent({
        data: selectedEvent,
        action: ActionType.WARNING,
        pageData: { page: page, size: size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    const resultAction = await dispatch(
      editEvent({ data: selectedEvent, action: ActionType.SUBMIT })
    );
    dispatch(setModalLoading(false));
    dispatch(setDialogVisible(false));
    if (editEvent.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedEvent));
    }
  };

  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
  };

  useEffect(() => {
    form.setFieldsValue(formData);
  }, [currentStep, form, formData]);

  const renderSectionContent = () => {
    const currentSection = EVENT_SECTIONS[currentStep];
    const sectionErrors = validationErrors[currentSection?.key] || [];

    const commonProps = {
      form,
      currentValues: formData,
      validationErrors: sectionErrors,
      onFieldChange: handleFieldsChange,
    };

    switch (currentSection?.key) {
      case "basic":
        return <EventDetailsField {...commonProps} mode={mode} />;
      case "category":
        return <CategoryField {...commonProps} />;
      case "location":
        return <LocationDetailsField {...commonProps} />;
      case "ticket":
        return <TicketSelection {...commonProps} />;
      case "pricing":
        return <OfferField {...commonProps} mode={mode} />;
      case "additionalinfo":
        return <EventBookingInfo {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-4">
        {/* <DraftSystem
          form={form}
          formType="event"
          mode={mode}
          recordId={eventId}
          titleField="event_name"
          excludeFromDraft={[
            "id",
            "created_at",
            "updated_at",
            "thumbnail_image",
            "banner_images",
            "event_images",
          ]}
          style={{ marginRight: 12, display: "inline-block" }}
          enableAutoSave={mode !== "edit"}
          autoSaveInterval={5000}
          showLabels={true}
          size="small"
        /> */}
      </div>

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
        <Button
          size="large"
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="min-w-[100px]"
        >
          Previous
        </Button>

        <div className="text-center">
          <span className="text-gray-500">
            Step {currentStep + 1} of {EVENT_SECTIONS.length}
          </span>
          <div className="text-sm text-gray-400 mt-1">
            {EVENT_SECTIONS[currentStep]?.title}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {completedSections.length} of {EVENT_SECTIONS.length} sections
            completed
          </div>
        </div>

        {currentStep < EVENT_SECTIONS.length - 1 ? (
          <Button
            type="primary"
            size="large"
            onClick={handleNext}
            loading={isLoading}
            className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
          >
            Next
          </Button>
        ) : (
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            loading={isLoading}
            className="min-w-[120px] bg-green-600 hover:bg-green-700"
          >
            {isLoading
              ? mode === "edit"
                ? "Updating..."
                : "Creating..."
              : mode === "edit"
              ? "Update Event"
              : "Create Event"}
          </Button>
        )}
      </div>

      {/* Steps Navigation */}
      <Steps
        current={currentStep}
        type="navigation"
        size="small"
        className="site-navigation-steps mb-8"
      >
        {EVENT_SECTIONS.map((section, index) => {
          const hasErrors = validationErrors[section.key]?.length > 0;
          const isComplete = completedSectionsSet.has(index);
          const isClickable = index <= currentStep;

          return (
            <Step
              key={section.key}
              title={section.title}
              icon={section.icon}
              status={
                hasErrors
                  ? "error"
                  : isComplete
                  ? "finish"
                  : index === currentStep
                  ? "process"
                  : "wait"
              }
              onClick={() => isClickable && handleStepClick(index)}
              className={
                isClickable
                  ? "cursor-pointer hover:bg-blue-50"
                  : "cursor-not-allowed opacity-50"
              }
            />
          );
        })}
      </Steps>

      {/* Form Content */}
      <Form
        form={form}
        layout="vertical"
        size="large"
        initialValues={formData}
        onFieldsChange={handleFieldsChange}
        // In your EventForm component, update the onValuesChange handler
        // In EventForm component, update the onValuesChange handler:
        onValuesChange={(changedValues, allValues) => {
          console.log("Form values changing:", changedValues);

          // Always update Redux store with complete values
          dispatch(setEventFormData(allValues));

          const changedKey = Object.keys(changedValues)[0];

          // Handle ticket data updates specifically
          if (
            [
              "selected_ticket_types",
              "selected_seats",
              "ticket_sets",
              "ticket_quantities",
            ].includes(changedKey)
          ) {
            console.log(
              `Ticket data updated: ${changedKey}`,
              changedValues[changedKey]
            );
          }

          if (["category_id", "place_id", "venue_id"].includes(changedKey)) {
            console.log("Clearing dependent fields for:", changedKey);
            const updated = clearDependentFields(
              form,
              changedKey,
              allValues,
              dispatch
            );

            if (changedKey === "venue_id") {
              const selectedVenues = changedValues.venue_id || [];
              const { cleanedValues } = cleanVenueDependentData(
                selectedVenues,
                allValues
              );
              form.setFieldsValue(cleanedValues);
              dispatch(setEventFormData(cleanedValues));
            }

            setTimeout(() => {
              form.setFieldsValue(updated);
              dispatch(setEventFormData(updated));
            }, 0);
          }
        }}
      >
        <div className="min-h-[400px] relative">
          {renderSectionContent()}

          {/* Show current section validation errors */}
          {validationErrors[EVENT_SECTIONS[currentStep]?.key]?.length > 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium mb-2">
                Please fix the following errors:
              </p>
              <ul className="text-red-600 text-sm list-disc list-inside">
                {validationErrors[EVENT_SECTIONS[currentStep].key].map(
                  (error, index) => (
                    <li key={index}>
                      <strong>{error.name?.join(".")}:</strong>{" "}
                      {error.errors?.join(", ")}
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      </Form>

      {/* Warning Modal */}
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        responseData={responseImpactData}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "active_schedules",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />

      {/* Submit and Confirm Modal */}
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "edit" ? editEvent : addEvent}
        navigationPath={`${APP_PREFIX_PATH}/event/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType="event"
      />
    </div>
  );
}
