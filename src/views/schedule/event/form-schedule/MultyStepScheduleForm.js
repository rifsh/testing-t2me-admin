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

import ConfirmationPage from "../components/ConfirmationPage";
import {
  AvailableBookingType,
  BOOKING_ADDON_TYPE,
} from "constants/AppConstants";
import { AddOnsFoodTimeSlotes } from "../components/AddOnsFoodTimeSlotes";

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
  const { availableTicketTyps, selectedTicketType } = useSelector(
    (state) => state.tickets
  );
  const { selectedAddOnServiceList } = useSelector((state) => state.schedules);
  const { selectedVenue } = useSelector((state) => state.locations);
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
    foodTimeSlots,
  } = useSelector((state) => state.schedules);

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
      dispatch(setCurrentStep(1));
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
          booking_limit_per_user: scheduleDetails?.booking_limit_per_user || 1,
          booking_limit_per_user_toggle:
            scheduleDetails?.booking_limit_per_user || false,
          payment_required: scheduleDetails?.payment_required || false,
          booking_start_date_time: scheduleDetails?.booking_start_date_time
            ? dayjs(scheduleDetails.booking_start_date_time)
            : null,
          ad_start_date_time: scheduleDetails?.ad_start_date_time
            ? dayjs(scheduleDetails.ad_start_date_time)
            : null,

          add_ons: scheduleDetails.add_ons?.map((items) => items.name) || [],
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

  const prevStep = () => {
    if (currentStep > 1) {
      dispatch(setCurrentStep(currentStep - 1));
    }
  };

  const cleanScheduleData = (data) => {
    const cleanedData = { ...data };
    cleanedData.show_dates = data.show_dates.filter(
      (date) => Array.isArray(date.show_times) && date.show_times.length > 0
    );

    return cleanedData;
  };

  const onFinish = async () => {
    try {
      const values = form.getFieldValue();

      const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
      const endDate = dayjs(values.end_date).format("YYYY-MM-DD");

      const show_dates = Object.entries(values.timeSlots || {})
        .filter(([date]) => {
          const currentDate = dayjs(date);
          return (
            currentDate.isSameOrAfter(startDate) &&
            currentDate.isSameOrBefore(endDate)
          );
        })
        .map(([date, slots]) => {
          // Filter out slots that end after the main end date
          const validSlots = slots.filter((slot) => {
            const slotEndDate = slot.is_midnight_passed
              ? dayjs(slot.show_end_date)
              : dayjs(date);

            return slotEndDate.isSameOrBefore(endDate);
          });

          // Only process dates that have valid slots
          if (validSlots.length === 0) {
            return null;
          }

          const latestEndDate = validSlots.reduce((latest, slot) => {
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
            show_times: validSlots.map((slot) => {
              let startTime = dayjs(slot.start_time).format("HH:mm");
              let endTime;

              if (slot.is_midnight_passed && slot.show_end_date) {
                endTime = dayjs(slot.show_end_date).format("HH:mm");
              } else if (slot.end_time) {
                endTime = dayjs(slot.end_time).format("HH:mm");
              }

              let ticketStructureId = null;
              let ticketSet = "";

              if (eventDetails?.venue_ticket_structures) {
                const selectedVenueTickets =
                  eventDetails.venue_ticket_structures.find(
                    (item) => item.venue.id === selectedVenue
                  );

                if (selectedVenueTickets?.ticket_structures) {
                  const ticketSetName = Array.isArray(slot.ticketType)
                    ? slot.ticketType[1]
                    : slot.ticketType;

                  for (const structure of selectedVenueTickets.ticket_structures) {
                    if (structure.ticket_sets.includes(ticketSetName)) {
                      ticketStructureId = structure.ticket_structure;
                      ticketSet = ticketSetName;
                      break;
                    }
                  }
                }
              }

              return {
                start_time: startTime,
                end_time: endTime,
                ticket_structure_id: ticketStructureId,
                ticket_set: ticketSet,
                seat_structure_id: slot.seat_structure_id,
                is_midnight: slot.is_midnight_passed ? "true" : "false",
              };
            }),
          };
        })
        .filter(Boolean);

      const submitData = {
        start_date: startDate,
        end_date: endDate,
        available_types: values.available_types,
        max_ticket_per_booking: values.max_ticket_per_booking,
        is_multi_date: values.is_multi_date,
        booking_start_date_time: dayjs(values.booking_start_date_time).format(
          "YYYY-MM-DDTHH:mm"
        ),

        ad_start_date_time: dayjs(values.ad_start_date_time).format(
          "YYYY-MM-DDTHH:mm"
        ),
        booking_limit_per_user: values.booking_limit_per_user_toggle
          ? values.booking_limit_per_user
          : null,
        payment_required: values.payment_required,
        booking_limit_per_user_toggle: values.booking_limit_per_user_toggle,

        add_ons: selectedAddOnServiceList || [],
        food_slots:
          foodTimeSlots && Object.keys(foodTimeSlots).length > 0
            ? foodTimeSlots
            : null,
        name: values.name,
        event_id: values.event_id,
        venue_id: values.venue_id,
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

      // Clean the data before submitting
      const cleanedSubmitData = cleanScheduleData(submitData);

      dispatch(setScheduleSubmitData(cleanedSubmitData));
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
          // Skip validation for dates outside the selected range
          if (dayjs(date).isBefore(startDate) || dayjs(date).isAfter(endDate)) {
            continue;
          }

          const slots = timeSlots[date];
          if (!Array.isArray(slots) || slots.length === 0) continue;

          // Validate each slot
          for (const slot of slots) {
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
            if (selectedTicketType === "seat_structure") {
              if (!slot.seat_structure_id) {
                message.error(
                  `Seat Structure is required for all slots on ${date}`
                );
                return;
              }
            } else {
              if (!slot.ticketType) {
                message.error(
                  `Ticket type is required for all slots on ${date}`
                );
                return;
              }
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
        return (
          <div>
            <ScheduleDetails form={form} />
            {selectedAddOnServiceList.find(
              (tiem) => tiem.name === BOOKING_ADDON_TYPE.USER_AND_FOOD
            ) && <AddOnsFoodTimeSlotes form={form} />}
          </div>
        );
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
        mode={mode}
        form={form}
        formType={"schedule"}
      />
    </div>
  );
};

export default MultyStepScheduleForm;
