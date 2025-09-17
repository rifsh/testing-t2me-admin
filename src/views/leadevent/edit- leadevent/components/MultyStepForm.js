import { Button, Form, Alert } from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import { ActionType } from "utils/api/warning-submit-util";
import LoadingOverlay from "components/util-components/Loader/index";
import { setSelectedVenueList } from "store/slices/locationSlice";
import {
  addEvent,
  setSubmitData,
  setCurrentStep,
  setSubmitLoading,
  checkEventValidation,
  resetState,
  editEvent,
  setSelectedEvent,
  setDialogVisible,
  setModalLoading,
} from "store/slices/eventSlice";
import {
  fetchLeadEventDetails,
  addLeadEvent,
  editLeadEvent,
} from "store/slices/leadEventSlice";

import {
  setSelectedTaxDetails,
  validateTax,
  setTaxValidationDialogVisible,
} from "store/slices/taxSlice";
import {
  getVenues,
  validateVenue,
  setPlaceValidationDialogVisible,
} from "store/slices/locationSlice";
import {
  fetchAllTickets,
  validateTicket,
  setTicketValidationDialogVisible,
  getAvailableTicketsType,
} from "store/slices/ticketSlice";
import {
  fetchSubcategories,
  validateSubCategory,
  setCategoryValidationDialogVisible,
} from "store/slices/categorySlice";
import {
  validateOfferCoupon,
  setOfferCouponValidationDialogVisible,
} from "store/slices/offerSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "../../../../components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getCurrentUser } from "configs/UserAccessConfig";
import { getEventFormSteps } from "configs/UserAccessConfig";
import getEventFormItems from "configs/UserAccessConfig";

