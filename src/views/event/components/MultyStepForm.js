import { Button, Form, message } from "antd";
import React from "react";
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
  setDialogVisible,
  setSelectedEvent,
  setModalLoading,
  fetchAllEvent,
  setWarningMessage,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { ActionType } from "utils/api/warning-submit-util";
import ResponseShowModal from "components/util-components/ModalItems/ResponseShowModal";

const steps = ["Event Details", "Category", "Location", "Ticket", "Offers"];
const MultyStepEventForm = () => {
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    dialogVisible,
    modalLoading,
    selectedEvent,
    submitLoading,
    warningMessage,successResponse
  } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const nextStep = async () => {
    try {
      const values = await form.validateFields();
      dispatch(setSubmitData(values));
      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      message.error("Please complete all required fields.");
    } finally {
      dispatch(setSubmitLoading(false));
    }
  };

  const onFinish = async () => {
    try {
      dispatch(setSubmitLoading(true));
      const offers = {
        offer_ids: selectedOffers?.map((offer) => offer.id) || [],
        coupon_ids: selectedCoupons?.map((coupon) => coupon.id) || [],
      };

      const finalData = {
        ...submitData,
        ...offers,
        max_tickets: parseInt(submitData.max_tickets || "0", 10),
      };
      console.log(finalData, "fianl data");

      const resultAction = await dispatch(
        addEvent({
          data: finalData,
          action: ActionType.SUBMIT,
        })
      );

      if (addEvent.fulfilled.match(resultAction)) {
        dispatch(setSelectedEvent(finalData));
        // dispatch(
        //   setWarningMessage(JSON.stringify(resultAction.payload, null, 2))
        // );
        dispatch(setDialogVisible(true));
      } else {
        message.error("Event submission failed.");
      }
    } catch (error) {
      console.error("Submission Error:", error);
      message.error("An error occurred during submission.");
    } finally {
      dispatch(setSubmitLoading(false));
    }
  };

  const handleModalSubmit = async () => {
    try {
      if (!selectedEvent) {
        message.error("No event selected for confirmation.");
        return;
      }

      dispatch(setModalLoading(true));

      // Dispatch addEvent with CONFIRM action
      const resultAction = await dispatch(
        addEvent({
          data: selectedEvent,
          action: ActionType.CONFIRM,
        })
      );

      if (addEvent.fulfilled.match(resultAction)) {
        message.success(
          `Event "${selectedEvent.event_name}" activated successfully.`
        );

        // Reset form and navigate
        form.resetFields();
        dispatch(resetSelected());
        navigate(`${APP_PREFIX_PATH}/event/list`);
      } else {
        message.error("Event activation failed.");
      }
    } catch (error) {
      console.error("Confirmation Error:", error);
      message.error("An error occurred during confirmation.");
    } finally {
      dispatch(setModalLoading(false));
      dispatch(setDialogVisible(false));
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
      <h2>Create Event</h2>
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
          {renderStepContent()}
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
            Submit
          </Button>
        )}
      </div>
      <ResponseShowModal 
        visible={dialogVisible}
        title="Confirm Event Details"
        jsonData={successResponse}
        warningMessage="Review the event details before confirmation"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Confirm Event"
        cancelText="Cancel"
        loading={modalLoading}
      />
    </div>
  );
};

export default MultyStepEventForm;
