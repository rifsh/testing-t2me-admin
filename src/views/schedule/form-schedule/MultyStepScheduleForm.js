import React, { useEffect, useState } from "react";
import {
  Form,
  Select,
  Typography,
  Button,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setCurrentStep,
  resetState,
} from "store/slices/eventSlice";
import {
  addSchedule,resetSchedule,
} from "store/slices/scheduleSlice";
import { ScheduleDetails } from "../components/ScheduleDetails";
import { ScheduleOffersAndCoupons } from "../components/ScheduleOffersAndCoupons";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { StepIndicator } from "../components/StepIndicator";
import { ScheduleTimeSlots } from "../components/ScheduleTimeSlotes";
import OfferDateModal from "../components/OfferDateModal";
import Utils from "utils";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";

const { Option } = Select;
const { Text } = Typography;

const MultyStepScheduleForm = () => {
  const steps = ["Schedule Details", "Time Slots", "Confirmation"];
  const { currentStep, submitLoading } = useSelector((state) => state.event);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { selectedItemForModal,responseData, responseMessage } = useSelector((state) => state.schedules);
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

      const startDate = Utils.formatDate(values.start_date);
      const endDate = Utils.formatDate(values.end_date);
      const startTime = Utils.formatDate(values.start_date,"HH:mm:ss");
      const endTime = Utils.formatDate(values.end_date,"HH:mm:ss");

      const submitData = {
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        name:values.name,
        event_id: values.event_id,
        offer_ids:
          selectedOffers.map((e) => ({
            offer_id: e.offer.id,
            valid_from:Utils.formatDate(e.offer.start_date),
            valid_to:Utils.formatDate(e.offer.end_date),
          })) ?? [],
        coupon_ids:
          selectedCoupons.map((e) => ({
            coupon_id: e.coupons.id,
            valid_from: Utils.formatDate(e.coupons.start_date),
            valid_to: Utils.formatDate(e.coupons.end_date),
          })) ?? [],
      };
 dispatch(setSelectedSubmitItem(submitData));
      // const resultAction = await dispatch(addSchedule(submitData));
      // if (addSchedule.fulfilled.match(resultAction)) {
      //   message.success(`Schedule ${values.name} added successfully`);
      //   form.resetFields();
      //   navigate(`${APP_PREFIX_PATH}/schedule/list`);
      // } else {
      //   message.error("Failed to add the Schedule. Please try again.");
      // }
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
        return <ScheduleTimeSlots form={form}/>;
      case 3:
        return <ScheduleOffersAndCoupons form={form}/>;
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