const MultyStepEventForm = ({ eventId, mode }) => {
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const navigate = useNavigate();

  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    submitLoading,
    selectedEvent,
    dialogVisible,
    responseImpactData,
    modalLoading,
  } = useSelector((state) => state.event);
  const {
    eventDetails,
    loading,
    error,
    responseData,
    responseMessage,
    messages: warningMessage,
  } = useSelector((state) => state.leadEvents);
  const { ticketTypes, filteredTickets, availableTicketTyps } = useSelector(
    (state) => state.tickets
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { message } = useSelector((state) => state.organizerUpdates);
  const { selectedTax } = useSelector((state) => state.tax);
  const { selectedVenue, selectedVenueList, filteredVenues } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (eventId) {
          await dispatch(fetchLeadEventDetails(eventId)).unwrap();
        }
        dispatch(resetState());
        setIsInitialLoadComplete(true);
      } catch (err) {
        console.error("Failed to fetch event details:", err);
        setLoadError(err);
        setIsInitialLoadComplete(true);
      }
    };

    fetchInitialData();
  }, [dispatch, eventId]);

  useEffect(() => {
    if (mode === "EDITLEAD" && eventDetails && isInitialLoadComplete) {
      try {
        const formValues = {
          event_name: eventDetails.event_name || "",
          description: eventDetails.description || "",
          place:
            eventDetails.lead_venue_events?.[0]?.lead_venue?.place?.name || "",
          venue_id:
            eventDetails.lead_venue_events?.map(
              (event) => event.lead_venue?.id
            ) || [],
          category_id: eventDetails.category?.id,
          sub_category_id: eventDetails.sub_category?.id,
          available_types: eventDetails.available_types,
          thumbnail_image: eventDetails.thumbnail_image
            ? [
                {
                  uid: "-1",
                  name: eventDetails.thumbnail_image.split("/").pop(),
                  status: "done",
                  url: eventDetails.thumbnail_image,
                },
              ]
            : [],
          banner_images: eventDetails.media
            ? eventDetails.media.map((image, index) => ({
                uid: `-${index + 1}`,
                name: image.media_url.split("/").pop(),
                status: "done",
                url: image.media_url,
              }))
            : [],
        };

        form.setFieldsValue(formValues);
        const placeIds = eventDetails.lead_venue_events
          ?.map((event) => event.lead_venue?.place?.id)
          .filter((id) => id);

        if (placeIds.length > 0) {
          dispatch(setSelectedVenueList("clear"));
          dispatch(getVenues({ place_id: placeIds[0] }));

          const venueIdsToSelect =
            eventDetails.lead_venue_events?.map(
              (event) => event.lead_venue?.id
            ) || [];

          sessionStorage.setItem(
            "venueIdsToSelect",
            JSON.stringify(venueIdsToSelect)
          );
        }
      } catch (err) {
        console.error("Error populating form:", err);
        setLoadError(err);
      }
    }
  }, [eventDetails, mode, form, dispatch, isInitialLoadComplete]);

  useEffect(() => {
    if (filteredVenues && filteredVenues.length > 0) {
      const venueIdsToSelectString = sessionStorage.getItem("venueIdsToSelect");

      if (venueIdsToSelectString) {
        const venueIdsToSelect = JSON.parse(venueIdsToSelectString);

        venueIdsToSelect.forEach((id) => {
          const venue = filteredVenues.find((v) => v.id === id);
          if (venue) {
            dispatch(setSelectedVenueList([venue]));
          }
        });

        sessionStorage.removeItem("venueIdsToSelect");
      }
    }
  }, [filteredVenues, dispatch]);

  const validateCurrentStep = async (values) => {
    switch (currentStep) {
      case 2:
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
        } else {
          return false;
        }
        break;

      case 3:
        const venueId = values.venue_id;
        const resultActionVenue = await dispatch(validateVenue(venueId));

        if (validateVenue.fulfilled.match(resultActionVenue)) {
          const response = resultActionVenue.payload;

          if (response.message === "warning") {
            dispatch(setPlaceValidationDialogVisible(true));
            return false;
          } else if (response.data && response.data[0]?.validation_status) {
            return true;
          }
        } else {
          return false;
        }
        break;
      case 4:
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
          } else {
            return false;
          }
        } else {
          return true;
        }

        break;
      case 5:
        const ticketId = values.ticket_structure_id;
        const resultActionTicket = await dispatch(validateTicket(ticketId));

        if (validateTicket.fulfilled.match(resultActionTicket)) {
          const response = resultActionTicket.payload;

          if (response.message === "warning") {
            dispatch(setTicketValidationDialogVisible(true));
            return false;
          } else if (response.data && response.data[0]?.validation_status) {
            return true;
          }
        } else {
          return false;
        }
        break;
    }
    return true;
  };

  const nextStep = async () => {
    dispatch(setSubmitLoading(true));
    try {
      const values = await form.validateFields();

      const resultAction = await dispatch(checkEventValidation());

      if (checkEventValidation.fulfilled.match(resultAction)) {
        dispatch(setSubmitData(values));

        if (currentStep < getEventFormSteps().length) {
          dispatch(setCurrentStep(currentStep + 1));
        }
      } else {
        const errorMessage =
          resultAction.payload || "Event validation failed. Please try again.";
        message.error(errorMessage);
      }
    } catch (error) {
      message.error(
        error.message || "Please ensure all required fields are filled."
      );
    } finally {
      dispatch(setSubmitLoading(false));
    }
  };

  const onFinish = async () => {
    const values = await form.validateFields();

      const resultAction = await dispatch(checkEventValidation());

      if (checkEventValidation.fulfilled.match(resultAction)) {
        dispatch(setSubmitData(values));

        if (currentStep < getEventFormSteps().length) {
          dispatch(setCurrentStep(currentStep + 1));
        }
      } else {
        const errorMessage =
          resultAction.payload || "Event validation failed. Please try again.";
        message.error(errorMessage);
      }
    try {
      if (mode === "EDITLEAD") {
        const offers = {
          offer_ids: selectedOffers?.map((offer) => offer.id) || [],
          coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
        };
        const venue_id = {
          venue_ids: selectedVenueList?.map((venue) => venue.id) || [],
        };
        const ticket_structure = {
          ticket_structure: ticketTypes.reduce((acc, ticketType) => {
            const structureItems = ticketType.ticket_types.map((ticket) => ({
              id: ticket.ticketStructureId,
              ticket_set: ticket.ticket_set,
            }));
            return [...acc, ...structureItems];
          }, []),
        };

        const data = {
          ...submitData,
          ...offers,
          ...venue_id,
          ...ticket_structure,
          max_tickets: parseInt(submitData.max_tickets || "0", 10),
          id: eventId,
        };

        const resultAction = await dispatch(
          validateOfferCoupon({
            offers: selectedOffers,
            coupons: selectedCoupons,
          })
        );
        if (validateOfferCoupon.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setOfferCouponValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            const resultAction = await dispatch(
              editLeadEvent({ data, action: ActionType.WARNING })
            );

            console.log(" editLeadEvent result:", resultAction);

            if (editLeadEvent.fulfilled.match(resultAction)) {
              console.log(" editLeadEvent fulfilled, updating selected event");

              dispatch(setSelectedEvent(data));
              dispatch(setDialogVisible(true));
            } else {
              console.log(" editLeadEvent failed");
            }
          } else {
            console.log(" No validation status found");
          }
        }
      } else {
        dispatch(setSubmitLoading(true));
        const offers = {
          offer_ids: selectedOffers?.map((offer) => offer.id) || [],
          coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
        };
        const venue_id = {
          venue_ids: selectedVenueList?.map((venue) => venue.id) || [],
        };
        const ticket_structure = {
          ticket_structure: ticketTypes.reduce((acc, ticketType) => {
            const structureItems = ticketType.ticket_types.map((ticket) => ({
              id: ticket.ticketStructureId,
              ticket_set: ticket.ticket_set,
            }));
            return [...acc, ...structureItems];
          }, []),
        };

        const finalData = {
          ...submitData,
          ...venue_id,
          ...ticket_structure,
          ...offers,
          max_tickets: parseInt(submitData.max_tickets || "0", 10),
        };
        if (mode === "LEAD" && eventDetails?.id) {
          finalData.lead_id = eventDetails.id;
        }

        const resultAction = await dispatch(
          validateOfferCoupon({
            offers: selectedOffers,
            coupons: selectedCoupons,
          })
        );
        if (validateOfferCoupon.fulfilled.match(resultAction)) {
          const response = resultAction.payload;
          if (response.message === "warning") {
            dispatch(setOfferCouponValidationDialogVisible(true));
          } else if (response.data && response.data[0]?.validation_status) {
            dispatch(setSelectedSubmitItem(finalData));
          }
        }
      }
    } catch (error) {
      console.error("Submission Error:", error);
      message.error("An error occurred during submission.");
    } finally {
      dispatch(setSubmitLoading(false));
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  // Defensive render with loading and error states
  if (!isInitialLoadComplete) {
    return <LoadingOverlay loading={true} />;
  }
  const handleModalCancel = () => {
    dispatch(setDialogVisible(false));
  };

  const handleModalSubmit = async () => {
    dispatch(setModalLoading(true));
    const resultAction = await dispatch(
      editLeadEvent({ data: selectedEvent, action: ActionType.SUBMIT })
    );
    dispatch(setModalLoading(false));
    dispatch(setDialogVisible(false));
    if (editLeadEvent.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedEvent));
    }
  };
