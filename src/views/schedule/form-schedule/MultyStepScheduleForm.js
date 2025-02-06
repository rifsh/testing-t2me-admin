import React, { useEffect, useState } from "react";
import { Form, Select, Typography, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCurrentStep, resetState } from "store/slices/eventSlice";
import { addSchedule, resetSchedule } from "store/slices/scheduleSlice";
import { ScheduleDetails } from "../components/ScheduleDetails";
import { ScheduleOffersAndCoupons } from "../components/ScheduleOffersAndCoupons";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { StepIndicator } from "../components/StepIndicator";
import { ScheduleTimeSlots } from "../components/ScheduleTimeSlotes";
import Utils from "utils";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import dayjs from "dayjs";
import LoadingOverlay from "components/util-components/Loader/index";

const MultyStepScheduleForm = () => {
  const steps = ["Schedule Details", "Time Slots", "Confirmation"];
  const { currentStep, eventDetails, submitLoading } = useSelector(
    (state) => state.event
  );
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const { responseData, responseMessage } = useSelector(
    (state) => state.schedules
  );
  useEffect(() => {
    dispatch(resetSchedule());
    dispatch(resetState());
  }, [dispatch]);

  const nextStep = async () => {
    try {
      await form.validateFields();
      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      message.error("Please ensure all required fields are filled.");
    }
  };
  const { loading, error, selectedOffers, selectedCoupons } = useSelector(
    (state) => state.schedules
  );
  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const onFinish = async () => {
    try {
      const values = form.getFieldValue();
      const timeSlots = values.timeSlots || {};
      const formattedTimeSlots = Object.entries(timeSlots).map(
        ([date, slots]) => ({
          date,
          show_times: slots
            .filter((slot) => slot.start_time)
            .map((slot) => {
              const ticketStructure =
                eventDetails?.event_ticket_structures?.find(
                  (ts) => ts.id === slot.ticketType
                );

              return {
                start_time: dayjs(slot.start_time).format("HH:mm"),
                end_time: slot.end_time
                  ? dayjs(slot.end_time).format("HH:mm")
                  : null,
                ticket_structure_id: ticketStructure?.ticket_structure?.id,
                ticket_set: ticketStructure?.ticket_set,
              };
            }),
        })
      );
      const submitData = {
        start_date: values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null,
        end_date: values.end_date ? values.end_date.format("YYYY-MM-DD") : null,
        booking_start_date_time: values.booking_start_date_time
          ? values.booking_start_date_time.format("YYYY-MM-DDTHH:mm")
          : null,
        ad_start_date_time: values.ad_start_date_time
          ? values.ad_start_date_time.format("YYYY-MM-DDTHH:mm")
          : null,
        name: values.name,
        event_id: values.event_id,
        show_dates: formattedTimeSlots,
        offer_ids:
          selectedOffers.map((e) => ({
            offer_id: e.offer.id,
            valid_from: Utils.formatDate(
              e.offer.start_date === null
                ? values.start_date
                : e.offer.start_date
            ),
            valid_to: Utils.formatDate(
              e.offer.end_date === null ? values.end_date : e.offer.end_date
            ),
          })) ?? [],
        coupon_ids:
          selectedCoupons.map((e) => ({
            coupon_id: e.coupons.id,
            valid_from: Utils.formatDate(
              e.coupons.start_date === null
                ? values.start_date
                : e.coupons.start_date
            ),
            valid_to: Utils.formatDate(
              e.coupons.end_date === null ? values.end_date : e.coupons.end_date
            ),
          })) ?? [],
      };
      dispatch(setSelectedSubmitItem(submitData));
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ScheduleDetails form={form} />;
      case 2:
        return <ScheduleTimeSlots form={form} />;
      case 3:
        return <ScheduleOffersAndCoupons form={form} />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>Create Schedule</h2>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div style={{ padding: "20px" }}>
        <Form form={form} layout="vertical">
          {renderStepContent()}
        </Form>
      </div>
      <div style={{ textAlign: "right", marginTop: "20px" }}>
        {currentStep > 1 && (
          <Button type="default" onClick={prevStep} style={{ marginRight: 8 }}>
            Previous
          </Button>
        )}
        {currentStep < steps.length ? (
          <Button type="primary" loading={submitLoading} onClick={nextStep}>
            Next
          </Button>
        ) : (
          <Button type="primary" onClick={onFinish}>
            Submit
          </Button>
        )}
      </div>
      <LoadingOverlay loading={loading} />
      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={addSchedule}
        navigationPath={`${APP_PREFIX_PATH}/schedule/list`}
        responseMessage={responseMessage}
      />
    </div>
  );
};

export default MultyStepScheduleForm;
