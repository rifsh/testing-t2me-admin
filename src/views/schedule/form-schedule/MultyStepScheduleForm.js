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
      console.log("Current form values:", values);

      // Create a copy of the form values to modify
      const updatedValues = { ...values };
      const timeSlots = updatedValues.timeSlots || {};

      // Process slots with is_midnight_passed
      Object.keys(timeSlots).forEach((date) => {
        const dateSlots = timeSlots[date] || [];

        dateSlots.forEach((slot, index) => {
          if (
            slot.is_midnight_passed &&
            slot.show_end_date &&
            slot.start_time
          ) {
            // Get the date from start_time
            const startDate = dayjs(slot.start_time).format("YYYY-MM-DD");
            // Get the time from show_end_date
            const endTime = dayjs(slot.show_end_date).format("HH:mm:ss.SSS");
            // Combine them
            const combinedEndTime = `${startDate}T${endTime}Z`;

            // Update the slot
            timeSlots[date][index] = {
              ...slot,
              end_time: combinedEndTime,
              ticketType: slot.ticketType ? slot.ticketType[2] : null, // Take the third element if it exists
            };
          }
        });
      });

      // Update the form with modified values
      form.setFieldsValue(updatedValues);

      if (currentStep === 2) {
        const startDate = values.start_date
          ? values.start_date.format("YYYY-MM-DD")
          : null;
        const endDate = values.end_date
          ? values.end_date.format("YYYY-MM-DD")
          : null;

        if (!startDate || !endDate) {
          message.error("Please select both start and end dates");
          return;
        }

        const allDates = [];
        let currentDate = dayjs(startDate);
        const endDateTime = dayjs(endDate);

        while (currentDate.isSameOrBefore(endDateTime)) {
          allDates.push(currentDate.format("YYYY-MM-DD"));
          currentDate = currentDate.add(1, "day");
        }

        for (const date of allDates) {
          const dateSlots = timeSlots[date] || [];

          if (dateSlots.length === 0) {
            continue;
          }

          for (const slot of dateSlots) {
            if (
              Object.keys(slot).length === 1 &&
              "is_midnight_passed" in slot
            ) {
              continue;
            }

            if (!slot.end_time && !slot.show_end_date) {
              message.error(
                `Each slot must have either an end time or show end date for date: ${date}`
              );
              return;
            }

            // if (slot.end_time && slot.show_end_date) {
            //   message.error(
            //     `Slot cannot have both end time and show end date for date: ${date}`
            //   );
            //   return;
            // }

            if (!slot.start_time || !slot.ticketType) {
              message.error(
                `Please fill in all required fields (start time and ticket type) for date: ${date}`
              );
              return;
            }
          }

          for (let i = 0; i < dateSlots.length - 1; i++) {
            const currentSlot = dateSlots[i];
            const nextSlot = dateSlots[i + 1];

            if (!currentSlot.start_time || !nextSlot.start_time) {
              continue;
            }

            const currentEndTime = currentSlot.end_time
              ? dayjs(currentSlot.end_time)
              : dayjs(currentSlot.show_end_date);
            const nextStartTime = dayjs(nextSlot.start_time);

            if (currentEndTime.isAfter(nextStartTime)) {
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
