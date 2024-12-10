import { Button,  Form, message } from "antd";
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import EventDetailsField from "./EventDetailsField";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import LocationDetailsField from "./LocationDetailsField";
import CategoryField from "./CategoryField";
import OfferField from "./OfferField";
import TicketField from "./TicketsField";
import { addEvent } from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
const ADD = "ADD";
// const EDIT = "EDIT";
const MultyStepEventForm = (props) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [form] = Form.useForm();
  const steps = ["Event Details", "Category","Location", "Ticket",  "Offers"];

  const [submitLoading, setSubmitLoading] = useState(false);
  // const { mode = ADD, param } = props;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const nextStep = () => {
    setSubmitLoading(true);
    form
      .validateFields()
      .then((value) => {
        if (currentStep < steps.length) {
          setCurrentStep(currentStep + 1);
        }
      })
      .catch((info) => {
        setSubmitLoading(false);
        console.log("info", info);
        message.error("Please enter all required field ");
      });
  };


  const onFinish = async () => {
    try {
      const values = await form.validateFields();

      const resultAction = await dispatch(addEvent(values));
      if (addEvent.fulfilled.match(resultAction)) {
        message.success(`Event ${values.name} added successfully`);
        form.resetFields();
        navigate(`${APP_PREFIX_PATH}/category/list`);
      }
    } catch (errorInfo) {
      console.log("Validation Failed:", errorInfo);
    }
  };
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <EventDetailsField />;
      case 2:
        return <CategoryField />;
      case 3:
        return <LocationDetailsField form={form} />;
      case 4:
        return <TicketField form={form} />;
      case 5:
        return <OfferField />;
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
        <Form layout="vertical" form={form}>{renderStepContent()}</Form>
      </div>

      <div
        style={{
          marginTop: "20px",
          marginRight: "50px",
          display: "flex",
          justifyContent: "right ",
          gap: "10px",
        }}
      >
        <Button type="default" onClick={prevStep} disabled={currentStep === 1}>
          Previous
        </Button>
        <Button type="primary" onClick={currentStep === steps.length ? onFinish:nextStep}>
          {currentStep === steps.length ? "Finish" : "Next"}
        </Button>
      </div>
    </div>
  );
};

export default MultyStepEventForm;
