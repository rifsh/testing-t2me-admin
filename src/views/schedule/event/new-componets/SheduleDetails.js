import React, { useState, useEffect, useRef, useMemo } from "react";
import { Form, Button, message, Modal } from "antd";
import { LockOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
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
  editSchedule,
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

const getBlockingInfo = (checkedScheduleDetails) => {
  if (!checkedScheduleDetails) {
    return {
      isScheduleBlocked: false,
      blockedDates: [],
      blockedTimeSlots: new Map(),
      blockingTicketIds: [],
      blockingSeatIds: [],
      couponEditable: true,
      offerEditable: true,
      venueEditable: true,
      placeEditable: true,
    };
  }

  const blockedDates = new Set();
  const blockedTimeSlots = new Map(); // Map<dateId, Set<timeSlotId>>

  if (checkedScheduleDetails.show_dates) {
    checkedScheduleDetails.show_dates.forEach((dateInfo) => {
      if (dateInfo.editable === false) {
        blockedDates.add(dateInfo.show_date_id);
      } else if (dateInfo.show_times) {
        const blockedTimes = new Set();
        dateInfo.show_times.forEach((timeSlot) => {
          if (timeSlot.editable === false) {
            blockedTimes.add(timeSlot.show_time_id);
          }
        });
        if (blockedTimes.size > 0) {
          blockedTimeSlots.set(dateInfo.show_date_id, blockedTimes);
        }
      }
    });
  }

  return {
    isScheduleBlocked: checkedScheduleDetails.editable === false,
    blockedDates,
    blockedTimeSlots,
    blockingTicketIds: checkedScheduleDetails.blocking_ticket_ids || [],
    blockingSeatIds: checkedScheduleDetails.blocking_seat_ids || [],
    couponEditable: checkedScheduleDetails.coupon_editable !== false,
    offerEditable: checkedScheduleDetails.offer_editable !== false,
    venueEditable: checkedScheduleDetails.venue_editable !== false,
    placeEditable: checkedScheduleDetails.place_editable !== false,
  };
};

const getBlockingMessage = (blockingInfo) => {
  if (blockingInfo.isScheduleBlocked) {
    return {
      title: "Schedule Cannot Be Edited",
      message:
        "This schedule has active bookings and cannot be modified. All editing actions are disabled.",
      level: "schedule",
    };
  }

  const blockedDatesCount = blockingInfo.blockedDates.size;
  const blockedTimeSlotsCount = Array.from(
    blockingInfo.blockedTimeSlots.values()
  ).reduce((sum, set) => sum + set.size, 0);

  if (blockedDatesCount > 0) {
    return {
      title: "Some Dates Are Locked",
      message: `${blockedDatesCount} date(s) have active bookings and cannot be edited. Other dates can still be modified.`,
      level: "date",
      count: blockedDatesCount,
    };
  }

  if (blockedTimeSlotsCount > 0) {
    return {
      title: "Some Time Slots Are Locked",
      message: `${blockedTimeSlotsCount} time slot(s) have active bookings and cannot be edited. Other time slots can still be modified.`,
      level: "timeSlot",
      count: blockedTimeSlotsCount,
    };
  }

  return null;
};

// ==================== BLOCKING WARNING MODAL ====================

const BlockingWarningModal = ({ visible, blockingInfo, onOk, onCancel }) => {
  const blockingMessage = getBlockingMessage(blockingInfo);

  if (!blockingMessage) return null;

  const getModalConfig = () => {
    if (blockingMessage.level === "schedule") {
      return {
        okText: "Go Back to List",
        cancelText: null,
        okType: "primary",
        closable: false,
        footer: (
          <Button type="primary" onClick={onOk}>
            Go Back to List
          </Button>
        ),
      };
    }

    return {
      okText: "I Understand, Continue",
      cancelText: "Go Back to List",
      okType: "default",
      closable: true,
      footer: null,
    };
  };

  const config = getModalConfig();

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <LockOutlined className="text-red-500 text-lg" />
          <span className="text-lg font-semibold">{blockingMessage.title}</span>
        </div>
      }
      open={visible}
      onOk={onOk}
      onCancel={onCancel}
      okText={config.okText}
      cancelText={config.cancelText}
      okType={config.okType}
      closable={config.closable}
      maskClosable={false}
      centered
      width={560}
      footer={config.footer}
    >
      <div className="py-4">
        <div className="flex items-start space-x-3">
          <InfoCircleOutlined className="text-blue-500 text-2xl mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-gray-700 mb-4 text-base">
              {blockingMessage.message}
            </p>

            {blockingInfo.blockingTicketIds?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Affected Tickets:</strong>{" "}
                  {blockingInfo.blockingTicketIds.length} ticket type(s) in use
                </p>
              </div>
            )}

            {blockingInfo.blockingSeatIds?.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-yellow-800">
                  <strong>Affected Seats:</strong>{" "}
                  {blockingInfo.blockingSeatIds.length} seat(s) in use
                </p>
              </div>
            )}

            {blockingMessage.level === "schedule" && (
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-800 leading-relaxed">
                  <strong className="block mb-2">⚠️ Important Notice:</strong>
                  You cannot make any changes to this schedule because it has
                  active bookings. Please create a new schedule instead or
                  contact support for assistance.
                </p>
              </div>
            )}

            {blockingMessage.level === "date" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Locked dates are visually marked with a
                  lock icon and cannot be modified. You can still edit other
                  dates and add new time slots to unlocked dates.
                </p>
              </div>
            )}

            {blockingMessage.level === "timeSlot" && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Note:</strong> Locked time slots are visually marked
                  with a lock icon and cannot be deleted or modified. You can
                  still add new time slots or edit unlocked ones.
                </p>
              </div>
            )}

            {blockingMessage.level !== "schedule" && (
              <div className="mt-4 flex space-x-3">
                <Button type="default" onClick={onOk} className="flex-1">
                  I Understand, Continue
                </Button>
                <Button onClick={onCancel} className="flex-1">
                  Go Back to List
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ==================== MAIN COMPONENT ====================

const ScheduleDetails = ({ mode, id }) => {
  const [tab, setTab] = useState(1);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Refs
  const isInitialized = useRef(false);
  const hasLoadedEditData = useRef(false);
  const lastEditId = useRef(null);
  const hasShownBlockingModal = useRef(false);

  // Blocking state
  const [showBlockingModal, setShowBlockingModal] = useState(false);
  const [blockingInfo, setBlockingInfo] = useState({
    isScheduleBlocked: false,
    blockedDates: new Set(),
    blockedTimeSlots: new Map(),
    blockingTicketIds: [],
    blockingSeatIds: [],
  });

  // Selectors
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

  const isEditMode = useMemo(() => mode === EDIT, [mode]);
  const editId = useMemo(() => id, [id]);

  // ==================== BLOCKING CHECK EFFECT ====================
  useEffect(() => {
    if (
      isEditMode &&
      checkedscheduleDetails &&
      !hasShownBlockingModal.current
    ) {
      const info = getBlockingInfo(checkedscheduleDetails);
      setBlockingInfo(info);

      console.log("Blocking Info:", info);

      // Show modal if schedule is completely blocked
      if (info.isScheduleBlocked) {
        setShowBlockingModal(true);
        hasShownBlockingModal.current = true;
      }
      // Show info modal for partial blocking
      else if (info.blockedDates.size > 0 || info.blockedTimeSlots.size > 0) {
        setShowBlockingModal(true);
        hasShownBlockingModal.current = true;
      }
    }
  }, [isEditMode, checkedscheduleDetails]);

  // ==================== BLOCKING MODAL HANDLERS ====================
  const handleBlockingModalOk = () => {
    if (blockingInfo.isScheduleBlocked) {
      // If schedule is completely blocked, navigate back
      navigate(`${APP_PREFIX_PATH}/schedule/list`);
    } else {
      // For partial blocking, allow user to continue
      setShowBlockingModal(false);
    }
  };

  const handleBlockingModalCancel = () => {
    // Navigate back to list
    navigate(`${APP_PREFIX_PATH}/schedule/list`);
  };

  // ==================== UTILITY FUNCTIONS ====================
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
        offer_ids: time.offer_ids || [],
        coupon_ids: time.coupon_ids || [],
        id: time.id,
        is_midnight: time.is_midnight || false,
        show_time_ticket_types: time.show_time_ticket_types || [],
        show_date_id: showDate.id,
        show_time_id: time.id,
      }));
      return acc;
    }, {});

    if (newDates.length > 0) {
      dispatch(setDates(newDates));
      dispatch(setActiveTab(newDates[0]));
      dispatch(setSlotStatus("green"));
      dispatch(setTimeSlots(formattedTimeSlots));
    }

    return { timeSlots: formattedTimeSlots, show_dates: showDates };
  };

  // ==================== INITIALIZATION ====================
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
        hasShownBlockingModal.current = false;
      }
    };
  }, [dispatch, isEditMode, editId, checkedscheduleDetails]);

  // ==================== LOAD EDIT DATA ====================
  useEffect(() => {
    const shouldLoadEditData =
      isEditMode &&
      scheduleDetails &&
      scheduleDetails.id &&
      editId &&
      String(scheduleDetails.id) === String(editId) &&
      !hasLoadedEditData.current;

    if (shouldLoadEditData) {
      console.log("===== SETTING UP EDIT DATA =====");

      try {
        const formValues = ScheduleUtil.createFormValues(scheduleDetails);
        const timeSlotData = setupEditTimeSlots(scheduleDetails.show_dates);

        const finalFormValues = {
          ...formValues,
          ...timeSlotData,
        };

        dispatch(setScheduleFormData(finalFormValues));

        setTimeout(() => {
          form.setFieldsValue(finalFormValues);
          form.validateFields().catch(() => {});
        }, 100);

        hasLoadedEditData.current = true;
        console.log("===== EDIT MODE SETUP COMPLETED =====");
      } catch (error) {
        console.error("Error setting up edit data:", error);
        hasLoadedEditData.current = false;
        message.error("Failed to load form data");
      }
    }
  }, [scheduleDetails, isEditMode, editId, dispatch, form]);

  // ==================== VALIDATION & HANDLERS ====================
  // (Keep all your existing validation and handler functions unchanged)

  const validateTimeSlots = (values) => {
    // Your existing validation code
    return true;
  };

  const getDefaultAddOns = () => [{ name: "USER_AND_FOOD", status: true }];

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
    // Your existing code
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
    // Your existing code
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
    // Your existing code
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
      id: values.id || undefined,
    };
  };

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
      console.warn(scheduleDetails.id, "idsss");
      const dataToSubmit = finalData || {
        ...scheduleFormData,
        ...form.getFieldsValue(),
      };
      const finalSubmitData = {
        ...dataToSubmit,
        id: scheduleDetails.id || undefined,
      };
      const submitData = transformSubmitData(finalSubmitData);

      dispatch(setScheduleSubmitData(submitData));

      dispatch(setSelectedSubmitItem(submitData));

      console.log("Final submit data:", submitData);
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
    blockingInfo,
    formValues: form.getFieldsValue(),
  });

  // If schedule is completely blocked, show overlay
  if (blockingInfo.isScheduleBlocked) {
    return (
      <div className="relative">
        <LoadingOverlay loading={loading} />

        <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6 opacity-50 pointer-events-none">
          <div className="text-center py-12">
            <LockOutlined className="text-6xl text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Schedule Locked
            </h2>
            <p className="text-gray-600">
              This schedule has active bookings and cannot be edited
            </p>
          </div>
        </div>

        <BlockingWarningModal
          visible={showBlockingModal}
          blockingInfo={blockingInfo}
          onOk={handleBlockingModalOk}
          onCancel={handleBlockingModalCancel}
        />
      </div>
    );
  }

  return (
    <div>
      <LoadingOverlay loading={loading} />

      {/* Blocking Warning Modal */}
      <BlockingWarningModal
        visible={showBlockingModal}
        blockingInfo={blockingInfo}
        onOk={handleBlockingModalOk}
        onCancel={handleBlockingModalCancel}
      />

      {tab === 1 && (
        <FormCard
          form={form}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
          mode={mode}
          blockingInfo={blockingInfo}
        />
      )}

      {tab === 2 && (
        <CalendarViewCard
          onSubmit={handleTimeSlotSubmit}
          form={form}
          onBack={handleBack}
          blockingInfo={blockingInfo}
        />
      )}

      {tab === 3 && (
        <OfferAndCoupons
          form={form}
          onSubmit={handleOfferSubmit}
          onBack={handleBack}
          initialData={scheduleFormData}
          blockingInfo={blockingInfo}
        />
      )}

      <SubmitAndConfirmModal
        responseData={responseData}
        addFunction={mode === EDIT ? editSchedule : addSchedule}
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
