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
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const steps = ["Event Details", "Category", "Location", "Ticket", "Offers"];

const MultyStepEventForm = () => {
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    submitLoading,
  } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const nextStep = async () => {
    try {
      const values = await form.validateFields();
      console.log("event details values", values);
      dispatch(setSubmitData(values));
      console.log("all values", submitData);

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
      const offers = {
        offer_ids: selectedOffers?.map((offer) => offer.id) ?? [],
        coupon_ids: selectedCoupons?.map((coupon) => coupon.id) ?? [],
      };

      await dispatch(setSubmitData(offers));

      const updatedSubmitData = {
        ...submitData,  
        ticket_set:"set1",//temparary
        max_tickets: parseInt(submitData.max_tickets, 10),
      };

      const resultAction = await dispatch(addEvent(updatedSubmitData));

      if (addEvent.fulfilled.match(resultAction)) {
        message.success(
          `Event ${updatedSubmitData.event_name} added successfully`
        );
        form.resetFields();
        dispatch(resetSelected());
        navigate(`${APP_PREFIX_PATH}/event/list`);
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
    </div>
  );
};

export default MultyStepEventForm;
