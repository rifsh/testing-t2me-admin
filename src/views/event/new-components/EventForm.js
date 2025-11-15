import React, { useState, useCallback, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Steps, Button, message } from "antd";

import EventDetailsField from "./EventDetailsField";
import TicketSelection from "./TicketSelection";
import OfferField from "./OfferField";
import EventBookingInfo from "./BookingInfo";
import CategoryField from "./CategoryFileds";
import LocationDetailsField from "./LocationDetailsField copy";
import { extractFileObjects, UPLOAD_FIELD_CONFIGS } from "utils/s3UploadUtil";
import { setOriginalFiles } from "store/slices/modalSlice";
import {
  validateSection,
  clearDependentFields,
} from "../utils/eventValidation";

import {
  setEventFormData,
  updateSectionData,
  setCurrentStep,
  setCompletedSections,
  setValidationErrors,
  setLoading,
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
  clearSelectedCoupons,
  clearAllTicketData,
  resetEventForm,
} from "store/slices/eventSlice";

import { fetchSubcategories } from "store/slices/categorySlice";
import { getVenues } from "store/slices/locationSlice";
import { setSelectedTaxDetails, clearSelectedTax } from "store/slices/taxSlice";
import {
  fetchAllTickets,
  getAvailableTicketsType,
  clearTicketSelection,
} from "store/slices/ticketSlice";

import {
  validateOfferCoupon,
  setOfferCouponValidationDialogVisible,
} from "store/slices/offerSlice";

import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { transformFormDataForAPI } from "../utils/formDataTransformer";
import { EVENT_TYPES } from "constants/PageConstants";
import DraftSystem from "drafts/components/DraftSystem";
import { getRoleBasedEventSections } from "configs/UserAccessConfig";
import { getSingleLeadEvents, addLeadEvent } from "store/slices/leadEventSlice";
import { EDIT } from "constants/AppConstants";

const { Step } = Steps;

