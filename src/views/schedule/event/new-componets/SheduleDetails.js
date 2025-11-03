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
    console.log("🔍 Starting transform with values:", values);

    const startDate = dayjs(
      values.start_date || scheduleFormData.start_date
    ).format("YYYY-MM-DD");
    const endDate = dayjs(values.end_date || scheduleFormData.end_date).format(
      "YYYY-MM-DD"
    );

    const isSeatBased =
      (values.available_types || scheduleFormData.available_types) ===
      "seat_structure";

    let transformedShowDates = [];

    console.log("🔍 Transform type check:", {
      isSeatBased,
      available_types:
        values.available_types || scheduleFormData.available_types,
    });

    if (isSeatBased) {
      // ✅ FIX: For seat-based, try multiple sources for show_dates
      const showDates =
        values.show_dates ||
        scheduleFormData.show_dates ||
        scheduleFormData.showdates ||
        [];

      console.log("🪑 Seat-based transform:", {
        showDates_from_values: values.show_dates?.length,
        showDates_from_redux: scheduleFormData.show_dates?.length,
        final_showDates: showDates.length,
        showDates,
      });

      if (!showDates || showDates.length === 0) {
        throw new Error(
          "At least one seat-based show time is required. Please add time slots in the Plan tab."
        );
      }

      // ✅ For seat-based, show_dates already has the correct structure from generateShowDatesFromEvents
      transformedShowDates = showDates.map((showDate) => {
        const transformedShowTimes = (showDate.show_times || []).map(
          (showTime) => {
            // ✅ Validate seat structure exists
            const seatStructureId =
              showTime.seat_structure_id ||
              showTime.seatstructureid ||
              showTime.event_seat_id;

            if (!seatStructureId) {
              console.error(
                "❌ Missing seat_structure_id for show_time:",
                showTime
              );
            }

            return {
              show_time_id: showTime.show_time_id || showTime.id,
              start_time: showTime.start_time,
              end_time: showTime.end_time,
              is_midnight: String(showTime.is_midnight || false),
              seat_structure_id: seatStructureId, // ✅ Use seat_structure_id for seat-based
              offer_ids: showTime.offer_ids || [],
              coupon_ids: showTime.coupon_ids || [],
            };
          }
        );

        return {
          show_date_id: showDate.show_date_id || showDate.id,
          start_date: showDate.start_date,
          end_date: showDate.end_date,
          offer_ids: showDate.offer_ids || [],
          coupon_ids: showDate.coupon_ids || [],
          show_times: transformedShowTimes,
        };
      });
    } else {
      // ✅ For ticket-based booking
      const showDates =
        values.show_dates ||
        scheduleFormData.show_dates ||
        scheduleFormData.showdates ||
        [];

      console.log("🎫 Ticket-based transform:", {
        showDates_from_values: values.show_dates?.length,
        showDates_from_redux: scheduleFormData.show_dates?.length,
        final_showDates: showDates.length,
      });

      if (!showDates || showDates.length === 0) {
        throw new Error(
          "At least one show date is required. Please add time slots in the Plan tab."
        );
      }

      transformedShowDates = showDates.map((showDate) => {
        const transformedShowTimes = (showDate.show_times || []).map(
          (showTime) => {
            // ✅ Validate ticket structure exists
            const ticketStructureId =
              showTime.ticket_structure_id || showTime.ticketstructureid;

            if (!ticketStructureId && !showTime.ticket_set) {
              console.error(
                "❌ Missing ticket_structure_id or ticket_set for show_time:",
                showTime
              );
            }

            return {
              show_time_id: showTime.show_time_id || showTime.id,
              start_time: showTime.start_time,
              end_time: showTime.end_time,
              is_midnight: String(showTime.is_midnight || false),
              ticket_structure_id: ticketStructureId,
              ticket_set: showTime.ticket_set,
              seat_structure_id: showTime.seat_structure_id, // Can be null for ticket-based
              offer_ids: showTime.offer_ids || [],
              coupon_ids: showTime.coupon_ids || [],
            };
          }
        );

        return {
          show_date_id: showDate.show_date_id || showDate.id,
          start_date: showDate.start_date,
          end_date: showDate.end_date,
          offer_ids: showDate.offer_ids || [],
          coupon_ids: showDate.coupon_ids || [],
          show_times: transformedShowTimes,
        };
      });
    }

    // ✅ Final validation with better error message
    if (!transformedShowDates || transformedShowDates.length === 0) {
      const errorMsg = isSeatBased
        ? "Failed to transform seat-based show dates. Please ensure all time slots have a seat structure selected."
        : "Failed to transform ticket-based show dates. Please ensure all time slots have a ticket structure or ticket set selected.";

      console.error("❌ Transform failed:", {
        isSeatBased,
        transformedShowDates,
        values,
        scheduleFormData,
      });

      throw new Error(errorMsg);
    }

    console.log("✅ Successfully transformed show_dates:", {
      count: transformedShowDates.length,
      isSeatBased,
      data: transformedShowDates,
    });

    // ✅ Return COMPLETE payload with ALL required fields
    const completePayload = {
      name: values.name || scheduleFormData.name,
      start_date: startDate,
      end_date: endDate,
      event_id: values.event_id || scheduleFormData.event_id,
      venue_id: values.venue_id || scheduleFormData.venue_id,
      available_types:
        values.available_types ||
        scheduleFormData.available_types ||
        "ticket_structure",

      max_ticket_per_booking: String(
        values.max_ticket_per_booking ||
          scheduleFormData.max_ticket_per_booking ||
          23
      ),
      is_multi_date: Boolean(
        values.is_multi_date || scheduleFormData.is_multi_date
      ),
      booking_start_date_time: dayjs(
        values.booking_start_date_time ||
          scheduleFormData.booking_start_date_time
      ).format("YYYY-MM-DDTHH:mm"),
      ad_start_date_time: dayjs(
        values.ad_start_date_time || scheduleFormData.ad_start_date_time
      ).format("YYYY-MM-DDTHH:mm"),

      booking_limit_per_user: values.booking_limit_per_user_toggle
        ? values.booking_limit_per_user
        : null,
      payment_required: Boolean(
        values.payment_required || scheduleFormData.payment_required
      ),
      booking_limit_per_user_toggle: Boolean(
        values.booking_limit_per_user_toggle ||
          scheduleFormData.booking_limit_per_user_toggle
      ),

      add_ons: transformAddOns(values.add_ons || scheduleFormData.add_ons),
      food_slots: transformFoodSlots(),

      show_dates: transformedShowDates,
      offer_ids: transformOffersCoupons(selectedOffers, "offer"),
      coupon_ids: transformOffersCoupons(selectedCoupons, "coupons"),

      ...(values.id || scheduleDetails?.id
        ? { id: values.id || scheduleDetails.id }
        : {}),
    };

    console.log("✅ Complete payload:", completePayload);

    return completePayload;
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
      const currentFormValues = form.getFieldsValue();

      // ✅ CRITICAL FIX: Ensure show_dates from formData is preserved
      const mergedData = {
        ...scheduleFormData,
        ...currentFormValues,
        ...formData,
        // ✅ Explicitly preserve show_dates
        show_dates: formData.show_dates || scheduleFormData.show_dates || [],
      };

      // ✅ Validate that show_dates exists and is not empty
      if (!mergedData.show_dates || mergedData.show_dates.length === 0) {
        message.error("Please add at least one time slot before proceeding");
        console.error("❌ No show_dates found:", {
          formData,
          scheduleFormData,
          mergedData,
        });
        return;
      }

      // ✅ Update Redux store
      const updatedData = updateStoreAndForm(mergedData);

      // ✅ Log for debugging
      console.log("✅ Time slot data saved to Redux:", {
        show_dates_count: updatedData.show_dates?.length,
        show_dates: updatedData.show_dates,
        available_types: updatedData.available_types,
      });

      setTab(3);
      message.success(
        `${updatedData.show_dates.length} time slots saved successfully!`
      );
    } catch (error) {
      console.error("Time slot validation error:", error);
      message.error("Please ensure all time slots are configured correctly.");
    }
  };

  // Only showing the updated handleOfferSubmit function
  // Replace this function in your ScheduleDetails.jsx file

  const handleOfferSubmit = (formData) => {
    try {
      const existingShowDates = scheduleFormData.show_dates || [];

      console.log("🎯 Processing offers and coupons with time slots:", {
        offerCount: formData.offer_ids.length,
        couponCount: formData.coupon_ids.length,
      });

      // Build map of time slot IDs to offers/coupons
      const timeSlotOffersMap = new Map();
      const timeSlotCouponsMap = new Map();

      // Process offers
      formData.offer_ids.forEach((offer) => {
        const selectedTimeSlots = offer.selected_time_slots || [];

        if (selectedTimeSlots.length === 0) {
          // Schedule level - will be added at root level
          return;
        }

        // Time slot level - add to each specific time slot
        selectedTimeSlots.forEach((timeSlotId) => {
          if (!timeSlotOffersMap.has(timeSlotId)) {
            timeSlotOffersMap.set(timeSlotId, []);
          }
          timeSlotOffersMap.get(timeSlotId).push({
            offer_id: offer.offer_id,
            valid_from: offer.valid_from,
            valid_to: offer.valid_to,
          });
        });
      });

      // Process coupons
      formData.coupon_ids.forEach((coupon) => {
        const selectedTimeSlots = coupon.selected_time_slots || [];

        if (selectedTimeSlots.length === 0) {
          return;
        }

        selectedTimeSlots.forEach((timeSlotId) => {
          if (!timeSlotCouponsMap.has(timeSlotId)) {
            timeSlotCouponsMap.set(timeSlotId, []);
          }
          timeSlotCouponsMap.get(timeSlotId).push({
            coupon_id: coupon.coupon_id,
            valid_from: coupon.valid_from,
            valid_to: coupon.valid_to,
          });
        });
      });

      // Update show_dates with time-slot-level offers/coupons
      const updatedShowDates = existingShowDates.map((showDate) => {
        const updatedShowTimes = (showDate.show_times || []).map((showTime) => {
          const timeSlotId = showTime.id || showTime.show_time_id;

          return {
            ...showTime,
            offer_ids: timeSlotOffersMap.get(timeSlotId) || [],
            coupon_ids: timeSlotCouponsMap.get(timeSlotId) || [],
          };
        });

        return {
          ...showDate,
          offer_ids: [], // No date-level offers in your API structure
          coupon_ids: [], // No date-level coupons in your API structure
          show_times: updatedShowTimes,
        };
      });

      // Schedule-level offers/coupons (those without specific time slots selected)
      const scheduleLevelOffers = formData.offer_ids
        .filter(
          (o) => !o.selected_time_slots || o.selected_time_slots.length === 0
        )
        .map((o) => ({
          offer_id: o.offer_id,
          valid_from: o.valid_from,
          valid_to: o.valid_to,
        }));

      const scheduleLevelCoupons = formData.coupon_ids
        .filter(
          (c) => !c.selected_time_slots || c.selected_time_slots.length === 0
        )
        .map((c) => ({
          coupon_id: c.coupon_id,
          valid_from: c.valid_from,
          valid_to: c.valid_to,
        }));

      const finalData = {
        ...scheduleFormData,
        offer_ids: scheduleLevelOffers,
        coupon_ids: scheduleLevelCoupons,
        show_dates: updatedShowDates,
      };

      console.log("✅ Final structure with time-slot offers:", finalData);

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
      const dataToSubmit = finalData || {
        ...scheduleFormData,
        ...form.getFieldsValue(),
      };

      const finalSubmitData = {
        ...dataToSubmit,
        id: scheduleDetails?.id || undefined,
      };

      // ✅ Validate show_dates before transformation
      if (
        !finalSubmitData.show_dates ||
        finalSubmitData.show_dates.length === 0
      ) {
        if (
          !finalSubmitData.show_seat_details ||
          finalSubmitData.show_seat_details.length === 0
        ) {
          message.error("Please add at least one show date with time slots");
          setTab(2); // Go back to time slot tab
          return;
        }
      }

      const transformedData = transformSubmitData(finalSubmitData);

      if (mode === EDIT) {
        const pageData = {
          schedule_id: scheduleDetails.id,
        };

        console.log("Edit Data:", transformedData);
        const resultAction = await dispatch(
          editSchedule({
            data: transformedData,
            action: ActionType.WARNING,
            pageData,
          })
        );

        if (editSchedule.fulfilled.match(resultAction)) {
          dispatch(setSelectedSchedule(transformedData));
          dispatch(setScheduleDialogVisible(true));
        }
      } else {
        dispatch(setScheduleSubmitData(transformedData));
        dispatch(setSelectedSubmitItem(transformedData));

        console.log("Final submit data:", transformedData);
        message.success("Schedule data prepared for submission!");
      }
    } catch (error) {
      console.error("Final submit error:", error);
      message.error(
        error.message ||
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