// Add this function to your component
const handleStepClick = async (stepNumber) => {
  // Don't do anything if clicking the current step
  if (stepNumber === currentStep) return;
  
  // If trying to go forward, validate the current step first
  if (stepNumber > currentStep) {
    try {
    
        dispatch(setCurrentStep(stepNumber));
    
    } finally {
      dispatch(setSubmitLoading(false));
    }
  } else {
    // If going backward, just navigate to that step
    dispatch(setCurrentStep(stepNumber));
  }
};
  if (loadError) {
    return (
      <Alert
        message="Error Loading Event"
        description={
          loadError.message || "Unable to load event details. Please try again."
        }
        type="error"
        style={{ margin: "20px" }}
        action={
          <Button type="primary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        }
      />
    );
  }
  return (
    <div>
      <h2>{mode === "EDITLEAD" ? "Edit Lead Event" : "Create Event"}</h2>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "50px",
        }}
      >
      {getEventFormSteps().map((step, index) => (
  <div key={index} style={{ textAlign: "center" }}>
    <div
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        backgroundColor: currentStep > index ? BLUE_BASE : GRAY_LIGHTER,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        position: "relative",
        cursor: "pointer", // Add cursor pointer to indicate it's clickable
        transition: "transform 0.2s, box-shadow 0.2s", // Add transition for hover effect
        // Add subtle hover effect
        ":hover": {
          transform: "scale(1.05)",
          boxShadow: "0 0 8px rgba(0,0,0,0.2)"
        }
      }}
      onClick={() => handleStepClick(index + 1)} // Add click handler
      title={`Go to ${step}`} // Add tooltip
    >
      {currentStep > index + 1 ? <FaCheckCircle /> : index + 1}
      {index < getEventFormSteps().length - 1 && (
        <div
          style={{
            width: "80px",
            height: "2px",
            backgroundColor:
              currentStep > index + 1 ? "#4CAF50" : "#ccc",
            position: "absolute",
            left: "50%",
            top: "20px",
            transform: "translateX(50%)",
            zIndex: -1,
          }}
        ></div>
      )}
    </div>
    <p 
      style={{ 
        marginTop: "8px",
        cursor: "pointer" // Make text clickable too
      }}
      onClick={() => handleStepClick(index + 1)} // Add click handler to text as well
    >
      {step}
    </p>
  </div>
))}
      </div>
      <div style={{ marginLeft: "50px", marginRight: "50px" }}>
        <Form layout="vertical" form={form}>
          {getEventFormItems(form, currentStep, mode)}
        </Form>
      </div>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        {currentStep > 1 && (
          <Button type="default" onClick={prevStep} style={{ marginRight: 8 }}>
            Previous
          </Button>
        )}

        {currentStep < getEventFormSteps().length && (
          <Button
            type="primary"
            loading={submitLoading}
            onClick={nextStep}
            style={{ marginRight: 8 }}
          >
            Next
          </Button>
        )}

        <Button type="primary" loading={submitLoading} onClick={onFinish}>
          Submit
        </Button>
      </div>

      <LoadingOverlay loading={loading} />
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
        // tableConfig={{
        //   title: "Active Schedules",
        //   dataKey: "active_schedules",
        //   dataKey: "active_schedules",
        // }}
      />

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDITLEAD" ? editLeadEvent : addLeadEvent}
        navigationPath={`${APP_PREFIX_PATH}/leadevent/convert`}
        responseMessage={responseMessage}
        mode={mode}
        form={form}
        formType={"leade-event-edit"}
      />
    </div>
  );
};

export default MultyStepEventForm;
