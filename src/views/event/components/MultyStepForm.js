import { Button, Form, message } from "antd";
import React, { useEffect } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import {
  addEvent,
  setSubmitData,
  setCurrentStep,
  setSubmitLoading,
  resetState,
  checkEventValidation,
} from "store/slices/eventSlice";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";

import { SubmitAndConfirmModal } from "../../../components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";

import { getEventFormSteps } from "configs/UserAccessConfig";
import getEventFormItems from "configs/UserAccessConfig";

const MultyStepEventForm = () => {
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    submitLoading,
    responseData,
    responseMessage,
  } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  useEffect(() => {
    dispatch(resetState());
  }, [dispatch]);

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

      dispatch(setSelectedSubmitItem(finalData));
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
      <h2>Create Event</h2>
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
          {getEventFormItems(form, currentStep)}
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
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addEvent}
        navigationPath={`${APP_PREFIX_PATH}/event/list`}
        responseMessage={responseMessage}
      />
    </div>
  );
};

export default MultyStepEventForm;
