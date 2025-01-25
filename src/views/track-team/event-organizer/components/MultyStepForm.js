import { Button, Form, message, message as antdMessage,Spin } from "antd";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import { BLUE_BASE, GRAY_LIGHTER } from "constants/ThemeConstant";
import { ActionType } from "utils/api/warning-submit-util";
import CommentShowModal from "components/util-components/ModalItems/CommentShowModal";
import LoadingOverlay from "components/util-components/Loader/index";
import {
  addEvent,
  setSubmitData,
  setCurrentStep,
  setSubmitLoading,
  resetState,
  checkEventValidation,
  fetchEventDetails
} from "store/slices/eventSlice";
import {
  updateOrganizerEvent,
  setUpdateEventDialogVisible,
  setSelectedUpdateEvent,
  setUpdateEventLoading,
  fetchSingleOrganizerUpdate,
  updateOrganizerReChanges,
  setComment,
  setCommentModalVisibility,
  setActionType,
} from "store/slices/EventOrganizerSlice";
import { UserRoleConstants } from "constants/UserRoleConstant";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { useDispatch, useSelector } from "react-redux";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { SubmitAndConfirmModal } from "../../../../components/util-components/ModalItems/SubmitConfirmModal";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import DiscardButton from "components/shared-components/Buttons/DiscardButton";
import { getCurrentUser } from "configs/UserAccessConfig";
import { getEventFormSteps } from "configs/UserAccessConfig";
import getEventFormItems from "configs/UserAccessConfig";
import { DEFAULT_PAGE_SIZE } from "constants/PageConstants";

