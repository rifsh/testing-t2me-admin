import { Button, Form, message } from "antd";
import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import EventDetailsField from "./EventDetailsField";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import LocationDetailsField from "./LocationDetailsField";
import CategoryField from "./CategoryField";
import OfferField from "./OfferField";
import TicketField from "./TicketsField";
import {
  addEvent,
  setSubmitData,
  setCurrentStep,
  setSubmitLoading,
  resetSelected,
  fetchEventDetails,
  editEvent,
  setDialogVisible,
  setModalLoading,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ActionType } from "utils/api/warning-submit-util";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { resetTicketSelection } from "store/slices/ticketSlice";

const steps = ["Event Details", "Category", "Location", "Ticket", "Offers"];

const MultyStepEventForm = ({ eventId }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { eventDetails, loading, error } = useSelector((state) => state.event);
  const {
    currentStep,
    submitData,
    submitLoading,
    dialogVisible,
    modalLoading,
  } = useSelector((state) => state.event);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventDetails(eventId));
    }
  }, [dispatch, eventId]);

  useEffect(() => {
    if (eventDetails && eventId) {
      form.setFieldsValue({
        event_name: eventDetails.event_name,
        description: eventDetails.description,
        max_capacity: eventDetails.max_capacity,
        max_tickets: eventDetails.max_tickets,
        place_id: eventDetails.place_id,
        category_id: eventDetails.category.id,
        sub_category_id: eventDetails.sub_category.id,
        ticket_set: eventDetails.ticket_set,
        ticket_structure_id: eventDetails.ticket_structure_id,
        venue_id: eventDetails.venue.id,
        available_types: eventDetails.available_types,
        offer_ids: eventDetails.event_offers.map((offer) => offer.id),
        coupon_ids: eventDetails.event_coupons.map((coupon) => coupon.id),
      });
    }
  }, [eventDetails, eventId, form]);

  const renderLoadingState = () => (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <p>Loading event details...</p>
    </div>
  );

  const renderErrorState = () => (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <p>Error loading event details: {error}</p>
    </div>
  );

  if (loading) return renderLoadingState();
  if (error) return renderErrorState();

  const nextStep = async () => {
    try {
      const values = await form.validateFields();
      console.log("event details values", values);
      dispatch(setSubmitData(values));

      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
      dispatch(setSubmitLoading(false));
    } catch (info) {
      dispatch(setSubmitLoading(false));
      message.error("Please enter all required fields");
    }
  };

  const onFinish = async () => {
    try {
      const updatedSubmitData = {
        ...submitData,
        max_tickets: parseInt(submitData.max_tickets, 10),
      };

      if (eventId) {
        const resultAction = await dispatch(
          editEvent(updatedSubmitData, ActionType.WARNING)
        );
        if (editEvent.fulfilled.match(resultAction)) {
          dispatch(setDialogVisible(true));
        }
      } else {
        const resultAction = await dispatch(addEvent(updatedSubmitData));

        if (addEvent.fulfilled.match(resultAction)) {
          message.success(
            `Event ${updatedSubmitData.event_name} added successfully`
          );
          form.resetFields();
          dispatch(resetTicketSelection());
          dispatch(resetSelected());
          navigate(`${APP_PREFIX_PATH}/event/list`);
        }
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EventDetailsField form={form} />;
      case 2:
        return <CategoryField form={form} />;
      case 3:
        return <LocationDetailsField form={form} />;
      case 4:
        return <TicketField form={form} />;
      case 5:
        return <OfferField form={form} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>{eventId ? "Edit Event" : "Create Event"}</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "50px",
        }}
      >
        {steps.map((step, index) => (
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
              {index < steps.length - 1 && (
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
          {eventDetails ? renderStepContent() : <p>Loading event details...</p>}
        </Form>
      </div>

      <div style={{ textAlign: "right", marginTop: "20px" }}>
        <Button
          type="default"
          onClick={prevStep}
          style={{ marginRight: 8 }}
          disabled={currentStep === 1}
        >
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button type="primary" loading={submitLoading} onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="primary" loading={submitLoading} onClick={onFinish}>
            {eventId ? "Update" : "Submit"}
          </Button>
        )}
      </div>
      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details="Do you want to continue?"
        warningMessage="Please confirm your action."
        onSubmit={onFinish}
        onCancel={() => dispatch(setDialogVisible(false))}
        confirmText="Proceed"
        cancelText="Back"
        loading={modalLoading}
      />
    </div>
  );
};

export default MultyStepEventForm;


