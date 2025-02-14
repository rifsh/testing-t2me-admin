import React, { useEffect } from "react";
import { Form, Button, message } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentStep, resetState } from "store/slices/eventSlice";
import {
  addSchedule,
  fetchSingleSchedules,
  resetSchedule,
  setActiveTab,
  setDates,
  setScheduleSubmitData,
  setSlotStatus,
  setTimeSlots,
} from "store/slices/scheduleSlice";
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

import ConfirmationPage from "../components/Confrimation";

const MultyStepScheduleForm = ({ mode, id }) => {
  const steps = [
    "Schedule Details",
    "Time Slots",
    "Coupon & Offer",
    "Confirmation",
  ];

  const { currentStep, eventDetails, submitLoading } = useSelector(
    (state) => state.event
  );
  const { selectedSubmitItem } = useSelector((state) => state.modalSlice);
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const {
    scheduleDetails,
    responseData,
    responseMessage,
    loading,
    selectedOffers,
    submitedData,
    selectedCoupons,
  } = useSelector((state) => state.schedules);

  // Debug log when component mounts
  useEffect(() => {
    console.log("Component mounted with mode:", mode, "and id:", id);
  }, [mode, id]);

  // First useEffect for fetching data
  useEffect(() => {
    const fetchData = async () => {
      if (mode === "EDIT" && id) {
        console.log("Fetching schedule data for id:", id);
        await dispatch(fetchSingleSchedules({ id }));
      }
    };

    fetchData();

    return () => {
      dispatch(resetSchedule());
      dispatch(resetState());
    };
  }, [dispatch, mode, id]);

  // Second useEffect for setting form fields
  useEffect(() => {
    const setFormFields = () => {
      if (mode === "EDIT" && scheduleDetails) {
        const formValues = {
          event_id: scheduleDetails?.event?.id,
          name: scheduleDetails?.name,
          start_date: scheduleDetails?.start_date
            ? dayjs(scheduleDetails.start_date)
            : null,
          end_date: scheduleDetails?.end_date
            ? dayjs(scheduleDetails.end_date)
            : null,
          booking_start_date_time: scheduleDetails?.booking_start_date_time
            ? dayjs(scheduleDetails.booking_start_date_time)
            : null,
          ad_start_date_time: scheduleDetails?.ad_start_date_time
            ? dayjs(scheduleDetails.ad_start_date_time)
            : null,
        };

        form.setFieldsValue(formValues);

        if (scheduleDetails.show_dates?.length > 0) {
          const newDates = scheduleDetails.show_dates.map((sd) => sd.date);

          // Prepare time slots in the correct format
          const formattedTimeSlots = scheduleDetails.show_dates.reduce(
            (acc, showDate) => {
              acc[showDate.date] = showDate.show_times.map((time) => ({
                start_time: dayjs(`${showDate.date} ${time.start_time}`),
                end_time: dayjs(`${showDate.date} ${time.end_time}`),
                ticketType: time.event_ticket_structures[0]?.id,
              }));
              return acc;
            },
            {}
          );

          dispatch(setDates(newDates));
          dispatch(setActiveTab(newDates[0]));
          dispatch(setSlotStatus("green"));
          dispatch(setTimeSlots(formattedTimeSlots));

          // Update form's time slots
          form.setFieldsValue({
            timeSlots: formattedTimeSlots,
          });
        }
      }
    };

    setFormFields();
  }, [form, mode, scheduleDetails, dispatch]);

  // Debug log for scheduleDetails changes
  useEffect(() => {
    console.log("scheduleDetails updated:", scheduleDetails);
  }, [scheduleDetails]);

  const nextStep = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldValue();
      console.log("Current form values:", values); // Debug log

      // Store the values in form
      form.setFieldsValue(values);
      // Only perform date validation on step 2
      if (currentStep === 2) {
        const timeSlots = values.timeSlots || {};
        const startDate = values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null;
        const endDate = values.end_date
          ? values.end_date.format("YYYY-MM-DD")
          : null;

        // Validate that both start and end dates are selected
        if (!startDate || !endDate) {
          message.error("Please select both start and end dates");
          return;
        }

        // Get all dates between start and end date
        const allDates = [];
        let currentDate = dayjs(startDate);
        const endDateTime = dayjs(endDate);

        while (currentDate.isSameOrBefore(endDateTime)) {
          allDates.push(currentDate.format("YYYY-MM-DD"));
          currentDate = currentDate.add(1, "day");
        }

        // Check if all dates have at least one time slot
        const missingDates = allDates.filter((date) => {
          const dateSlots = timeSlots[date];
          return !dateSlots || dateSlots.length === 0;
        });

        if (missingDates.length > 0) {
          message.error(
            `Please add time slots for the following dates: ${missingDates.join(
              ", "
            )}`
          );
          return;
        }

        // Validate each date's time slots
        for (const date of allDates) {
          const dateSlots = timeSlots[date] || [];

          // Check if each slot has both start and end time and ticket type
          const invalidSlots = dateSlots.filter(
            (slot) => !slot.start_time || !slot.end_time || !slot.ticketType
          );

          if (invalidSlots.length > 0) {
            message.error(
              `Please fill in all required fields (start time, end time, and ticket type) for date: ${date}`
            );
            return;
          }

          // Validate time sequence
          for (let i = 0; i < dateSlots.length - 1; i++) {
            const currentSlot = dayjs(dateSlots[i].end_time);
            const nextSlot = dayjs(dateSlots[i + 1].start_time);

            if (currentSlot.isAfter(nextSlot)) {
              message.error(
                `Invalid time sequence on ${date}: Slot ${
                  i + 1
                } ends after slot ${i + 2} begins`
              );
              return;
            }
          }
        }
      }

      // Move to next step if validation passes
      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      console.error("Validation error:", error);
      message.error("Please ensure all required fields are filled correctly.");
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const onFinish = async () => {
    try {
      const values = form.getFieldValue();
      const timeSlots = values.timeSlots || {};

      const startDate = values.start_date
        ? values.start_date.format("YYYY-MM-DD")
        : null;
      const endDate = values.end_date
        ? values.end_date.format("YYYY-MM-DD")
        : null;

      const formattedTimeSlots = Object.entries(timeSlots)
        .map(([date, slots]) => ({
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
        }))
        .filter(
          ({ date, show_times }) =>
            show_times.length > 0 && date >= startDate && date <= endDate
        ); // Only keep dates within range & having show_times

      const submitData = {
        start_date: startDate,
        end_date: endDate,
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

      dispatch(setScheduleSubmitData(submitData));
      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (info) {
      console.error("Validation Failed:", info);
      message.error("Please enter all required fields.");
    }
  };
  const confirm = () => {
    dispatch(setSelectedSubmitItem(submitedData));
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ScheduleDetails form={form} />;
      case 2:
        return <ScheduleTimeSlots form={form} mode={mode} />;
      case 3:
        return <ScheduleOffersAndCoupons form={form} />;
      case 4:
        return <ConfirmationPage />;
      default:
        return null;
    }
  };

  return (
    <div>
      <h2>{mode === "EDIT" ? "Edit Schedule" : "Create Schedule"}</h2>
      <StepIndicator steps={steps} currentStep={currentStep} />
      <div style={{ padding: "20px" }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{}} // Add empty initial values
        >
          {renderStepContent()}
        </Form>
      </div>
      <div style={{ textAlign: "right", marginTop: "20px" }}>
        {currentStep > 1 && <Button onClick={prevStep}>Previous</Button>}

        {currentStep < 3 ? (
          <Button type="primary" onClick={nextStep}>
            Next
          </Button>
        ) : currentStep === 3 ? (
          <Button type="primary" onClick={onFinish}>
            Submit
          </Button>
        ) : (
          <Button type="primary" onClick={confirm}>
            Confirm
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