export default function EventForm({ eventId, mode = "add" }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const isInitialized = useRef(false);
  const [imagesResetWarning, setImagesResetWarning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  // Add LEAD mode state
  const { singleLeadEvent, error: leadError } = useSelector(
    (state) => state.leadEvents
  );

  const { selectedTax } = useSelector((state) => state.tax);
  const { selectedVenueList } = useSelector((state) => state.locations);
  const { ticketTypes, availableSeats, availableTicketTyps } = useSelector(
    (state) => state.tickets
  );

  const completedSectionsSet = new Set(completedSections);

  // Helper function to preserve images when resetting form
  const preserveImages = (currentFormData) => {
    const currentValues = form.getFieldsValue();
    return {
      thumbnail_image:
        currentValues.thumbnail_image || currentFormData.thumbnail_image,
      banner_images:
        currentValues.banner_images || currentFormData.banner_images,
      event_images: currentValues.event_images || currentFormData.event_images,
    };
  };

  // Helper function to determine media type from file
  const getMediaType = (file) => {
    // If it's existing media with mediaType or media_type property, use that directly
    if (file.mediaType) {
      return file.mediaType;
    }

    if (file.media_type) {
      return file.media_type;
    }

    // If it's a new file being uploaded, check the originFileObj first (Ant Design Upload)
    if (file.originFileObj && file.originFileObj.type) {
      return file.originFileObj.type.startsWith("video/") ? "video" : "image";
    }

    // Check the type property directly
    if (file.type) {
      // If it's a MIME type string
      if (typeof file.type === "string" && file.type.includes("/")) {
        return file.type.startsWith("video/") ? "video" : "image";
      }
      // If it's already "image" or "video" string
      return file.type;
    }

    // Fallback: Check file extension
    const fileName = file.name || file.file_name || "";
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const isVideo = videoExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext)
    );

    return isVideo ? "video" : "image";
  };


  // Show warning message when images are reset
  const showImageResetWarning = () => {
    setImagesResetWarning(true);
    message.warning({
      content: "Images have been reset. Please select them again.",
      duration: 5,
      key: "image-reset-warning",
    });

    setTimeout(() => {
      setImagesResetWarning(false);
    }, 10000);
  };

  // Initial cleanup - only once per component mount
  useEffect(() => {
    if (!isInitialized.current) {
      console.log("🔄 Initializing EventForm - Mode:", mode);

      if (mode === "add") {
        form.resetFields();
        dispatch(resetEventForm());
        dispatch(clearAllTicketData());

        const initialValues = {
          event_name: "",
          description: "",
          category_id: undefined,
          sub_category_id: undefined,
          place: "",
          venue_id: [],
          tax_ids: [],
          available_types: [],
          max_capacity: 0,
          event_type_id: undefined,
          ticket_structure_id: undefined,
          offer: [],
          coupon: [],
          thumbnail_image: [],
          banner_images: [],
          event_images: [],
        };

        form.setFieldsValue(initialValues);
        dispatch(setEventFormData(initialValues));
        console.log("✅ ADD mode initialization complete");
      } else if (mode === EDIT && eventId) {
        console.log("📝 EDIT mode - will load event data");
      } else if (mode === "LEAD" && eventId) {
        console.log("🎯 LEAD mode - will load lead event data");
      }

      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
  }, [dispatch, eventType.length]);

  // NEW: Fetch lead event data when in LEAD mode
  useEffect(() => {
    if (mode === "LEAD" && eventId && !singleLeadEvent) {
      console.log("📥 Fetching lead event data:", eventId);
      dispatch(getSingleLeadEvents(eventId));
    }
  }, [dispatch, mode, eventId, singleLeadEvent]);

  // NEW: Populate form with lead event data
  useEffect(() => {
    if (
      mode === "LEAD" &&
      singleLeadEvent &&
      isInitialized.current &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      console.log("🎯 Populating form with lead event details");

      const formValues = {
        event_name: singleLeadEvent.event_name || "",
        description: singleLeadEvent.description || "",
        // Add other fields from singleLeadEvent as needed
      };

      form.setFieldsValue(formValues);
      dispatch(setEventFormData(formValues));

      console.log("✅ Lead mode form population complete");
    }
  }, [
    singleLeadEvent,
    mode,
    form,
    dispatch,
    selectedOffers.length,
    selectedCoupons.length,
  ]);

  // Handle edit mode data loading
  useEffect(() => {
    if (eventId && mode === EDIT && isInitialized.current) {
      console.log("📥 Loading event details for edit mode");
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, eventId, mode]);

  const safeGetFileName = (url) => {
    if (!url || typeof url !== "string") {
      return "image";
    }
    return url.split("/").pop() || "image";
  };

  useEffect(() => {
    if (
      mode === EDIT &&
      eventDetails &&
      isInitialized.current &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      console.log("📝 Populating form with event details");

      // Extract venue IDs
      const venueIds =
        eventDetails.venue_ticket_structures?.map((vts) => vts.venue.id) || [];
      // Extract ticket structure info
      const ticketStructureInfo = eventDetails.venue_ticket_structures?.[0];

      // Get place info
      const firstVenueEvent = eventDetails.venue_events?.[0];
      const placeInfo = firstVenueEvent?.venue?.place;

      // Map thumbnail with id if available - always image type
      const thumbnailFile = eventDetails.thumbnail_image
        ? [
            {
              uid: "thumbnail-1",
              name: eventDetails.thumbnail_image.split("/").pop(),
              status: "done",
              url: `${CDN_PATH}/${eventDetails.thumbnail_image}`,
              id: null,
              type: "image",
              mediaType: "image",
            },
          ]
        : [];

      // Map banner images/videos from media array with ids
      const bannerFiles = eventDetails.media
        ? eventDetails.media.map((media, index) => ({
            uid: `banner-${media.id}`,
            name: media.media_url.split("/").pop(),
            status: "done",
            url: `${CDN_PATH}/${media.media_url}`,
            thumbUrl: media.thumbnail_url
              ? `${CDN_PATH}/${media.thumbnail_url}`
              : undefined,
            id: media.id, // Important: media id for deletion
            type: media.media_type || "image",
            mediaType: media.media_type,
            caption: media.caption,
          }))
        : [];

      // Map event images/videos with ids
      const eventImageFiles =
        eventDetails.event_images?.map((media, index) => ({
          uid: `event-${media.id || index}`,
          name:
            media.image?.split("/").pop() || media.media_url?.split("/").pop(),
          status: "done",
          url: `${CDN_PATH}/${media.image || media.media_url}`,
          thumbUrl: media.thumbnail_url
            ? `${CDN_PATH}/${media.thumbnail_url}`
            : undefined,
          id: media.id, // Important: media id for deletion
          type: media.media_type || "image",
          mediaType: media.media_type,
        })) || [];

      const formValues = {
        event_name: eventDetails.event_name,
        description: eventDetails.description,
        category_id: eventDetails.category?.id,
        sub_category_id: eventDetails.sub_category?.id,
        place: placeInfo?.id ?? placeInfo?.name,
        place_id: placeInfo?.id ?? placeInfo?.name,
        venue_id: venueIds,
        venue_ids: venueIds,
        tax_ids: eventDetails.taxs?.map((tax) => tax.id) || [],
        available_types: eventDetails.available_types,
        max_capacity: eventDetails.max_capacity || 0,
        event_type_id: eventDetails.event_type_id,
        ticket_structure_id:
          ticketStructureInfo?.ticket_structures?.[0]?.ticket_structure,
        offer: eventDetails.event_offers?.map((offer) => offer.offer.id) || [],
        coupon:
          eventDetails.event_coupons?.map((coupon) => coupon.coupons.id) || [],
        banner_images: bannerFiles,
        event_images: eventImageFiles,
        thumbnail_image: thumbnailFile,
      };

      form.setFieldsValue(formValues);
      dispatch(setEventFormData(formValues));

      // Load related data
      if (eventDetails.taxs && eventDetails.taxs.length > 0) {
        dispatch(setSelectedTaxDetails(eventDetails.taxs));
      }

      if (eventDetails.category?.id) {
        dispatch(fetchSubcategories({ category_id: eventDetails.category.id }));
      }

      if (placeInfo?.id) {
        dispatch(getVenues({ place_id: placeInfo.id }));
      }

      if (ticketStructureInfo?.ticket_structures?.[0]?.ticket_structure) {
        dispatch(fetchAllTickets({ venue_id: ticketStructureInfo.venue.id }));
      }

      dispatch(getAvailableTicketsType());

      // Load selected offers
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

      // Load selected coupons
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

      console.log("✅ Edit mode form population complete");
    }
  }, [
    eventDetails,
    mode,
    form,
    dispatch,
    selectedOffers.length,
    selectedCoupons.length,
  ]);

  // Update form when formData changes (but preserve images)
  useEffect(() => {
    if (isInitialized.current && (mode === EDIT || mode === "LEAD")) {
      const currentImages = preserveImages(formData);
      const updatedFormData = { ...formData, ...currentImages };
      form.setFieldsValue(updatedFormData);
    }
  }, [form, formData, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up EventForm on unmount");
    };
  }, []);

  const validateCurrentSection = useCallback(async () => {
    const currentSection = getRoleBasedEventSections()[currentStep];
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
        return false;
      }

      const newErrors = { ...validationErrors };
      delete newErrors[sectionKey];
      dispatch(setValidationErrors(newErrors));
      return true;
    } catch (error) {
      return false;
    }
  }, [form, currentStep, dispatch, validationErrors, formData]);

  const handleNext = async () => {
    dispatch(setLoading(true));

    try {
      const values = await form.validateFields();
      console.log("Form Values:", values);
      console.warn("formData in handleNext:", formData);
      const currentSection = getRoleBasedEventSections()[currentStep];

      // Preserve images when updating section data
      const preservedImages = preserveImages(formData);
      const dataWithImages = { ...values, ...preservedImages };
      console.warn("completedSections", completedSections);
      dispatch(
        updateSectionData({ section: currentSection.key, data: dataWithImages })
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      const validationResult = await validateCurrentSection();

      if (!validationResult) {
        const currentSectionErrors = validationErrors[currentSection.key] || [];

        if (currentSectionErrors.length > 0) {
          const firstError = currentSectionErrors[0];
          const errorMessage =
            firstError.errors?.[0] ||
            "Please complete all required fields before proceeding";
          message.error(errorMessage);
        } else {
          message.error(
            "Please complete all required fields before proceeding"
          );
        }
        return;
      }

      const resultAction = await dispatch(checkEventValidation());

      if (checkEventValidation.fulfilled.match(resultAction)) {
        const newCompletedSections = [...completedSections, currentStep];
        dispatch(setCompletedSections(newCompletedSections));

        if (currentStep < getRoleBasedEventSections().length - 1) {
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

  const handleFieldsChange = useCallback(() => {
    const currentValues = form.getFieldsValue();
    const currentSection = getRoleBasedEventSections()[currentStep];

    // Preserve images when updating section data
    const preservedImages = preserveImages(formData);
    const dataWithImages = { ...currentValues, ...preservedImages };

    dispatch(
      updateSectionData({
        section: currentSection.key,
        data: dataWithImages,
      })
    );
  }, [form, currentStep, dispatch, formData]);

  const handlePrev = () => {
    if (currentStep > 0) {
      const currentValues = form.getFieldsValue();
      const currentSection = getRoleBasedEventSections()[currentStep];

      const preservedImages = preserveImages(formData);
      const dataWithImages = { ...currentValues, ...preservedImages };

      dispatch(
        updateSectionData({
          section: currentSection.key,
          data: dataWithImages,
        })
      );

      dispatch(setCurrentStep(currentStep - 1));

      const targetSection = getRoleBasedEventSections()[currentStep - 1];
      if (targetSection?.key === "basic") {
        const hasImages =
          dataWithImages.thumbnail_image?.length > 0 ||
          dataWithImages.banner_images?.length > 0 ||
          dataWithImages.event_images?.length > 0;

        if (!hasImages && mode === EDIT) {
          showImageResetWarning();
        }
      }
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      const currentValues = form.getFieldsValue();
      const currentSection = getRoleBasedEventSections()[currentStep];

      const preservedImages = preserveImages(formData);
      const dataWithImages = { ...currentValues, ...preservedImages };

      dispatch(
        updateSectionData({
          section: currentSection.key,
          data: dataWithImages,
        })
      );

      dispatch(setCurrentStep(step));

      const targetSection = getRoleBasedEventSections()[step];
      if (targetSection?.key === "basic") {
        const hasImages =
          dataWithImages.thumbnail_image?.length > 0 ||
          dataWithImages.banner_images?.length > 0 ||
          dataWithImages.event_images?.length > 0;

        if (!hasImages && mode === EDIT) {
          showImageResetWarning();
        }
      }
    } else {
      message.warning("Please use the Next button to proceed to the next step");
    }
  };

  const handleSubmit = async () => {
    console.log("handleSubmit triggered - Mode:", mode);
    dispatch(setLoading(true));

    try {
      const finalValues = await form.validateFields();
      console.log("Form validation successful");
      console.log("Final Values from form:", finalValues);

      const preservedImages = preserveImages(formData);
      console.log("Preserved Images:", preservedImages);

      const completeFormData = {
        ...formData,
        ...finalValues,
        ...preservedImages,
        event_type_id: eventType.find((item) => item.name === EVENT_TYPES.event)
          ?.id,
      };

      console.log("Complete Form Data:", completeFormData);
      console.log(
        "Thumbnail from completeFormData:",
        completeFormData.thumbnail_image
      );

      // ✅ Extract original file objects for S3 upload
      const originalFiles = extractFileObjects(completeFormData);
      dispatch(setOriginalFiles(originalFiles));

      // ✅ REMOVED ALL TRANSFORMATION - Pass RAW data to handleCreateModeSubmission
      // The transformation will happen inside transformFormDataForAPI

      if (mode === EDIT) {
        console.log("Submission mode: EDIT");
        await handleEditModeSubmission(completeFormData);
      } else {
        console.log("Submission mode:", mode.toUpperCase());
        // ✅ Pass RAW completeFormData with arrays intact
        await handleCreateModeSubmission(completeFormData);
      }

      console.log("Submission handled successfully");
    } catch (error) {
      console.error("Error during submission:", error);
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

  const handleEditModeSubmission = async (completeFormData) => {
    const offers = {
      offer_ids: selectedOffers?.map((offer) => offer.id) || [],
      coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
    };

    // ✅ Transform images for EDIT mode using the utility function
    const transformedData = transformFormDataForAPI(completeFormData, {
      selectedOffers,
      selectedCoupons,
      selectedVenueList,
      ticketTypes,
      availableSeats,
    });

    const editData = {
      ...transformedData,
      ...offers,
      max_tickets: parseInt(completeFormData.max_tickets || "0", 10),
      id: eventId,
    };

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
      throw error;
    }
  };

  const handleCreateModeSubmission = async (completeFormData) => {
    console.log(`➕ handleCreateModeSubmission started - Mode: ${mode}`);

    const selectedOffersSafe = selectedOffers || [];
    const selectedCouponsSafe = selectedCoupons || [];
    const selectedVenueListSafe = selectedVenueList || [];
    const ticketTypesSafe = ticketTypes || [];
    const availableSeatsSafe = availableSeats || [];

    try {
      // Transform data using the utility function
      const transformedData = transformFormDataForAPI(completeFormData, {
        selectedOffers: selectedOffersSafe,
        selectedCoupons: selectedCouponsSafe,
        selectedVenueList: selectedVenueListSafe,
        ticketTypes: ticketTypesSafe,
        availableSeats: availableSeatsSafe,
        eventId: mode === "LEAD" ? eventId : undefined,
      });

      console.log("✅ Data transformation completed");
      console.log("📤 Final transformed data:", transformedData);

      const offerValidationResult = await dispatch(
        validateOfferCoupon({
          offers: selectedOffersSafe,
          coupons: selectedCouponsSafe,
        })
      );

      if (validateOfferCoupon.fulfilled.match(offerValidationResult)) {
        const response = offerValidationResult.payload;

        if (response.message === "warning") {
          dispatch(setOfferCouponValidationDialogVisible(true));
          return;
        } else if (response.data && response.data[0]?.validation_status) {
          dispatch(setSelectedSubmitItem(transformedData));
          console.log(`✅ Event data set for submission - Mode: ${mode}`);
        } else {
          throw new Error("Offer/coupon validation failed");
        }
      } else {
        throw new Error(
          offerValidationResult.payload || "Offer validation failed"
        );
      }
    } catch (error) {
      console.error("❌ Error in handleCreateModeSubmission:", error);
      throw error;
    }
  };

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

  const renderSectionContent = () => {
    const currentSection = getRoleBasedEventSections()[currentStep];
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
        return <LocationDetailsField {...commonProps} mode={mode} />;
      case "ticket":
        return <TicketSelection {...commonProps} mode={mode} />;
      case "pricing":
        return <OfferField {...commonProps} mode={mode} />;
      case "additionalinfo":
        return <EventBookingInfo {...commonProps} />;
      default:
        return null;
    }
  };

  // Don't render until initialized
  if (!isInitialized.current) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4">
        {mode === EDIT
          ? "Edit Event"
          : mode === "LEAD"
          ? "Create Event from Lead"
          : "Create Event"}
      </h2>

      {/* Image Reset Warning Banner */}
      {imagesResetWarning && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-orange-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-800 font-medium">
                ⚠️ Images have been reset. Please select them again.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="text-orange-400 hover:text-orange-600"
                onClick={() => setImagesResetWarning(false)}
              >
                <span className="sr-only">Dismiss</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
        <DraftSystem
          form={form}
          formType="event"
          mode={mode}
          recordId={eventId}
          titleField="event_name"
          excludeFromDraft={[
            "id",
            "created_at",
            "thumbnail_image",
            "banner_images",
            "event_images",
          ]}
          style={{ marginRight: 12, display: "inline-block" }}
          enableAutoSave={mode !== EDIT}
          externalFormData={formData}
          onGetCompleteData={() => {
            const currentValues = form.getFieldsValue();
            const preservedImages = preserveImages(formData);
            return {
              ...formData,
              ...currentValues,
              ...preservedImages,
            };
          }}
          onDraftLoaded={(draft) => {
            console.log("📥 Draft loaded, merging with Redux state");

            const clonedFormValues = JSON.parse(
              JSON.stringify(draft.formValues)
            );

            ["thumbnail_image", "banner_images", "event_images"].forEach(
              (field) => {
                if (
                  clonedFormValues[field] &&
                  Array.isArray(clonedFormValues[field])
                ) {
                  clonedFormValues[field] = clonedFormValues[field].map(
                    (file) => ({ ...file })
                  );
                }
              }
            );

            const currentFormData = formData || {};
            const mergedData = {
              ...currentFormData,
              ...clonedFormValues,
            };
            console.log("🔍 Merged Data:", mergedData);
            dispatch(setEventFormData(mergedData));

            const hasImages =
              mergedData.thumbnail_image?.length > 0 ||
              mergedData.banner_images?.length > 0 ||
              mergedData.event_images?.length > 0;

            if (
              !hasImages &&
              (draft.formValues.thumbnail_image?.length > 0 ||
                draft.formValues.banner_images?.length > 0 ||
                draft.formValues.event_images?.length > 0)
            ) {
              showImageResetWarning();
            }
          }}
        />

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
            Step {currentStep + 1} of {getRoleBasedEventSections().length}
          </span>
          <div className="text-sm text-gray-400 mt-1">
            {getRoleBasedEventSections()[currentStep]?.title}
          </div>
          <div className="text-xs text-green-600 mt-1">
            {completedSections.length} of {getRoleBasedEventSections().length}{" "}
            sections completed
          </div>
        </div>
        {currentStep < getRoleBasedEventSections().length - 1 ? (
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
            loading={isLoading || isUploading}
            className="min-w-[120px] bg-green-600 hover:bg-green-700"
          >
            {isLoading || isUploading
              ? mode === EDIT
                ? "Updating..."
                : mode === "LEAD"
                ? "Creating from Lead..."
                : "Creating..."
              : mode === EDIT
              ? "Update Event"
              : mode === "LEAD"
              ? "Create from Lead"
              : "Create Event"}
          </Button>
        )}
      </div>

      <Steps
        current={currentStep}
        type="navigation"
        size="small"
        className="site-navigation-steps mb-8"
      >
        {getRoleBasedEventSections().map((section, index) => {
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

      {validationErrors[getRoleBasedEventSections()[currentStep]?.key]?.length >
        0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 font-medium mb-2">
            Please fix the following errors:
          </p>
          <ul className="text-red-600 text-sm list-disc list-inside">
            {validationErrors[getRoleBasedEventSections()[currentStep].key].map(
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

      <Form
        form={form}
        layout="vertical"
        size="large"
        initialValues={{}}
        onFieldsChange={handleFieldsChange}
        onValuesChange={(changedValues, allValues) => {
          dispatch(setEventFormData(allValues));

          const changedKey = Object.keys(changedValues)[0];

          if (["category_id", "place_id", "venue_id"].includes(changedKey)) {
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
        }}
      >
        <div className="min-h-[400px] relative">{renderSectionContent()}</div>
      </Form>

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

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === EDIT ? editEvent : addEvent}
        navigationPath={`${APP_PREFIX_PATH}/event/list`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType="event"
        setIsUploading={setIsUploading}
        extraFieldsFromResponse={[
          "thumbnail_image_upload_url",
          "banner_images_upload_url",
          "event_images_upload_url",
        ]}
        uploadFieldConfigs={UPLOAD_FIELD_CONFIGS.EVENT}
      />
    </div>
  );
}
