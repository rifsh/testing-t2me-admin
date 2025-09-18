import React, { useState, useCallback, useEffect, useRef } from "react";
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
import { EVENT_SECTIONS } from "constants/AppConstants";
import { APP_PREFIX_PATH, CDN_PATH } from "configs/AppConfig";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import { transformFormDataForAPI } from "../utils/formDataTransformer";
import { EVENT_TYPES } from "constants/PageConstants";
import DraftSystem from "drafts/components/DraftSystem";

const { Step } = Steps;

export default function EventForm({ eventId, mode = "add" }) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const isInitialized = useRef(false); // Track if component has been initialized

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
        };

        form.setFieldsValue(initialValues);
        dispatch(setEventFormData(initialValues));

        console.log("✅ ADD mode initialization complete");
      } else if (mode === "edit" && eventId) {
        console.log("📝 EDIT mode - will load event data");
      }

      isInitialized.current = true;
    }
  }, []);

  useEffect(() => {
    if (!eventType.length) {
      dispatch(fetchEventType({ active: true }));
    }
  }, [dispatch, eventType.length]);

  // Handle edit mode data loading - separate from initialization
  useEffect(() => {
    if (eventId && mode === "edit" && isInitialized.current) {
      console.log("📥 Loading event details for edit mode");
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, eventId, mode]);

  // Populate form for edit mode when eventDetails are loaded
  useEffect(() => {
    if (
      mode === "edit" &&
      eventDetails &&
      isInitialized.current &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      console.log("📝 Populating form with event details");

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
      dispatch(setEventFormData(formValues));

      // Load related data
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

  // Update form when formData changes (but not on initial load for add mode)
  useEffect(() => {
    if (isInitialized.current && mode === "edit") {
      form.setFieldsValue(formData);
    }
  }, [form, formData, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Cleaning up EventForm on unmount");
      // Optionally clear states on unmount if needed
    };
  }, []);

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
    dispatch(setLoading(true));

    try {
      const finalValues = await form.validateFields();
      console.log("✅ Form validation successful");

      const completeFormData = {
        ...formData,
        ...finalValues,
        event_type_id: eventType.find((item) => item.name === EVENT_TYPES.event)
          ?.id,
      };

      if (mode === "edit") {
        console.log("🔧 Submission mode: EDIT");
        await handleEditModeSubmission(completeFormData);
      } else {
        console.log("➕ Submission mode: CREATE");
        await handleCreateModeSubmission(completeFormData);
      }

      console.log("🎉 Submission handled successfully");
    } catch (error) {
      console.error("❌ Error during submission:", error);

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

    const selectedOffersSafe = selectedOffers || [];
    const selectedCouponsSafe = selectedCoupons || [];
    const selectedVenueListSafe = selectedVenueList || [];
    const ticketTypesSafe = ticketTypes || [];
    const availableSeatsSafe = availableSeats || [];

    try {
      const transformedData = transformFormDataForAPI(completeFormData, {
        selectedOffers: selectedOffersSafe,
        selectedCoupons: selectedCouponsSafe,
        selectedVenueList: selectedVenueListSafe,
        ticketTypes: ticketTypesSafe,
        availableSeats: availableSeatsSafe,
        eventId: eventId,
      });

      console.log("✅ Data transformation completed");

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

  // Don't render until initialized
  if (!isInitialized.current) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
        <DraftSystem
          form={form}
          formType="event"
          mode={mode}
          recordId={eventId}
          titleField="event_name"
          excludeFromDraft={["id", "created_at"]}
          style={{ marginRight: 12, display: "inline-block" }}
          enableAutoSave={mode !== "edit"}
          externalFormData={formData} // Pass Redux formData
          onGetCompleteData={() => {
            // This function returns complete data from all steps
            const currentValues = form.getFieldsValue();
            return {
              ...formData, // All previous steps data
              ...currentValues, // Current step data
            };
          }}
          onDraftLoaded={(draft) => {
            console.log("📥 Draft loaded, merging with Redux state");

            // Ensure file objects are extensible before setting state
            const clonedFormValues = JSON.parse(
              JSON.stringify(draft.formValues)
            );

            // Make file arrays extensible
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

            // Merge with existing Redux state, don't replace
            const currentFormData = formData || {};
            const mergedData = {
              ...currentFormData, // Preserve existing Redux data
              ...clonedFormValues, // Add/update with draft data
            };

            dispatch(setEventFormData(mergedData));
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
