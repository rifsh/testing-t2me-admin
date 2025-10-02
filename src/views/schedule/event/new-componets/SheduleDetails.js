import React, { useState, useEffect, useRef, useMemo } from "react";
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
  checkScheduleEdit,
} from "store/slices/scheduleSlice";
import { setCurrentStep, resetState } from "store/slices/eventSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import LoadingOverlay from "components/util-components/Loader/index";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { BOOKING_ADDON_TYPE, EDIT } from "constants/AppConstants";
import dayjs from "dayjs";
import Utils from "utils";
import { ScheduleUtil } from "../utils";

const ScheduleDetails = ({ mode, id }) => {
  const [tab, setTab] = useState(1);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Use refs to prevent infinite loops
  const isInitialized = useRef(false);
  const hasLoadedEditData = useRef(false);
  const lastEditId = useRef(null);

  // Consolidated selector
  const {
    scheduleFormData,
    scheduleDetails,
    responseData,
    responseMessage,
    loading,
    selectedOffers,
    selectedCoupons,
    foodTimeSlots,
    selectedAddOnServiceList,
    checkedscheduleDetails,
  } = useSelector((state) => state.schedules);

  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  const { selectedTicketType } = useSelector((state) => state.tickets);
  const { selectedVenue } = useSelector((state) => state.locations);
  const { selectedSubmitItem } = useSelector((state) => state.modalSlice);

  // Memoize stable values to prevent unnecessary re-renders
  const isEditMode = useMemo(() => mode === EDIT, [mode]);
  const editId = useMemo(() => id, [id]);

  // Utility functions
  const updateStoreAndForm = (data) => {
    const updatedData = {
      ...scheduleFormData,
      ...data,
    };
    dispatch(setScheduleFormData(updatedData));
    form.setFieldsValue(updatedData);
    return updatedData;
  };

  const setupEditTimeSlots = (showDates) => {
    if (!showDates?.length) return {};

    const newDates = showDates.map((sd) => sd.start_date);
    const formattedTimeSlots = showDates.reduce((acc, showDate) => {
      acc[showDate.start_date] = showDate.show_times.map((time) => ({
        start_time: dayjs(
          `${showDate.start_date} ${time.start_time}`,
          "YYYY-MM-DD hh:mm A"
        ),
        end_time: dayjs(
          `${showDate.start_date} ${time.end_time}`,
          "YYYY-MM-DD hh:mm A"
        ),
        ticketType: time.event_ticket_structures?.id,
        seat_structure_id: time.event_ticket_structures?.ticket_structure?.id,
        ticket_set: time.event_ticket_structures?.ticket_set,
        is_midnight: time.is_midnight || false,
        show_time_ticket_types: time.show_time_ticket_types || [],
      }));
      return acc;
    }, {});

    // Only dispatch if we have new data
    if (newDates.length > 0) {
      dispatch(setDates(newDates));
      dispatch(setActiveTab(newDates[0]));
      dispatch(setSlotStatus("green"));
      dispatch(setTimeSlots(formattedTimeSlots));
    }

    return { timeSlots: formattedTimeSlots, show_dates: showDates };
  };

  // Initialize component ONLY ONCE
  useEffect(() => {
    const initializeComponent = async () => {
      if (
        isEditMode &&
        editId &&
        lastEditId.current !== editId &&
        !isInitialized.current
      ) {
        console.log("Initializing edit mode for ID:", editId);

        try {
          isInitialized.current = true;
          lastEditId.current = editId;

          const fetchPromises = [
            dispatch(fetchSingleSchedules({ id: editId })).unwrap(),
          ];

          if (!checkedscheduleDetails) {
            fetchPromises.push(
              dispatch(checkScheduleEdit({ schedule_id: editId }))
            );
          }

          await Promise.all(fetchPromises);
          console.log("Edit mode initialization completed");
        } catch (error) {
          console.error("Failed to initialize edit mode:", error);
          isInitialized.current = false;
          lastEditId.current = null;
          message.error("Failed to load schedule data");
        }
      } else if (!isEditMode && !isInitialized.current) {
        isInitialized.current = true;
        console.log("Create mode initialized");
      }
    };

    initializeComponent();

    return () => {
      if (isEditMode && editId !== lastEditId.current) {
        dispatch(resetSchedule());
        dispatch(resetState());
        dispatch(setCurrentStep(1));
        isInitialized.current = false;
        hasLoadedEditData.current = false;
        lastEditId.current = null;
      }
    };
  }, [dispatch, isEditMode, editId, checkedscheduleDetails]);

  // FIXED: Handle edit mode data setup - using scheduleDetails directly as dependency
  useEffect(() => {
    // More robust condition checking
    const shouldLoadEditData =
      isEditMode &&
      scheduleDetails &&
      scheduleDetails.id &&
      editId &&
      String(scheduleDetails.id) === String(editId) &&
      !hasLoadedEditData.current;

    if (shouldLoadEditData) {
      console.log("===== SETTING UP EDIT DATA =====");
      console.log("Schedule Details:", scheduleDetails);
      console.log("Edit ID:", editId);

      try {
        // Use the ScheduleUtil.createFormValues utility
        const formValues = ScheduleUtil.createFormValues(scheduleDetails);
        console.log("Form Values from ScheduleUtil:", formValues);

        // Setup time slots if available
        const timeSlotData = setupEditTimeSlots(scheduleDetails.show_dates);
        console.log("Time Slot Data:", timeSlotData);

        // Combine all data
        const finalFormValues = {
          ...formValues,
          ...timeSlotData,
        };

        console.log("Final Form Values to be set:", finalFormValues);

        // Update store first
        dispatch(setScheduleFormData(finalFormValues));

        // Use setTimeout to ensure Redux state updates before setting form values
        setTimeout(() => {
          // Set form values
          form.setFieldsValue(finalFormValues);

          // Force form to recognize the values
          form.validateFields().catch(() => {
            // Ignore validation errors on initial load
          });

          console.log("Form values after setting:", form.getFieldsValue());
        }, 100);

        // Mark as loaded to prevent re-runs
        hasLoadedEditData.current = true;
        console.log("===== EDIT MODE SETUP COMPLETED =====");
      } catch (error) {
        console.error("Error setting up edit data:", error);
        hasLoadedEditData.current = false;
        message.error("Failed to load form data");
      }
    }
  }, [scheduleDetails, isEditMode, editId, dispatch, form]);

  // REMOVED: The sync effect that was conflicting with edit mode
  // This was causing the form to be reset after being populated

  // Validation functions
  const validateTimeSlots = (values) => {
    const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
    const endDate = dayjs(values.end_date).format("YYYY-MM-DD");

    if (!startDate || !endDate) {
      message.error("Please select both start and end dates");
      return false;
    }

    const timeSlots = values.timeSlots || {};

    for (const date in timeSlots) {
      if (dayjs(date).isBefore(startDate) || dayjs(date).isAfter(endDate))
        continue;

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

        if (selectedTicketType === 1 && !slot.seat_structure_id) {
          message.error(`Seat Structure is required for all slots on ${date}`);
          return false;
        } else if (selectedTicketType !== 1 && !slot.ticketType) {
          message.error(`Ticket type is required for all slots on ${date}`);
          return false;
        }
      }
    }
    return true;
  };

  const cleanScheduleData = (data) => {
    const cleanedData = { ...data };
    if (cleanedData.show_dates) {
      cleanedData.show_dates = data.show_dates.filter(
        (date) => Array.isArray(date.show_times) && date.show_times.length > 0
      );
    }
    return cleanedData;
  };

  const getDefaultAddOns = () => [
    {
      name: "USER_AND_FOOD",
      status: true,
    },
  ];

  const getDefaultFoodSlots = () => [
    {
      id: 1,
      name: "Default Food Slot",
      start_time: "01:00",
      end_time: "06:00",
      num_of_tickets: 23,
    },
  ];

  const transformAddOns = (addOns) => {
    if (selectedAddOnServiceList?.length > 0) {
      return selectedAddOnServiceList;
    }

    if (addOns?.length > 0) {
      return addOns.map((addon) =>
        typeof addon === "string" ? { name: addon, status: true } : addon
      );
    }

    return getDefaultAddOns();
  };

  const transformFoodSlots = () => {
    if (foodTimeSlots && Object.keys(foodTimeSlots).length > 0) {
      return Object.entries(foodTimeSlots).map(([key, slot]) => ({
        id: slot.id || parseInt(key) + 1,
        name: slot.name || `Food Slot ${parseInt(key) + 1}`,
        start_time: slot.start_time || "01:00",
        end_time: slot.end_time || "06:00",
        num_of_tickets: slot.num_of_tickets || 23,
      }));
    }

    return getDefaultFoodSlots();
  };

  const transformOffersCoupons = (items, type) => {
    if (!items?.length) return [];

    return items.map((item) => ({
      [`${type}_id`]: item[type]?.id || item.id,
      valid_from: Utils.formatDate(
        item[type]?.start_date ||
          item[type]?.startdate ||
          form.getFieldValue("start_date")
      ),
      valid_to: Utils.formatDate(
        item[type]?.end_date ||
          item[type]?.enddate ||
          form.getFieldValue("end_date")
      ),
    }));
  };

  const transformSubmitData = (values) => {
    const startDate = dayjs(values.start_date).format("YYYY-MM-DD");
    const endDate = dayjs(values.end_date).format("YYYY-MM-DD");

    return {
      start_date: startDate,
      end_date: endDate,
      available_types: values.available_types || "ticket_structure",
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
      add_ons: transformAddOns(values.add_ons),
      food_slots: transformFoodSlots(),
      name: values.name || "",
      event_id: values.event_id,
      venue_id: values.venue_id,
      show_dates: values.show_dates || [],
      offer_ids: transformOffersCoupons(selectedOffers, "offer"),
      coupon_ids: transformOffersCoupons(selectedCoupons, "coupons"),
    };
  };

  // Handler functions
  const handleFormSubmit = async (formData) => {
    try {
      await form.validateFields();
      updateStoreAndForm(formData);
      setTab(2);
      message.success("Form data saved successfully!");
    } catch (error) {
      console.error("Form validation error:", error);
      message.error("Please fill all required fields correctly.");
    }
  };

  const handleTimeSlotSubmit = async (formData) => {
    try {
      const mergedData = updateStoreAndForm(formData);

      if (!validateTimeSlots(mergedData)) return;

      setTab(3);
      message.success("Time slots configured successfully!");
    } catch (error) {
      console.error("Time slot validation error:", error);
      message.error("Please ensure all time slots are configured correctly.");
    }
  };

  const handleOfferSubmit = (formData) => {
    const updatedData = updateStoreAndForm({
      ...formData,
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
    });

    handleFinalSubmit(updatedData);
  };

  const handleFinalSubmit = async (finalData = null) => {
    try {
      const dataToSubmit = finalData || {
        ...scheduleFormData,
        ...form.getFieldsValue(),
      };
      const submitData = transformSubmitData(dataToSubmit);
      const cleanedSubmitData = cleanScheduleData(submitData);

      dispatch(setScheduleSubmitData(cleanedSubmitData));
      dispatch(setSelectedSubmitItem(cleanedSubmitData));

      console.log("Final submit data:", cleanedSubmitData);
      message.success("Schedule data prepared for submission!");
    } catch (error) {
      console.error("Final submit error:", error);
      message.error(
        "Failed to submit the form. Please check all required fields."
      );
    }
  };

  const handleBack = () => {
    updateStoreAndForm(form.getFieldsValue());
    setTab(tab - 1);
  };

  const handleCancel = () => {
    form.resetFields();
    dispatch(setScheduleFormData({}));
    dispatch(resetSchedule());
    isInitialized.current = false;
    hasLoadedEditData.current = false;
    lastEditId.current = null;
    setTab(1);
    message.info("Form has been reset");
  };

  console.log("ScheduleDetails render:", {
    mode,
    id: editId,
    tab,
    isInitialized: isInitialized.current,
    hasLoadedEditData: hasLoadedEditData.current,
    lastEditId: lastEditId.current,
    scheduleDetailsId: scheduleDetails?.id,
    formValues: form.getFieldsValue(),
  });

  return (
    <div>
      <LoadingOverlay loading={loading} />

      {tab === 1 && (
        <FormCard
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          mode={mode}
        />
      )}

      {tab === 2 && (
        <CalendarViewCard
          onSubmit={handleTimeSlotSubmit}
          form={form}
          onBack={handleBack}
        />
      )}

      {tab === 3 && (
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
