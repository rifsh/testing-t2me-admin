import { Button, Form } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import { ActionType } from "utils/api/warning-submit-util";
import LoadingOverlay from "components/util-components/Loader/index";
import { setSelectedVenueList } from "store/slices/locationSlice";
// import { setSelectedSubmitItem } from "store/slices/modalSlice";
import {
  addEvent,
  setSubmitData,
  setCurrentStep,
  setSubmitLoading,
  checkEventValidation,
  fetchEventDetails,
  toggleSelectedCoupon,
  resetState,
  editEvent,
  toggleSelectedOffer,
  setSelectedEvent,
  setDialogVisible,
  setModalLoading,
} from "store/slices/eventSlice";
import { getSingleLeadEvents, addLeadEvent } from "store/slices/leadEventSlice";

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
import { SubmitAndConfirmModal } from "../../../components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getCurrentUser } from "configs/UserAccessConfig";
import { getEventFormSteps } from "configs/UserAccessConfig";
import getEventFormItems from "configs/UserAccessConfig";

const MultyStepEventForm = ({ eventId, mode }) => {
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    submitLoading,
    selectedEvent,
  } = useSelector((state) => state.event);
  const { singleLeadEvent, loading, error, responseData, responseMessage } =
    useSelector((state) => state.leadEvents);
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
    if (eventId && !singleLeadEvent) {
      dispatch(getSingleLeadEvents(eventId));
    }
  }, [dispatch, eventId, singleLeadEvent]);
  useEffect(() => {
    if (
      mode === "LEAD" &&
      singleLeadEvent &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      const formValues = {
        event_name: singleLeadEvent.event_name,
        description: singleLeadEvent.description,
        place: singleLeadEvent.place?.name,
        // venue_id: singleLeadEvent.venues?.map((venue) => venue.id) || [],
      };

      form.setFieldsValue(formValues);

      // const placeIds = singleLeadEvent.venues
      //   ?.map((venue) => venue.place?.id)
      //   .filter((id) => id);

      // if (placeIds.length > 0) {
        // Clear previously selected venues
        // dispatch(setSelectedVenueList("clear"));

        // Fetch venues for the place
        // dispatch(getVenues({ place_id: placeIds[0] }));

        // Store venue IDs that need to be selected once venues are loaded
        // const venueIdsToSelect =
        //   singleLeadEvent.venues?.map((venue) => venue.id) || [];
        // sessionStorage.setItem(
        //   "venueIdsToSelect",
        //   JSON.stringify(venueIdsToSelect)
        // );
      // }
    }
  }, [
    singleLeadEvent,
    mode,
    form,
    dispatch,
    availableTicketTyps,
    filteredTickets,
  ]);

  // Add a separate effect to handle venue selection after venues are loaded
  useEffect(() => {
    if (filteredVenues && filteredVenues.length > 0) {
      const venueIdsToSelectString = sessionStorage.getItem("venueIdsToSelect");

      if (venueIdsToSelectString) {
        const venueIdsToSelect = JSON.parse(venueIdsToSelectString);

        // Select each venue that matches the IDs
        venueIdsToSelect.forEach((id) => {
          const venue = filteredVenues.find((v) => v.id === id);
          if (venue) {
            dispatch(setSelectedVenueList([venue]));
          }
        });

        // Clear the stored IDs
        sessionStorage.removeItem("venueIdsToSelect");
      }
    }
  }, [filteredVenues, dispatch]);
  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

  // VALIDATION STEP PROCESS

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
        console.log(selectedTax, "TAXXXXXXXX");

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
          /* } else {
            message.success("You have reached the final step!");
          */
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
    try {
      if (mode === "EDIT") {
        const offers = {
          offer_ids: selectedOffers?.map((offer) => offer.id) || [],
          coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
        };

        const data = {
          ...submitData,
          ...offers,
          max_tickets: parseInt(submitData.max_tickets || "0", 10),
          id: eventId,
        };
        console.log("Edit Data:", data);

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
              editEvent({ data, action: ActionType.WARNING })
            );

            if (editEvent.fulfilled.match(resultAction)) {
              dispatch(setSelectedEvent(data));
              dispatch(setDialogVisible(true));
            }
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
        if (mode === "LEAD" && singleLeadEvent?.id) {
          finalData.lead_id = singleLeadEvent.id;
        }

        console.log("HELOOOOOOOOOOOOOOOO");

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

  return (
    <div>
      <h2>{mode === "LEAD" ? "Lead Event" : "Create Event"}</h2>

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
              }}
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
            <p style={{ marginTop: "8px" }}>{step}</p>
          </div>
        ))}
      </div>
      <div style={{ marginLeft: "50px", marginRight: "50px" }}>
        <Form layout="vertical" form={form}>
          {getEventFormItems(form, currentStep, mode)}
        </Form>
      </div>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        {currentStep === 1 ? (
          <DiscardButton form={form} />
        ) : (
          <Button type="default" onClick={prevStep} style={{ marginRight: 8 }}>
            Previous
          </Button>
        )}
        {currentStep < getEventFormSteps().length ? (
          <Button type="primary" loading={submitLoading} onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="primary" loading={submitLoading} onClick={onFinish}>
            Submit
          </Button>
        )}
      </div>
      <LoadingOverlay loading={loading} />

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editEvent : addLeadEvent}
        navigationPath={`${APP_PREFIX_PATH}/leadevent/list`}
        responseMessage={responseMessage}mode={mode}
        form={form}
        formType={"lead-event"}

      />
    </div>
  );
};

export default MultyStepEventForm;
