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

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };
  const formatTimeForSubmission = (dateTime) => {
    return dayjs(dateTime).format("HH:mm");
  };

  const onFinish = async () => {
    try {
      const values = form.getFieldValue();

      const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
      const endDate = dayjs(values.end_date).format("YYYY-MM-DD");

      const show_dates = Object.entries(values.timeSlots || {}).map(
        ([date, slots]) => {
          const latestEndDate = slots.reduce((latest, slot) => {
            if (
              slot.show_end_date &&
              (!latest || dayjs(slot.show_end_date).isAfter(dayjs(latest)))
            ) {
              return dayjs(slot.show_end_date).format("YYYY-MM-DD");
            }
            return latest;
          }, null);

          return {
            start_date: date,
            end_date: latestEndDate || null,
            show_times: slots.map((slot) => {
              let startTime = dayjs(slot.start_time).format("HH:mm");
              let endTime;

              if (slot.is_midnight_passed && slot.show_end_date) {
                endTime = dayjs(slot.show_end_date).format("HH:mm");
              } else if (slot.end_time) {
                endTime = dayjs(slot.end_time).format("HH:mm");
              }

              const ticketStructureId = Array.isArray(slot.ticketType)
                ? slot.ticketType[1]
                : slot.ticketType;

              // Find the relevant venue ticket structure
              let ticketSet = "";
              eventDetails?.venue_ticket_structures?.forEach((venue) => {
                venue.ticket_structures.forEach((ts) => {
                  if (ts.ticket_structure === ticketStructureId) {
                    // Use the first ticket set if available
                    ticketSet = ts.ticket_sets[0] || "";
                  }
                });
              });

              return {
                start_time: startTime,
                end_time: endTime,
                ticket_structure_id: ticketStructureId,
                ticket_set: ticketSet,
                is_midnight: slot.is_midnight_passed ? "true" : "false",
              };
            }),
          };
        }
      );
      const submitData = {
        start_date: startDate,
        end_date: endDate,
        booking_start_date_time: dayjs(values.booking_start_date_time).format(
          "YYYY-MM-DDTHH:mm"
        ),
        ad_start_date_time: dayjs(values.ad_start_date_time).format(
          "YYYY-MM-DDTHH:mm"
        ),
        name: values.name,
        event_id: values.event_id,
        show_dates,
        offer_ids: (selectedOffers || []).map((e) => ({
          offer_id: e.offer.id,
          valid_from: Utils.formatDate(e.offer.start_date || startDate),
          valid_to: Utils.formatDate(e.offer.end_date || endDate),
        })),
        coupon_ids: (selectedCoupons || []).map((e) => ({
          coupon_id: e.coupons.id,
          valid_from: Utils.formatDate(e.coupons.start_date || startDate),
          valid_to: Utils.formatDate(e.coupons.end_date || endDate),
        })),
      };

      // Debug log
      console.log("Submitting data:", JSON.stringify(submitData, null, 2));

      dispatch(setScheduleSubmitData(submitData));
      if (currentStep < steps.length) {
        dispatch(setCurrentStep(currentStep + 1));
      }
    } catch (error) {
      console.error("Submission error:", error);
      message.error(
        "Failed to submit the form. Please check all required fields."
      );
    }
  };

  const nextStep = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldValue();

      if (currentStep === 2) {
        const startDate = values.start_date
          ? dayjs(values.start_date).format("YYYY-MM-DD")
          : null;
        const endDate = values.end_date
          ? dayjs(values.end_date).format("YYYY-MM-DD")
          : null;

        if (!startDate || !endDate) {
          message.error("Please select both start and end dates");
          return;
        }

        const timeSlots = values.timeSlots || {};

        // Validate each date's time slots
        for (const date in timeSlots) {
          if (dayjs(date).isBefore(startDate) || dayjs(date).isAfter(endDate)) {
            message.error(`Date ${date} is outside the selected date range`);
            return;
          }

          const slots = timeSlots[date];
          if (!Array.isArray(slots) || slots.length === 0) continue;

          // Validate each slot
          for (let i = 0; i < slots.length; i++) {
            const slot = slots[i];

            if (!slot.start_time) {
              message.error(`Start time is required for all slots on ${date}`);
              return;
            }

            if (!slot.is_midnight_passed && !slot.end_time) {
              message.error(
                `End time is required for non-midnight slots on ${date}`
              );
              return;
            }

            if (slot.is_midnight_passed && !slot.show_end_date) {
              message.error(
                `Show end date is required for midnight-passed slots on ${date}`
              );
              return;
            }

            if (!slot.ticketType) {
              message.error(`Ticket type is required for all slots on ${date}`);
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