const MultyStepEventFormOrganizer = ({ eventId, mode }) => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const {
    currentStep,
    selectedCoupons,
    selectedOffers,
    submitData,
    submitLoading,
    responseData,
    responseMessage,
    filteredEvents,
    eventDetails
  } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const {
    singleOrganizerUpdate,
    loading,
    isCommentModalVisible,
    comment,
    actionType,
    responseDataEvent, responseMessageEvent, message
  } = useSelector((state) => state.organizerUpdates);
  console.log("------------------", eventId)
  console.log("------------------", mode)

  useEffect(() => {
    if (mode === "ORGEDIT") {
      if (eventId) {
        dispatch(fetchSingleOrganizerUpdate(eventId));
      }
    } else if (mode === "EDIT") {
      if (eventId) {
        dispatch(fetchEventDetails(eventId))
      }
    }

  }, [dispatch]);




  useEffect(() => {
    console.log(mode,"-----------------MODE");
    
    if (mode === "EDIT" && eventDetails) {
      console.log(eventDetails.thumbnail_image);
      
      form.setFieldsValue({
        event_name: eventDetails.event_name,
        description: eventDetails.description,
        banner_images: eventDetails?.media
          ? eventDetails?.media?.map((banner, index) => ({
            uid: `-banner-${index}`,
            name: banner?.media_url.split("/").pop(),
            status: "done",
            url: banner?.media_url,
          }))
          : [],
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
      });
    } else if (mode === "ORGEDIT") {
      console.log("ENTERED TO FIELDs--------------");

      if (singleOrganizerUpdate.updated_fields != null) {
        form.setFieldsValue({
          event_name: singleOrganizerUpdate.updated_fields?.event_name ?? singleOrganizerUpdate.events.event_name,
          description: singleOrganizerUpdate.updated_fields?.description ?? singleOrganizerUpdate.events.description,
          banner_images: singleOrganizerUpdate.updated_fields?.banner_images
            ? singleOrganizerUpdate.updated_fields?.banner_images?.map((banner, index) => ({
              uid: `-banner-${index}`,
              name: banner.split("/").pop(),
              status: "done",
              url: banner,
            }))
            : singleOrganizerUpdate?.events?.banner_images
              ? singleOrganizerUpdate.events?.banner_images?.map((banner, index) => ({
                uid: `-banner-${index}`,
                name: banner.split("/").pop(),
                status: "done",
                url: banner,
              }))
              : [],
          thumbnail_image: singleOrganizerUpdate.updated_fields?.thumbnail_image ?? singleOrganizerUpdate.events.thumbnail_image
            ? [
              {
                uid: "-1",
                name: singleOrganizerUpdate.updated_fields?.thumbnail_image ?? singleOrganizerUpdate.events.thumbnail_image.split("/").pop(),
                status: "done",
                url: singleOrganizerUpdate.updated_fields?.thumbnail_image ?? singleOrganizerUpdate.events.thumbnail_image,
              },
            ]
            : [],
        });


      } else {
        form.setFieldsValue({
          event_name: singleOrganizerUpdate.events.event_name,
          description: singleOrganizerUpdate.events.description,
          banner_images: singleOrganizerUpdate?.events?.banner_images
            ? singleOrganizerUpdate.events?.banner_images?.map((banner, index) => ({
              uid: `-banner-${index}`,
              name: banner.split("/").pop(),
              status: "done",
              url: banner,
            }))
            : [],
          thumbnail_image: singleOrganizerUpdate.events.thumbnail_image
            ? [
              {
                uid: "-1",
                name: singleOrganizerUpdate.events.thumbnail_image.split("/").pop(),
                status: "done",
                url: singleOrganizerUpdate.events.thumbnail_image,
              },
            ]
            : [],
        });
      }

    }
  }, [mode, eventDetails, form]);


  // useEffect(() => {
  //   dispatch(resetState());
  // }, [dispatch]);

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
      if (currentUser.role_id === UserRoleConstants.eventOrganizerRoleId) {


        const data = {
          ...values,
          id: eventId,
        };
        console.log("Edit Data:", data);

        dispatch(setSelectedSubmitItem(data));
      }

    } else if (mode === "ORGEDIT") {


      dispatch(setActionType('update'));
      dispatch(setCommentModalVisibility(true));
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


  const handleSubmit = async () => {
    if (comment.trim().length === 0) {
      message.error("Please add a comment!");
      return;
    }
    const values = await form.validateFields();



    try {
      const data = {
        ...values,
        id: eventId,
        comments: comment
      };

      console.log("...............", data)
      const resultAction = await dispatch(
        updateOrganizerReChanges({
          data: data,
          action: ActionType.SUBMIT
        })
      );

      if (updateOrganizerReChanges.fulfilled.match(resultAction)) {
        console.log("HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEssss");
        dispatch(setComment(''));
        dispatch(setCommentModalVisibility(false));
        dispatch(setSelectedSubmitItem(data));
        message.success(`Update ${actionType}ed successfully`);
        dispatch(fetchSingleOrganizerUpdate(eventId));
        // navigate(`${APP_PREFIX_PATH}/track-team/event-organizer/updatelist`);

      }
      // dispatch(setSelectedSubmitItem(data));

    } catch (error) {
      message.error(`Failed to ${actionType} the update`);
    }

    dispatch(setComment(''));
    dispatch(setCommentModalVisibility(false));

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
          <Button type="primary" loading={mode == "EDIT" || "ORGEDIT" ? loading : submitLoading} onClick={onFinish}>
            Submit
          </Button>
        )}
      </div>
      <LoadingOverlay 
        loading={loading || submitLoading} 
      />
      <SubmitAndConfirmModal
        responseData={mode === "EDIT" ? responseDataEvent : mode === "ORGEDIT" ? responseDataEvent : responseData}
        addFunction={mode === "EDIT" ? updateOrganizerEvent : mode === "ORGEDIT" ? updateOrganizerReChanges : addEvent}
        navigationPath={mode === "ORGEDIT" ? `${APP_PREFIX_PATH}/track-team/event-organizer/updatelist` : `${APP_PREFIX_PATH}/event/list`}
        responseMessage={mode === "EDIT" ? responseMessageEvent : mode === "ORGEDIT" ? responseMessageEvent : responseMessage}
      />
      <CommentShowModal
        visible={isCommentModalVisible}
        onSubmit={handleSubmit}
        onCancel={() => dispatch(setCommentModalVisibility(false))}
        loading={loading}
        comment={comment}
        setComment={(value) => dispatch(setComment(value))}
        title={`${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Comment`}
        warningMessage={`Please provide a reason for the update.`}
      />
    </div>
  );
};

export default MultyStepEventFormOrganizer;
