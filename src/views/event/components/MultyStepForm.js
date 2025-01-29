import { Button, Form, message, message as antdMessage, } from "antd";
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
  resetState,
  checkEventValidation,

} from "store/slices/eventSlice";
import {
  updateOrganizerEvent,
  setUpdateEventDialogVisible,
  setSelectedUpdateEvent,
  setUpdateEventLoading,
} from "store/slices/EventOrganizerSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";
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
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    loading,
    submitLoading,
    responseData,
    responseMessage,
    filteredEvents,
  } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { responseDataEvent, responseMessageEvent, message } = useSelector((state) => state.organizerUpdates);


  console.log("------------------", eventId)
  console.log("------------------", mode)
  let eventData;
  if (mode === "EDIT") {
    if (filteredEvents && filteredEvents.length > 0) {
      const numericBannerId = parseInt(eventId, 10);
      const foundData = filteredEvents.find(event => event.id === numericBannerId);
      eventData = foundData;
      console.log(eventData, "FOUND DATA------------");
    } else {
      console.log('filteredevent is empty or undefined.');
    }
  }

  useEffect(() => {
    if (mode === "EDIT" && eventData) {
      form.setFieldsValue({
        event_name: eventData.event_name,
        description: eventData.description,
        thumbnail_image: eventData.thumbnail_image
          ? [
            {
              uid: "-1",
              name: eventData.thumbnail_image.split("/").pop(),
              status: "done",
              url: eventData.thumbnail_image,
            },
          ]
          : [],
      });
    }
  }, [mode, eventData, form]);


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
    const values = await form.validateFields();

    if (mode === "EDIT") {

    } else {
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
      <LoadingOverlay 
        loading={loading}
      />
      <SubmitAndConfirmModal
        responseData={mode === "EDIT" ? responseDataEvent : responseData}
        addFunction={mode === "EDIT" ? updateOrganizerEvent : addEvent}
        navigationPath={`${APP_PREFIX_PATH}/event/list`}
        responseMessage={mode === "EDIT" ? responseMessageEvent : responseMessage}
      />
    </div>
  );
};

export default MultyStepEventForm;
