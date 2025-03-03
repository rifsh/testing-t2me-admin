import { Button, Form } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import { ActionType } from "utils/api/warning-submit-util";
import LoadingOverlay from "components/util-components/Loader/index";
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
    loading,
    submitLoading,
    responseData,
    responseMessage,
    responseImpactData,
    dialogVisible,
    eventDetails,
    warningPagination,
    selectedEvent,
    modalLoading,
    editable_status,
    messages: warningMessage,
  } = useSelector((state) => state.event);
  const {
    ticketTypes,
    filteredTickets,
    availableTicketTyps,
  } = useSelector((state) => state.tickets);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { message } = useSelector(
    (state) => state.organizerUpdates
  );
  const { selectedTax } = useSelector((state) => state.tax);
 const { selectedVenue, selectedVenueList } = useSelector(
    (state) => state.locations
  );

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch]);

  useEffect(() => {
    if (
      mode === "EDIT" &&
      eventDetails &&
      !selectedOffers.length &&
      !selectedCoupons.length
    ) {
      console.log("Setting form values and selected offers/coupons");
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
          event_images: eventDetails.media
          ? eventDetails.media.map((image, index) => ({
              uid: `-${index + 1}`,
              name: image.media_url.split("/").pop(),
              status: "done",
              url: image.media_url,
            }))
          : [],
      };

      form.setFieldsValue(formValues);

      // Set tax details
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

      // Set offers
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

      // Set coupons
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

      // // Set ticket data
      // if (eventDetails.available_types ) {
      //   console.log("KERYYYYYYYYYYYYYYYYY");

      //   // Set the booking type
      //   const ticketType = availableTicketTyps.available_types.find(
      //     (type) =>
      //       type.name.toLowerCase() ===
      //       eventDetails.available_types.toLowerCase()
      //   );
      //   console.log("THIS IS TICKET", ticketType);
      //   if (ticketType) {
      //     dispatch(setSelectedTicketType(ticketType.id));
      //     form.setFieldsValue({
      //       available_types: ticketType.id,
      //     });
      //   }

      //   // Set ticket structures and populate ticket sets
      //   if (eventDetails.event_ticket_structures?.length > 0) {
      //     const ticketStructure = eventDetails.event_ticket_structures[0];

      //     // Set the ticket structure in the form
      //     form.setFieldsValue({
      //       ticket_structure_id: ticketStructure.ticket_structure.id,
      //     });

      //     console.log("FILTERED TICKETS",filteredTickets);

      //     const selectedStructure = filteredTickets.find(
      //       (ticket) => ticket.id === ticketStructure.ticket_structure.id
      //     );

      //     if (selectedStructure) {
      //       dispatch(setSelectedTicketStructureforEvent(selectedStructure));

      //       eventDetails.event_ticket_structures.forEach((structure) => {
      //         const ticketSetData = {
      //           venue_id: eventDetails.venue?.id,
      //           place_id: eventDetails.venue?.place?.id,
      //           name: structure.ticket_structure.name,
      //           ticket_set: structure.ticket_set,
      //           id: structure.ticket_structure.id,
      //           ticketStructureId: structure.ticket_structure.id,
      //         };
      //         dispatch(addOrUpdateTicketSetforEvent(ticketSetData));
      //       });
      //     }
      //   }
      // }
    }
  }, [
    eventDetails,
    mode,
    form,
    dispatch,
    availableTicketTyps,
    filteredTickets,
  ]);

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

      // const isValid = await validateCurrentStep(values);
      // if (!isValid) {
      //   return;
      // } // note-----------

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
      console.log(submitData, "asdfghj")
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
  const handleWarningPagination = (page, size) => {
    console.log("------------------------");

    console.log("CHANIGN...........");

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

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  return (
    <div>
      <h2>{mode === "EDIT" ? "Edit Event" : "Create Event"}</h2>
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
          dataKey: "active_schedules",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === "EDIT" ? editEvent : addEvent}
        navigationPath={`${APP_PREFIX_PATH}/event/list`}
        responseMessage={responseMessage}
      />
    </div>
  );
};

export default MultyStepEventForm;
