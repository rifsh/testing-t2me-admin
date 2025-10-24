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
  setScheduleDialogVisible,
  setScheduleModalLoading,
  setSelectedSchedule,
} from "store/slices/scheduleSlice";
import { setCurrentStep, resetState } from "store/slices/eventSlice";
import { setSelectedSubmitItem } from "store/slices/modalSlice";
import { SubmitAndConfirmModal } from "components/util-components/ModalItems/SubmitConfirmModal";
import LoadingOverlay from "components/util-components/Loader/index";
import WarningModal from "components/util-components/ModalItems/WarningModal";
import { APP_PREFIX_PATH } from "configs/AppConfig";
import { BOOKING_ADDON_TYPE, EDIT } from "constants/AppConstants";
import { ActionType } from "utils/api/warning-submit-util";
import dayjs from "dayjs";
import Utils from "utils";
import { ScheduleUtil } from "../utils";

const getBlockingInfo = (checkedScheduleDetails) => {
  if (!checkedScheduleDetails) {
    return {
      isScheduleBlocked: false,
      blockedDates: new Set(),
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
  const blockedTimeSlots = new Map();

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

const ScheduleDetails = ({ mode, id }) => {
  const [tab, setTab] = useState(1);
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isInitialized = useRef(false);
  const hasLoadedEditData = useRef(false);
  const lastEditId = useRef(null);
  const hasShownBlockingModal = useRef(false);

  const [showBlockingModal, setShowBlockingModal] = useState(false);
  const [blockingInfo, setBlockingInfo] = useState({
    isScheduleBlocked: false,
    blockedDates: new Set(),
    blockedTimeSlots: new Map(),
    blockingTicketIds: [],
    blockingSeatIds: [],
  });

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
    dialogVisible,
    editable_status,
    selectedSchedule,
    responseImpactData,
    warningPagination,
    message: warningMessage,
  } = useSelector((state) => state.schedules);

  const { eventDetails, submitLoading } = useSelector((state) => state.event);
  const { selectedTicketType } = useSelector((state) => state.tickets);
  const { selectedVenue } = useSelector((state) => state.locations);
  const { selectedSubmitItem } = useSelector((state) => state.modalSlice);

  const isEditMode = useMemo(() => mode === EDIT, [mode]);
  const editId = useMemo(() => id, [id]);

  // Blocking check effect
  useEffect(() => {
    if (
      isEditMode &&
      checkedscheduleDetails &&
      !hasShownBlockingModal.current
    ) {
      const info = getBlockingInfo(checkedscheduleDetails);
      setBlockingInfo(info);

      console.log("Blocking Info:", info);

      if (info.isScheduleBlocked) {
        setShowBlockingModal(true);
        hasShownBlockingModal.current = true;
      } else if (info.blockedDates.size > 0 || info.blockedTimeSlots.size > 0) {
        setShowBlockingModal(true);
        hasShownBlockingModal.current = true;
      }
    }
  }, [isEditMode, checkedscheduleDetails]);

  // Blocking modal handlers
  const handleBlockingModalOk = () => {
    if (blockingInfo.isScheduleBlocked) {
      navigate(`${APP_PREFIX_PATH}/schedule/list`);
    } else {
      setShowBlockingModal(false);
    }
  };

  const handleBlockingModalCancel = () => {
    navigate(`${APP_PREFIX_PATH}/schedule/list`);
  };

  // Warning modal handlers (matching OfferForm pattern)
  const handleWarningPagination = (page, size) => {
    dispatch(
      editSchedule({
        data: selectedSchedule,
        action: ActionType.WARNING,
        pageData: { page, size },
      })
    );
  };

  const handleModalSubmit = async () => {
    dispatch(setScheduleModalLoading(true));
    const resultAction = await dispatch(
      editSchedule({ data: selectedSchedule, action: ActionType.SUBMIT })
    );
    dispatch(setScheduleModalLoading(false));
    dispatch(setScheduleDialogVisible(false));
    if (editSchedule.fulfilled.match(resultAction)) {
      dispatch(setSelectedSubmitItem(selectedSchedule));
    }
  };

  const handleModalCancel = () => {
    dispatch(setScheduleDialogVisible(false));
  };

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

  const setupEditTimeSlots = (scheduleDetails) => {
    if (!scheduleDetails) return;

    // Determine booking type
    const isSeatBased = scheduleDetails.available_types === "seat_structure";
    const sourceData = isSeatBased
      ? scheduleDetails.show_seat_details
      : scheduleDetails.show_dates;

    if (!sourceData?.length) return;

    const newDates = sourceData.map((item) => item.start_date);

    const formattedTimeSlots = {};

    if (isSeatBased) {
      // Handle seat-based booking - each item is a date with single time slot
      sourceData.forEach((seatDetail) => {
        if (!formattedTimeSlots[seatDetail.start_date]) {
          formattedTimeSlots[seatDetail.start_date] = [];
        }

        formattedTimeSlots[seatDetail.start_date].push({
          start_time: dayjs(
            `${seatDetail.start_date} ${seatDetail.start_time}`,
            "YYYY-MM-DD hh:mm A"
          ),
          end_time: dayjs(
            `${seatDetail.start_date} ${seatDetail.end_time}`,
            "YYYY-MM-DD hh:mm A"
          ),
          seatStructureId: seatDetail.event_seats?.event_seatstructures?.id,
          seat_structure_id: seatDetail.event_seats?.event_seatstructures?.id,
          seatStructureName: seatDetail.event_seats?.event_seatstructures?.name,
          totalSeats: seatDetail.event_seats?.event_seatstructures?.total_seats,
          offer_ids: seatDetail.offer_ids || [],
          coupon_ids: seatDetail.coupon_ids || [],
          id: seatDetail.id,
          is_midnight: seatDetail.is_midnight || false,
          // Store IDs for payload
          show_date_id: seatDetail.id,
          show_time_id: seatDetail.id,
          event_seat_id: seatDetail.event_seats?.event_seatstructures?.id,
        });
      });
    } else {
      // Handle ticket-based booking - original logic
      sourceData.forEach((showDate) => {
        formattedTimeSlots[showDate.start_date] = showDate.show_times.map(
          (time) => ({
            start_time: dayjs(
              `${showDate.start_date} ${time.start_time}`,
              "YYYY-MM-DD hh:mm A"
            ),
            end_time: dayjs(
              `${showDate.start_date} ${time.end_time}`,
              "YYYY-MM-DD hh:mm A"
            ),
            ticketType: time.event_ticket_structures?.id,
            seat_structure_id:
              time.event_ticket_structures?.ticket_structure?.id,
            ticket_set: time.event_ticket_structures?.ticket_set,
            offer_ids: time.offer_ids || [],
            coupon_ids: time.coupon_ids || [],
            id: time.id,
            is_midnight: time.is_midnight || false,
            show_time_ticket_types: time.show_time_ticket_types || [],
            // Store IDs for payload
            show_date_id: showDate.id,
            show_time_id: time.id,
            ticket_structure_id: time.event_ticket_structures?.id,
          })
        );
      });
    }

    if (newDates.length > 0) {
      dispatch(setDates(newDates));
      dispatch(setActiveTab(newDates[0]));
      dispatch(setSlotStatus("green"));
      dispatch(setTimeSlots(formattedTimeSlots));
    }

    return {
      timeSlots: formattedTimeSlots,
      show_dates: isSeatBased ? [] : sourceData,
      show_seat_details: isSeatBased ? sourceData : [],
    };
  };

  // Initialization
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

  // Load edit data
  useEffect(() => {
    const shouldLoadEditData =
      isEditMode &&
      scheduleDetails &&
      scheduleDetails.id &&
      editId &&
      String(scheduleDetails.id) === String(editId) &&
      !hasLoadedEditData.current;

    if (shouldLoadEditData) {
      try {
        const formValues = ScheduleUtil.createFormValues(scheduleDetails);
        // ✅ FIX: Pass the entire scheduleDetails object, not just show_dates
        const timeSlotData = setupEditTimeSlots(scheduleDetails);

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
      } catch (error) {
        console.error("Error setting up edit data:", error);
        hasLoadedEditData.current = false;
        message.error("Failed to load form data");
      }
    }
  }, [scheduleDetails, isEditMode, editId, dispatch, form]);

  // Validation & handlers
  const validateTimeSlots = (values) => {
    return true;
  };

  const transformAddOns = (addOns) => {
    if (selectedAddOnServiceList?.length > 0) {
      return selectedAddOnServiceList;
    }
    if (addOns?.length > 0) {
      return addOns.map((addon) =>
        typeof addon === "string" ? { name: addon, status: true } : addon
      );
    }
    return [];
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
    return [];
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

    const isSeatBased = values.available_types === "seat_structure";

    let transformedShowDates = [];

    if (isSeatBased) {
      // ✅ For seat-based: Convert seat_details into show_dates with show_times structure
      const groupedByDate = {};

      (values.show_seat_details || []).forEach((seatDetail) => {
        if (!groupedByDate[seatDetail.start_date]) {
          groupedByDate[seatDetail.start_date] = {
            id: seatDetail.show_date_id || seatDetail.id,
            start_date: seatDetail.start_date,
            show_times: [],
          };
        }

        groupedByDate[seatDetail.start_date].show_times.push({
          id: seatDetail.show_time_id || seatDetail.id,
          start_time: seatDetail.start_time,
          end_time: seatDetail.end_time,
          is_midnight: seatDetail.is_midnight || false,
          event_seat_id: seatDetail.event_seat_id || seatDetail.seatStructureId,
          offer_ids: seatDetail.offer_ids || [],
          coupon_ids: seatDetail.coupon_ids || [],
        });
      });

      transformedShowDates = Object.values(groupedByDate);
    } else {
      // ✅ For ticket-based: show_dates contains nested show_times array
      transformedShowDates = (values.show_dates || []).map((showDate) => {
        const transformedShowTimes = (showDate.show_times || []).map(
          (showTime) => ({
            id: showTime.show_time_id || showTime.id,
            start_time: showTime.start_time,
            end_time: showTime.end_time,
            is_midnight: String(showTime.is_midnight),
            ticket_structure_id: showTime.ticket_structure_id,
            ticket_set: showTime.ticket_set,
            seat_structure_id: showTime.seat_structure_id,
            offer_ids: showTime.offer_ids || [],
            coupon_ids: showTime.coupon_ids || [],
          })
        );

        return {
          id: showDate.show_date_id || showDate.id,
          start_date: showDate.start_date,
          end_date: showDate.end_date,
          offer_ids: showDate.offer_ids || [],
          coupon_ids: showDate.coupon_ids || [],
          show_times: transformedShowTimes,
        };
      });
    }

    return {
      id: values.id !== undefined ? values.id : undefined,
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
      name: values.name,
      event_id: values.event_id,
      venue_id: values.venue_id,
      show_dates: transformedShowDates,
      offer_ids: transformOffersCoupons(selectedOffers, "offer"),
      coupon_ids: transformOffersCoupons(selectedCoupons, "coupons"),
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
    try {
      const existingShowDates = scheduleFormData.show_dates.map(
        (sd) => sd.start_date
      );

      // Process offers and coupons
      const processedOffers = formData.offer_ids.map((offer) => {
        const selectedDates = offer.selected_dates;
        const datesMatch = existingShowDates.every((date) =>
          selectedDates.includes(date)
        );
        const allShowDatesSelected =
          selectedDates.length === existingShowDates.length &&
          selectedDates.length > 0 &&
          existingShowDates.length > 0 &&
          datesMatch;
        const isScheduleLevel =
          selectedDates.length === 0 || allShowDatesSelected;

        return {
          offer_id: offer.offer_id,
          valid_from: offer.valid_from,
          valid_to: offer.valid_to,
          selected_dates: selectedDates,
          is_schedule_level: isScheduleLevel,
        };
      });

      const processedCoupons = formData.coupon_ids.map((coupon) => {
        const selectedDates = coupon.selected_dates;
        const datesMatch = existingShowDates.every((date) =>
          selectedDates.includes(date)
        );
        const allShowDatesSelected =
          selectedDates.length === existingShowDates.length &&
          selectedDates.length > 0 &&
          existingShowDates.length > 0 &&
          datesMatch;
        const isScheduleLevel =
          selectedDates.length === 0 || allShowDatesSelected;

        return {
          coupon_id: coupon.coupon_id,
          valid_from: coupon.valid_from,
          valid_to: coupon.valid_to,
          selected_dates: selectedDates,
          is_schedule_level: isScheduleLevel,
        };
      });

      const scheduleLevelOffers = processedOffers.filter(
        (o) => o.is_schedule_level
      );
      const dateLevelOffers = processedOffers.filter(
        (o) => !o.is_schedule_level
      );
      const scheduleLevelCoupons = processedCoupons.filter(
        (c) => c.is_schedule_level
      );
      const dateLevelCoupons = processedCoupons.filter(
        (c) => !c.is_schedule_level
      );

      // Update show_dates with date-level offers/coupons
      const updatedShowDates = scheduleFormData.show_dates.map((showDate) => {
        const dateStr = showDate.start_date;

        const dateOffers = dateLevelOffers
          .filter((o) => o.selected_dates.includes(dateStr))
          .map((o) => ({
            offer_id: o.offer_id,
            valid_from: dateStr,
            valid_to: dateStr,
          }));

        const dateCoupons = dateLevelCoupons
          .filter((c) => c.selected_dates.includes(dateStr))
          .map((c) => ({
            coupon_id: c.coupon_id,
            valid_from: dateStr,
            valid_to: dateStr,
          }));

        const updatedShowTimes = (showDate.show_times || []).map(
          (showTime) => ({
            ...showTime,
            offer_ids: dateOffers,
            coupon_ids: dateCoupons,
            id: showTime.show_time_id || showTime.id,
          })
        );

        return {
          ...showDate,
          offer_ids: dateOffers,
          coupon_ids: dateCoupons,
          show_times: updatedShowTimes,
          id: showDate.show_date_id || showDate.id,
        };
      });

      // ✅ FIX: Schedule-level offers/coupons go to ROOT level (empty selected_dates array)
      const finalData = {
        ...scheduleFormData,
        ...formData,
        offer_ids: scheduleLevelOffers.map((o) => ({
          offer_id: o.offer_id,
          valid_from: o.valid_from,
          valid_to: o.valid_to,
        })),
        coupon_ids: scheduleLevelCoupons.map((c) => ({
          coupon_id: c.coupon_id,
          valid_from: c.valid_from,
          valid_to: c.valid_to,
        })),
        show_dates: updatedShowDates,
      };

      const updatedData = updateStoreAndForm(finalData);
      handleFinalSubmit(updatedData);

      message.success("Offers and coupons configured successfully!");
    } catch (error) {
      console.error("Error in handleOfferSubmit:", error);
      message.error("Failed to process offers and coupons");
    }
  };

  const handleFinalSubmit = async (finalData = null) => {
    try {
      if (mode === EDIT) {
        const dataToSubmit = finalData || {
          ...scheduleFormData,
          ...form.getFieldsValue(),
        };
        const finalSubmitData = {
          ...dataToSubmit,
          id: scheduleDetails.id || undefined,
        };

        const editData = transformSubmitData(finalSubmitData);
        const pageData = {
          schedule_id: scheduleDetails.id,
        };

        console.log("Edit Data:", editData);
        const resultAction = await dispatch(
          editSchedule({ data: editData, action: ActionType.WARNING, pageData })
        );

        if (editSchedule.fulfilled.match(resultAction)) {
          dispatch(setSelectedSchedule(editData));
          dispatch(setScheduleDialogVisible(true));
        }
      } else {
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
      }
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

      <WarningModal
        visible={dialogVisible}
        title="Confirm Action"
        details={warningMessage}
        responseData={responseImpactData}
        warningMessage="Do you want to continue?"
        onSubmit={handleModalSubmit}
        onCancel={handleModalCancel}
        confirmText="Proceed"
        cancelText="Back"
        loading={loading}
        tableConfig={{
          title: "Active Schedules",
          dataKey: "items",
        }}
        editable_status={editable_status}
        pagination={warningPagination}
        onPaginationChange={handleWarningPagination}
      />

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
