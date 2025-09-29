import React, { useState, useEffect, useRef } from "react";
import { Form, Button, message } from "antd";
import FormCard from "./FormCard";
import CalendarViewCard from "./PlanCard";
import OfferAndCoupons from "./OfferAndCoupons";
import { useDispatch, useSelector } from "react-redux";
import {
  setScheduleFormData,
  addSchedule,
  fetchSingleSchedules,
  resetSchedule,
  setActiveTab,
  setDates,
  setScheduleSubmitData,
  setSlotStatus,
  setTimeSlots,
} from "store/slices/scheduleSlice";
import { setCurrentStep, resetState } from "store/slices/eventSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import LoadingOverlay from "components/util-components/Loader/index";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { BOOKING_ADDON_TYPE } from "constants/AppConstants";
import dayjs from "dayjs";
import Utils from "utils";

const ScheduleDetails = ({ mode, id }) => {
  const [tab, setTab] = useState(1);
  const {
    scheduleFormData,
    scheduleDetails,
    responseData,
    responseMessage,
    loading,
    selectedOffers,
    submitedData,
    selectedCoupons,
    foodTimeSlots,
  } = useSelector((state) => state.schedules);

  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  const { availableTicketTyps, selectedTicketType } = useSelector(
    (state) => state.tickets
  );
  const { selectedAddOnServiceList } = useSelector((state) => state.schedules);
  const { selectedVenue } = useSelector((state) => state.locations);
  const { selectedSubmitItem } = useSelector((state) => state.modalSlice);

  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const isFormInitialized = useRef(false);
  const lastScheduleFormData = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (mode === "EDIT" && id) {
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
        dispatch(setScheduleFormData(formValues));

        if (scheduleDetails.show_dates?.length > 0) {
          const newDates = scheduleDetails.show_dates.map((sd) => sd.date);

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

          form.setFieldsValue({
            timeSlots: formattedTimeSlots,
          });
        }
      }
    };

    setFormFields();
  }, [form, mode, scheduleDetails, dispatch]);

  useEffect(() => {
    if (
      scheduleFormData &&
      Object.keys(scheduleFormData).length > 0 &&
      (!isFormInitialized.current ||
        JSON.stringify(scheduleFormData) !==
          JSON.stringify(lastScheduleFormData.current))
    ) {
      form.setFieldsValue(scheduleFormData);

      isFormInitialized.current = true;
      lastScheduleFormData.current = { ...scheduleFormData };
    }
  }, [scheduleFormData, form]);

  useEffect(() => {
    isFormInitialized.current = false;
  }, [tab]);

  const cleanScheduleData = (data) => {
    const cleanedData = { ...data };
    cleanedData.show_dates = data.show_dates.filter(
      (date) => Array.isArray(date.show_times) && date.show_times.length > 0
    );
    return cleanedData;
  };

  const validateTimeSlots = (values) => {
    let startDate, endDate;

    if (values.start_date) {
      startDate = dayjs.isDayjs(values.start_date)
        ? values.start_date.format("YYYY-MM-DD")
        : dayjs(values.start_date).format("YYYY-MM-DD");
    }

    if (values.end_date) {
      endDate = dayjs.isDayjs(values.end_date)
        ? values.end_date.format("YYYY-MM-DD")
        : dayjs(values.end_date).format("YYYY-MM-DD");
    }

    if (!startDate || !endDate) {
      message.error("Please select both start and end dates");
      return false;
    }

    const timeSlots = values.timeSlots || {};

    for (const date in timeSlots) {
      if (dayjs(date).isBefore(startDate) || dayjs(date).isAfter(endDate)) {
        continue;
      }

      const slots = timeSlots[date];
      if (!Array.isArray(slots) || slots.length === 0) continue;

      for (const slot of slots) {
        if (!slot.start_time) {
          message.error(`Start time is required for all slots on ${date}`);
          return false;
        }

        if (!slot.is_midnight_passed && !slot.end_time) {
          message.error(
            `End time is required for non-midnight slots on ${date}`
          );
          return false;
        }

        if (slot.is_midnight_passed && !slot.show_end_date) {
          message.error(
            `Show end date is required for midnight-passed slots on ${date}`
          );
          return false;
        }

        if (selectedTicketType === 1) {
          if (!slot.seat_structure_id) {
            message.error(
              `Seat Structure is required for all slots on ${date}`
            );
            return false;
          }
        } else {
          if (!slot.ticketType) {
            message.error(`Ticket type is required for all slots on ${date}`);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleFormSubmit = async (formData) => {
    try {
      await form.validateFields();
      dispatch(setScheduleFormData(formData));
      setTab(2);
    } catch (error) {
      message.error("Please fill all required fields correctly.");
    }
  };

  const handleTimeSlotSubmit = async (formData) => {
    try {
      const values = form.getFieldsValue();

      if (!validateTimeSlots({ ...values, ...formData })) {
        return;
      }

      dispatch(setScheduleFormData(formData));
      setTab(3);
    } catch (error) {
      message.error("Please ensure all time slots are configured correctly.");
    }
  };

  const handleOfferSubmit = (formData) => {
    const mergedData = {
      ...formData,
      ...scheduleFormData,
      offer_ids:
        formData.selectedoffers?.map((offer) => ({
          offer_id: offer.offer.id,
          valid_from: offer.offer.startdate,
          valid_to: offer.offer.enddate,
        })) ||
        scheduleFormData.offer_ids ||
        [],
      coupon_ids:
        formData.selectedcoupons?.map((coupon) => ({
          coupon_id: coupon.id,
          valid_from: coupon.coupons.startdate,
          valid_to: coupon.coupons.enddate,
        })) ||
        scheduleFormData.coupon_ids ||
        [],
    };

    dispatch(setScheduleFormData(mergedData));

    handleFinalSubmit(mergedData);
  };

  const transformSubmitData = (
    values,
    selectedAddOnServiceList,
    foodTimeSlots,
    selectedOffers,
    selectedCoupons,
    eventDetails,
    selectedVenue
  ) => {
    const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
    const endDate = dayjs(values.end_date).format("YYYY-MM-DD");

    const show_dates = values.show_dates || [];

    const submitData = {
      start_date: startDate,
      end_date: endDate,
      available_types: values.available_types || 2,
      max_ticket_per_booking: String(values.max_ticket_per_booking || 23),
      is_multi_date: Boolean(values.is_multi_date),
      booking_start_date_time: dayjs(values.booking_start_date_time).format(
        "YYYY-MM-DDTHH:mm"
      ),
      ad_start_date_time: dayjs(values.ad_start_date_time).format(
        "YYYY-MM-DDTHH:mm"
      ),
      booking_limit_per_user: values.booking_limit_per_user_toggle
        ? values.booking_limit_per_user
        : null,
      payment_required: Boolean(values.payment_required),
      booking_limit_per_user_toggle: Boolean(
        values.booking_limit_per_user_toggle
      ),

      add_ons:
        selectedAddOnServiceList && selectedAddOnServiceList.length > 0
          ? selectedAddOnServiceList
          : values.add_ons && values.add_ons.length > 0
          ? values.add_ons.map((addon) => {
              if (typeof addon === "string") {
                return {
                  name: addon,
                  status: true,
                };
              }
              return addon;
            })
          : [
              {
                name: "USER_AND_FOOD",
                status: true,
              },
            ],

      food_slots:
        foodTimeSlots && Object.keys(foodTimeSlots).length > 0
          ? Object.entries(foodTimeSlots).map(([key, slot]) => ({
              id: slot.id || parseInt(key) + 1,
              name: slot.name || `Food Slot ${parseInt(key) + 1}`,
              start_time: slot.start_time || "01:00",
              end_time: slot.end_time || "06:00",
              num_of_tickets: slot.num_of_tickets || 23,
            }))
          : [
              {
                id: 1,
                name: "Default Food Slot",
                start_time: "01:00",
                end_time: "06:00",
                num_of_tickets: 23,
              },
            ],

      name: values.name || "",
      event_id: values.event_id,
      venue_id: values.venue_id,
      show_dates,

      offer_ids:
        selectedOffers && selectedOffers.length > 0
          ? selectedOffers.map((e) => ({
              offer_id: e.offer?.id || e.id,
              valid_from: Utils.formatDate(e.offer?.start_date || startDate),
              valid_to: Utils.formatDate(e.offer?.end_date || endDate),
            }))
          : [],

      coupon_ids:
        selectedCoupons && selectedCoupons.length > 0
          ? selectedCoupons.map((e) => ({
              coupon_id: e.coupons?.id || e.id,
              valid_from: Utils.formatDate(e.coupons?.start_date || startDate),
              valid_to: Utils.formatDate(e.coupons?.end_date || endDate),
            }))
          : [],
    };

    return submitData;
  };

  const handleFinalSubmit = async (finalData = scheduleFormData) => {
    try {
      const values = { ...form.getFieldsValue(), ...finalData };

      const submitData = transformSubmitData(
        values,
        selectedAddOnServiceList,
        foodTimeSlots,
        selectedOffers,
        selectedCoupons,
        eventDetails,
        selectedVenue
      );

      const cleanedSubmitData = cleanScheduleData(submitData);

      dispatch(setScheduleSubmitData(cleanedSubmitData));
      dispatch(setSelectedSubmitItem(cleanedSubmitData));

      message.success("Schedule data prepared for submission!");
    } catch (error) {
      message.error(
        "Failed to submit the form. Please check all required fields."
      );
    }
  };

  const handleBack = () => {
    const currentFormData = form.getFieldsValue();

    const hasChanges = Object.keys(currentFormData).some(
      (key) => currentFormData[key] !== scheduleFormData[key]
    );

    if (hasChanges) {
      const dataToPreserve = {
        ...scheduleFormData,
        ...currentFormData,
      };

      dispatch(setScheduleFormData(dataToPreserve));
    }

    setTab(tab - 1);
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(setScheduleFormData({}));
    dispatch(resetSchedule());
    isFormInitialized.current = false;
    lastScheduleFormData.current = null;
    setTab(1);
  };

  const confirm = () => {
    dispatch(setSelectedSubmitItem(submitedData));
  };

  return (
    <div>
      <LoadingOverlay loading={loading} />

      {tab === 1 ? (
        <FormCard
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      ) : tab === 2 ? (
        <CalendarViewCard
          onSubmit={handleTimeSlotSubmit}
          form={form}
          onBack={handleBack}
        />
      ) : (
        <OfferAndCoupons
          form={form}
          onSubmit={handleOfferSubmit}
          onBack={handleBack}
          initialData={scheduleFormData}
        />
      )}

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

export default ScheduleDetails;
