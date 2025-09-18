import React, { useState, useCallback, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Form, Steps, Button, message } from "antd";

import EventDetailsField from "./EventDetailsField";
import TicketSelection from "./TicketSelection";
import OfferField from "./OfferField";
import EventBookingInfo from "./BookingInfo";
import CategoryField from "./CategoryFileds";
import LocationDetailsField from "./LocationDetailsField copy";

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
} from "store/slices/eventSlice";

import { fetchSubcategories } from "store/slices/categorySlice";
import { getVenues } from "store/slices/locationSlice";
import { setSelectedTaxDetails } from "store/slices/taxSlice";
import {
  fetchAllTickets,
  getAvailableTicketsType,
} from "store/slices/ticketSlice";

import {
  validateOfferCoupon,
  setOfferCouponValidationDialogVisible,
} from "store/slices/offerSlice";

import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { EVENT_SECTIONS } from "constants/AppConstants";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { transformFormDataForAPI } from "../utils/formDataTransformer";
import { EVENT_TYPES } from "constants/PageConstants";

const { Step } = Steps;

export default function EventForm({ eventId, mode = "add" }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

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
  const { selectedVenueList } = useSelector((state) => state.locations);
  const { ticketTypes, availableSeats } = useSelector((state) => state.tickets);

  const completedSectionsSet = new Set(completedSections);

  useEffect(() => {
    form.setFieldsValue(formData);
  }, [form, formData]);

  useEffect(() => {
    if (eventId && mode === "edit") {
      dispatch(fetchEventDetails(eventId));
    }
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
  }, [dispatch, eventId, mode, eventType.length]);

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
      const currentValues = await form.validateFields();
      const currentSection = EVENT_SECTIONS[currentStep];

      dispatch(
        updateSectionData({ section: currentSection.key, data: currentValues })
      );

      await new Promise((resolve) => setTimeout(resolve, 0));

      const validationResult = await validateCurrentSection();

      if (!validationResult) {
        // Get the specific validation errors from Redux state
        const currentSectionErrors = validationErrors[currentSection.key] || [];

        if (currentSectionErrors.length > 0) {
          // Show the first specific error message
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

  const handleFieldsChange = useCallback(() => {
    const currentValues = form.getFieldsValue();
    const currentSection = EVENT_SECTIONS[currentStep];

    dispatch(
      updateSectionData({
        section: currentSection.key,
        data: currentValues,
      })
    );
  }, [form, currentStep, dispatch]);

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
    console.log("🚀 handleSubmit triggered");
    console.log("📊 Current formData:", formData);
    console.log("🏷️ Current mode:", mode);

    dispatch(setLoading(true));

    try {
      console.log("🔍 Starting form validation...");
      console.log("📝 Form instance:", form);

      const finalValues = await form.validateFields();
      console.log("✅ Form validation successful");
      console.log("📋 Final form values:", finalValues);
      console.log("📋 Final form values keys:", Object.keys(finalValues || {}));

      // Check for undefined values in finalValues
      Object.entries(finalValues || {}).forEach(([key, value]) => {
        if (value === undefined) {
          console.warn(`⚠️ Undefined value found for key: ${key}`);
        }
        if (Array.isArray(value)) {
          console.log(`📊 Array field ${key} has length:`, value.length);
        }
      });

      const completeFormData = {
        ...formData,
        ...finalValues,
        event_type_id: eventType.find((item) => item.name === EVENT_TYPES.event)
          ?.id,
      };
      console.log("🔄 Merging form data...");
      console.log("📦 Complete form data:", completeFormData);
      console.log(
        "📦 Complete form data keys:",
        Object.keys(completeFormData || {})
      );

      // Check for undefined values in completeFormData
      Object.entries(completeFormData || {}).forEach(([key, value]) => {
        if (value === undefined) {
          console.warn(
            `⚠️ Undefined value in completeFormData for key: ${key}`
          );
        }
        if (Array.isArray(value)) {
          console.log(
            `📊 Array field ${key} in completeFormData has length:`,
            value.length
          );
        } else if (value && typeof value === "object") {
          console.log(`🏷️ Object field ${key}:`, value);
        }
      });

      console.warn(completeFormData, "completeFormData");

      if (mode === "edit") {
        console.log("🔧 Submission mode: EDIT");
        console.log(
          "📤 Calling handleEditModeSubmission with:",
          completeFormData
        );
        await handleEditModeSubmission(completeFormData);
        console.log("✅ Edit mode submission completed");
      } else {
        console.log("➕ Submission mode: CREATE");
        console.log(
          "📤 Calling handleCreateModeSubmission with:",
          completeFormData
        );
        await handleCreateModeSubmission(completeFormData);
        console.log("✅ Create mode submission completed");
      }

      console.log("🎉 Submission handled successfully");
    } catch (error) {
      console.error("❌ Error during submission:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error name:", error.name);
      console.error("❌ Error message:", error.message);

      // Log additional error properties
      if (error.errorFields) {
        console.error("📝 Error fields:", error.errorFields);
        console.error("📝 Error fields length:", error.errorFields.length);
      }

      if (error.errorFields && error.errorFields.length > 0) {
        const firstError = error.errorFields[0];
        console.error("🎯 First validation error:", firstError);
        console.error("🎯 First error name:", firstError.name);
        console.error("🎯 First error errors:", firstError.errors);

        message.error(
          `Validation error: ${
            firstError.errors?.[0] || "Please check required fields"
          }`
        );
      } else if (error.message) {
        console.error("💬 Using error message:", error.message);
        message.error(`Submission failed: ${error.message}`);
      } else {
        console.error("❓ Unknown error type, using fallback message");
        message.error(
          "Failed to create event. Please check all fields and try again."
        );
      }
    } finally {
      console.log("🏁 Finally block executing");
      dispatch(setLoading(false));
      console.log("⏳ Loading state set to false");
    }
  };

  const handleEditModeSubmission = async (completeFormData) => {
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
    console.log("➕ handleCreateModeSubmission started");
    console.log("📊 Input data:", completeFormData);

    // Safe array handling with default empty arrays
    const selectedOffersSafe = selectedOffers || [];
    const selectedCouponsSafe = selectedCoupons || [];
    const selectedVenueListSafe = selectedVenueList || [];
    const ticketTypesSafe = ticketTypes || [];
    const availableSeatsSafe = availableSeats || [];

    console.log("🏢 Selected venues:", selectedVenueListSafe);
    console.log("🎫 Ticket types:", ticketTypesSafe);
    console.log("💺 Available seats:", availableSeatsSafe);

    try {
      // Use the transformer to convert form data to API structure
      const transformedData = transformFormDataForAPI(completeFormData, {
        selectedOffers: selectedOffersSafe,
        selectedCoupons: selectedCouponsSafe,
        selectedVenueList: selectedVenueListSafe,
        ticketTypes: ticketTypesSafe,
        availableSeats: availableSeatsSafe,
        eventId: eventId,
      });

      console.log("✅ Data transformation completed");
      console.log("📤 Final create data:", transformedData);

      // Validate offers and coupons
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
          // Use the transformed data for submission
          dispatch(setSelectedSubmitItem(transformedData));
          console.log("✅ Event data set for submission");
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
      {validationErrors[EVENT_SECTIONS[currentStep]?.key]?.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
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
      <Form
        form={form}
        layout="vertical"
        size="large"
        initialValues={formData}
        onFieldsChange={handleFieldsChange}
        onValuesChange={(changedValues, allValues) => {
          dispatch(setEventFormData(allValues));

          const changedKey = Object.keys(changedValues)[0];

          if (
            [
              "selected_ticket_types",
              "selected_seats",
              "ticket_sets",
              "ticket_quantities",
            ].includes(changedKey)
          ) {
            // Handle ticket data updates
          }

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
