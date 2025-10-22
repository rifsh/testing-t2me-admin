import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  ExclamationCircleOutlined,
} from "lucide-react";
import { Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setScheduleFormData } from "store/slices/scheduleSlice";

import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";
import { getDaysDiff, ScheduleUtil } from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
import TimeSlotsSidebar from "./TimeSlotsSidebar";
import dayjs from "dayjs";
import {
  getBlockingInfo,
  canEditEvent,
  formatDateForAPI,
  formatDateTimeForAPI,
  getBlockedDatesSet,
  validateDateRange,
  getBlockingMessage,
} from "../utils/blockingUtils";

const formatDateTime = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Helper to parse "HH:MM" or "10:00 AM" format to hour and minute
const parseTimeString = (timeStr) => {
  if (!timeStr) return { hour: 0, minute: 0 };

  // Try HH:MM format first
  const simpleMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    return {
      hour: parseInt(simpleMatch[1]),
      minute: parseInt(simpleMatch[2]),
    };
  }

  // Try "10:00 AM" format
  const ampmMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!ampmMatch) return { hour: 0, minute: 0 };

  let hour = parseInt(ampmMatch[1]);
  const minute = parseInt(ampmMatch[2]);
  const period = ampmMatch[3].toUpperCase();

  if (period === "PM" && hour !== 12) {
    hour += 12;
  } else if (period === "AM" && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
};

const CalendarViewCard = ({ form, onSubmit, onBack, blockingInfo }) => {
  const dispatch = useDispatch();
  const { eventDetails } = useSelector((state) => state.event || {});
  const { scheduleFormData, scheduleDetails, checkedscheduleDetails } =
    useSelector((state) => state.schedules);
  const [blockedEventIds, setBlockedEventIds] = useState(new Set());

  // ==================== REFS ====================
  const lastSavedData = useRef(null);
  const saveTimeout = useRef(null);
  const scrollContainerRef = useRef(null);
  const hasLoadedEditData = useRef(false);
  const blockingChecked = useRef(false);

  // ==================== CONSTANTS ====================
  const timeSlotColors = [
    "bg-red-500 border-red-600",
    "bg-blue-500 border-blue-600",
    "bg-green-500 border-green-600",
    "bg-yellow-500 border-yellow-600",
    "bg-purple-500 border-purple-600",
    "bg-pink-500 border-pink-600",
    "bg-indigo-500 border-indigo-600",
  ];

  const weekDayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  const timezone =
    eventDetails?.venue_events?.[0]?.venue?.place?.country?.time_zone || "UTC";

  // ==================== EDITABLE FLAGS ====================
  const isScheduleEditable = scheduleDetails?.editable !== false;
  const isPlaceEditable = scheduleDetails?.place_editable !== false;
  const isVenueEditable = scheduleDetails?.venue_editable !== false;
  const isOfferEditable = scheduleDetails?.offer_editable !== false;
  const isCouponEditable = scheduleDetails?.coupon_editable !== false;

  // Check if entire schedule is blocked for editing
  const isScheduleBlocked =
    !isScheduleEditable || !isPlaceEditable || !isVenueEditable;

  // ==================== HELPER FUNCTIONS ====================
  const getDefaultDates = () => {
    const now = new Date();
    const adStart = new Date(now);
    adStart.setDate(now.getDate() + 1);
    adStart.setHours(9, 0, 0, 0);

    const bookingStart = new Date(now);
    bookingStart.setDate(now.getDate() + 2);
    bookingStart.setHours(10, 0, 0, 0);

    const eventStart = new Date(bookingStart);
    eventStart.setDate(bookingStart.getDate() + 2);
    eventStart.setHours(11, 0, 0, 0);

    const eventEnd = new Date(eventStart);
    eventEnd.setDate(eventStart.getDate() + 6);
    eventEnd.setHours(23, 59, 59, 999);

    return {
      adStartTime: adStart,
      bookingStartTime: bookingStart,
      eventStartDate: eventStart,
      eventEndDate: eventEnd,
    };
  };

  // ==================== STATE INITIALIZATION ====================
  const defaults = getDefaultDates();

  const [adStartDateTime, setAdStartDateTime] = useState(() => {
    return scheduleFormData?.ad_start_date_time
      ? new Date(scheduleFormData.ad_start_date_time)
      : defaults.adStartTime;
  });

  const [bookingStartDateTime, setBookingStartDateTime] = useState(() => {
    return scheduleFormData?.booking_start_date_time
      ? new Date(scheduleFormData.booking_start_date_time)
      : defaults.bookingStartTime;
  });

  const [dateRange, setDateRange] = useState(() => ({
    startDate: scheduleFormData?.start_date
      ? new Date(scheduleFormData.start_date)
      : defaults.eventStartDate,
    endDate: scheduleFormData?.end_date
      ? new Date(scheduleFormData.end_date)
      : defaults.eventEndDate,
    isSelecting: false,
  }));
  const [allEvents, setAllEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);

  // ==================== BLOCKING INFO PROCESSING ====================
  useEffect(() => {
    if (
      scheduleFormData?.timeSlots &&
      blockingInfo &&
      allEvents.length > 0 &&
      !blockingChecked.current
    ) {
      console.log("===== PROCESSING BLOCKING INFO WITH EDITABLE FLAGS =====");
      console.log("Editable Flags:", {
        isScheduleEditable,
        isPlaceEditable,
        isVenueEditable,
        isOfferEditable,
        isCouponEditable,
      });

      const blockedIds = new Set();

      // If schedule is globally blocked, block ALL events
      if (isScheduleBlocked) {
        allEvents.forEach((event) => {
          blockedIds.add(event.id);
        });
        console.log("🚫 Schedule is globally blocked - all events locked");
        setBlockedEventIds(blockedIds);
        blockingChecked.current = true;
        return;
      }

      // Process individual show_dates blocking
      allEvents.forEach((event) => {
        Object.entries(scheduleFormData.timeSlots).forEach(
          ([dateStr, slots]) => {
            if (!Array.isArray(slots)) return;

            slots.forEach((slot, slotIndex) => {
              const showDateId = slot.show_date_id;
              const showTimeId = slot.show_time_id;

              if (!showDateId || !showTimeId) return;

              // Check if this event matches this slot
              if (isEventMatchingSlot(event, slot, dateStr)) {
                // Check show_date level editability
                const showDateEditable = scheduleDetails?.show_dates?.find(
                  (sd) => sd.show_date_id === showDateId
                )?.editable;

                // Check show_time level editability
                const showTimeEditable = scheduleDetails?.show_dates
                  ?.find((sd) => sd.show_date_id === showDateId)
                  ?.show_times?.find(
                    (st) => st.show_time_id === showTimeId
                  )?.editable;

                // Block if show_date is not editable OR show_time is not editable
                if (showDateEditable === false || showTimeEditable === false) {
                  blockedIds.add(event.id);
                  console.log(
                    `🔒 Blocked event ${event.id} - show_date_id: ${showDateId}, show_time_id: ${showTimeId}`
                  );
                  return;
                }

                // Check blocking_ticket_ids at schedule level
                if (
                  blockingInfo.scheduleBlockingTickets?.length > 0 &&
                  blockingInfo.scheduleBlockingTickets.some((ticketId) =>
                    slot.show_time_ticket_types?.some(
                      (tt) => tt.ticket_id === ticketId
                    )
                  )
                ) {
                  blockedIds.add(event.id);
                  console.log(
                    `🔒 Blocked event ${event.id} - has blocking tickets at schedule level`
                  );
                  return;
                }

                // Check if this date is completely blocked
                if (blockingInfo.blockedDates?.has(showDateId)) {
                  blockedIds.add(event.id);
                  console.log(
                    `🔒 Blocked event ${event.id} - blocked date ${showDateId}`
                  );
                  return;
                }

                // Check if this specific time slot is blocked
                if (
                  blockingInfo.blockedTimeSlots?.has(showDateId) &&
                  blockingInfo.blockedTimeSlots.get(showDateId).has(showTimeId)
                ) {
                  blockedIds.add(event.id);
                  console.log(
                    `🔒 Blocked event ${event.id} - blocked time slot ${showTimeId}`
                  );
                  return;
                }
              }
            });
          }
        );
      });

      setBlockedEventIds(blockedIds);
      blockingChecked.current = true;
      console.log("✅ Final Blocked Event IDs:", Array.from(blockedIds));
      console.log(
        "✅ Total blocked:",
        blockedIds.size,
        "out of",
        allEvents.length
      );
    }
  }, [
    allEvents,
    scheduleFormData?.timeSlots,
    blockingInfo,
    isScheduleEditable,
    isPlaceEditable,
    isVenueEditable,
    scheduleDetails,
  ]);

  // Helper function to check if event matches a slot
  const isEventMatchingSlot = (event, slot, dateStr) => {
    const eventDate = new Date(dateRange.startDate);
    eventDate.setDate(eventDate.getDate() + event.startTime.day);
    const eventDateStr = formatDateForAPI(eventDate);

    if (eventDateStr !== dateStr) return false;

    // Compare times
    const eventStartTime = `${event.startTime.hour
      .toString()
      .padStart(2, "0")}:${(event.startTime.minute || 0)
      .toString()
      .padStart(2, "0")}`;
    const slotStartTime = slot.start_time?.$d
      ? dayjs(slot.start_time).format("HH:mm")
      : typeof slot.start_time === "string"
      ? slot.start_time.includes("AM") || slot.start_time.includes("PM")
        ? (() => {
            const parsed = parseTimeString(slot.start_time);
            return `${parsed.hour.toString().padStart(2, "0")}:${parsed.minute
              .toString()
              .padStart(2, "0")}`;
          })()
        : slot.start_time
      : null;

    return eventStartTime === slotStartTime;
  };

  // ==================== LOAD EDIT MODE DATA ====================
  useEffect(() => {
    if (
      scheduleFormData?.timeSlots &&
      Object.keys(scheduleFormData.timeSlots).length > 0 &&
      !hasLoadedEditData.current
    ) {
      console.log("===== LOADING TIME SLOTS IN CALENDAR VIEW =====");
      console.log("Schedule Form Data:", scheduleFormData);

      try {
        // Load dates first
        if (scheduleFormData.ad_start_date_time) {
          const adDate = new Date(scheduleFormData.ad_start_date_time);
          setAdStartDateTime(adDate);
        }

        if (scheduleFormData.booking_start_date_time) {
          const bookingDate = new Date(
            scheduleFormData.booking_start_date_time
          );
          setBookingStartDateTime(bookingDate);
        }

        if (scheduleFormData.start_date && scheduleFormData.end_date) {
          const startDate = new Date(scheduleFormData.start_date);
          const endDate = new Date(scheduleFormData.end_date);
          setDateRange({
            startDate,
            endDate,
            isSelecting: false,
          });

          // Convert timeSlots to events with proper ID generation
          const loadedEvents = [];
          let eventIdCounter = 0;

          Object.entries(scheduleFormData.timeSlots).forEach(
            ([dateStr, slots]) => {
              if (!Array.isArray(slots)) return;

              slots.forEach((slot, slotIndex) => {
                // Calculate day index relative to start date
                const slotDate = new Date(dateStr);
                const daysDiff = Math.floor(
                  (slotDate - startDate) / (1000 * 60 * 60 * 24)
                );

                // Parse start and end times
                let startTime, endTime;

                if (slot.start_time?.$d) {
                  const startDayjs = dayjs(slot.start_time);
                  startTime = {
                    day: daysDiff,
                    hour: startDayjs.hour(),
                    minute: startDayjs.minute(),
                  };
                } else if (typeof slot.start_time === "string") {
                  const parsed = parseTimeString(slot.start_time);
                  startTime = {
                    day: daysDiff,
                    hour: parsed.hour,
                    minute: parsed.minute,
                  };
                } else {
                  startTime = {
                    day: daysDiff,
                    hour: 0,
                    minute: 0,
                  };
                }

                if (slot.end_time?.$d) {
                  const endDayjs = dayjs(slot.end_time);
                  endTime = {
                    day: slot.is_midnight ? daysDiff + 1 : daysDiff,
                    hour: endDayjs.hour(),
                    minute: endDayjs.minute(),
                  };
                } else if (typeof slot.end_time === "string") {
                  const parsed = parseTimeString(slot.end_time);
                  endTime = {
                    day: slot.is_midnight ? daysDiff + 1 : daysDiff,
                    hour: parsed.hour,
                    minute: parsed.minute,
                  };
                } else {
                  endTime = {
                    day: slot.is_midnight ? daysDiff + 1 : daysDiff,
                    hour: 23,
                    minute: 59,
                  };
                }

                const colorClass =
                  timeSlotColors[daysDiff % timeSlotColors.length];

                // Generate consistent event ID
                const event = {
                  id: `loaded-${dateStr}-${slotIndex}-${eventIdCounter++}`,
                  startTime,
                  endTime,
                  ticketType: slot.ticketType,
                  seat_structure_id: slot.seat_structure_id,
                  ticket_set: slot.ticket_set,
                  ticket_structure_id: slot.ticketType,
                  is_midnight_passed: slot.is_midnight || false,
                  show_end_date: slot.show_end_date || null,
                  show_time_ticket_types: slot.show_time_ticket_types || [],
                  show_date_id: slot.show_date_id,
                  show_time_id: slot.show_time_id,
                  offer_ids: slot.offer_ids || [],
                  coupon_ids: slot.coupon_ids || [],
                  color: colorClass,
                  timezone: timezone,
                };

                loadedEvents.push(event);
                console.log(`Loaded event ${eventIdCounter}:`, event);
              });
            }
          );

          setAllEvents(loadedEvents);
          hasLoadedEditData.current = true;
          console.log(`===== LOADED ${loadedEvents.length} TIME SLOTS =====`);
          message.success(`Loaded ${loadedEvents.length} existing time slots`);
        }
      } catch (error) {
        console.error("Error loading edit data in calendar view:", error);
        message.error("Failed to load time slots");
        hasLoadedEditData.current = false;
      }
    }
  }, [scheduleFormData, timezone]);

  // ==================== VALIDATION FUNCTIONS ====================
  const isAllDatesValid = () => {
    if (
      !adStartDateTime ||
      !bookingStartDateTime ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      return false;
    }

    if (adStartDateTime >= bookingStartDateTime) {
      return false;
    }

    const bookingDate = new Date(bookingStartDateTime);
    bookingDate.setHours(23, 59, 59, 999);

    const eventStart = new Date(dateRange.startDate);
    eventStart.setHours(0, 0, 0, 0);

    if (eventStart <= bookingDate) {
      return false;
    }

    if (!allEvents || allEvents.length === 0) {
      return false;
    }

    return true;
  };

  // ==================== EVENT HANDLERS ====================
  const resetToDefaults = () => {
    if (isScheduleBlocked) {
      message.error("Cannot reset: Schedule is locked due to active bookings");
      return;
    }

    const newDefaults = getDefaultDates();
    setAdStartDateTime(newDefaults.adStartTime);
    setBookingStartDateTime(newDefaults.bookingStartTime);
    setDateRange({
      startDate: newDefaults.eventStartDate,
      endDate: newDefaults.eventEndDate,
      isSelecting: false,
    });
    setAllEvents([]);
    setCurrentWeekStart(0);
    hasLoadedEditData.current = false;
    blockingChecked.current = false;
    setBlockedEventIds(new Set());

    form?.setFieldValue("ad_start_date_time", newDefaults.adStartTime);
    form?.setFieldValue(
      "booking_start_date_time",
      newDefaults.bookingStartTime
    );

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        ad_start_date_time: formatDateTime(newDefaults.adStartTime),
        booking_start_date_time: formatDateTime(newDefaults.bookingStartTime),
        start_date: formatDateForAPI(newDefaults.eventStartDate),
        end_date: formatDateForAPI(newDefaults.eventEndDate),
        show_dates: [],
        timeSlots: {},
      })
    );
  };

  const handleAdStartTimeChange = (date) => {
    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (!date) {
      resetToDefaults();
      message.warning(
        "Advertisement date cleared. All dates have been reset to defaults."
      );
      return;
    }

    setAdStartDateTime(date);
    form?.setFieldValue("ad_start_date_time", date);

    if (bookingStartDateTime && date >= bookingStartDateTime) {
      const newDefaults = getDefaultDates();
      setBookingStartDateTime(newDefaults.bookingStartTime);
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
      blockingChecked.current = false;
      form?.setFieldValue(
        "booking_start_date_time",
        newDefaults.bookingStartTime
      );

      message.warning(
        "Booking and event dates have been reset due to invalid advertisement date."
      );
    }

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        ad_start_date_time: formatDateTime(date),
      })
    );
  };

  const handleBookingStartTimeChange = (date) => {
    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (!date) {
      const newDefaults = getDefaultDates();
      setBookingStartDateTime(newDefaults.bookingStartTime);
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
      blockingChecked.current = false;
      form?.setFieldValue("bookingstartdatetime", newDefaults.bookingStartTime);
      message.warning(
        "Booking date cleared. Booking and event dates have been reset to defaults."
      );
      return;
    }

    setBookingStartDateTime(date);
    form?.setFieldValue("bookingstartdatetime", date);

    // FIXED: Changed <= to < to allow same day
    if (dateRange.startDate) {
      const bookingDate = new Date(date);
      bookingDate.setHours(0, 0, 0, 0); // Set to start of day

      const eventStart = new Date(dateRange.startDate);
      eventStart.setHours(0, 0, 0, 0); // Set to start of day

      // Changed from <= to < (allow same day)
      if (eventStart < bookingDate) {
        const newDefaults = getDefaultDates();
        setDateRange({
          startDate: newDefaults.eventStartDate,
          endDate: newDefaults.eventEndDate,
          isSelecting: false,
        });
        setAllEvents([]);
        blockingChecked.current = false;
        message.warning(
          "Event dates have been reset because they must be on or after the booking date."
        );
      }
    }

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        bookingstartdatetime: formatDateTime(date),
      })
    );
  };

  const handleDateRangeChange = (range) => {
    // CRITICAL: Check blocking info first
    if (
      blockingInfo.isScheduleBlocked ||
      blockingInfo.isVenueBlocked ||
      blockingInfo.isPlaceBlocked
    ) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    // FIXED: Don't treat incomplete selection as clearing dates in edit mode
    if (!range.startDate || !range.endDate) {
      // If user is still selecting (isSelecting = true), don't reset
      if (range.isSelecting) {
        // Just update the partial selection without resetting
        setDateRange(range);
        return;
      }

      // Only reset if both dates are explicitly null/undefined AND not selecting
      const newDefaults = getDefaultDates();
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
      blockingChecked.current = false;
      message.warning(
        "Event dates cleared. Dates have been reset to defaults."
      );
      return;
    }

    // Validate date range against blocking info
    const validation = validateDateRange(
      range.startDate,
      range.endDate,
      blockingInfo,
      checkedscheduleDetails
    );

    if (!validation.isValid) {
      message.error(validation.message);
      return;
    }

    if (bookingStartDateTime) {
      const bookingDate = new Date(bookingStartDateTime);
      bookingDate.setHours(0, 0, 0, 0);

      const eventStart = new Date(range.startDate);
      eventStart.setHours(0, 0, 0, 0);

      if (eventStart < bookingDate) {
        message.error(
          "Event start date must be on or after the booking date. Please select a valid date."
        );
        return;
      }
    }

    if (range.startDate >= range.endDate) {
      message.error(
        "End date must be after start date. Please select a valid date range."
      );
      return;
    }

    const hasExistingTimeSlots = allEvents && allEvents.length > 0;

    // FIXED: Check if date range actually CHANGED (not just re-selected same dates)
    const isDateRangeChanged =
      !dateRange.startDate ||
      !dateRange.endDate ||
      dateRange.startDate.getTime() !== range.startDate.getTime() ||
      dateRange.endDate.getTime() !== range.endDate.getTime();

    // FIXED: Only show confirmation modal if dates CHANGED and we have events
    if (hasExistingTimeSlots && isDateRangeChanged) {
      // ADDITIONAL FIX: In edit mode with blocked dates, only extending end date shouldn't trigger reset
      const isExtendingEndDate =
        dateRange.startDate &&
        dateRange.endDate &&
        range.startDate.getTime() === dateRange.startDate.getTime() &&
        range.endDate > dateRange.endDate;

      if (isExtendingEndDate) {
        // Just extend without confirmation
        proceedWithDateRangeChange(range);
        return;
      }

      setPendingDateChange({ type: "dateRange", range });
      setShowResetConfirmModal(true);
    } else {
      proceedWithDateRangeChange(range);
    }
  };

  const proceedWithDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentWeekStart(0);
    setAllEvents([]);
    blockingChecked.current = false;
    setBlockedEventIds(new Set());

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        start_date: formatDateForAPI(range.startDate),
        end_date: formatDateForAPI(range.endDate),
        show_dates: [],
        timeSlots: {},
      })
    );

    message.success("Event dates updated successfully.");
  };

  const debouncedSave = useCallback(
    (dataToSave) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(() => {
        dispatch(setScheduleFormData(dataToSave));
        lastSavedData.current = { ...dataToSave };
      }, 1000);
    },
    [dispatch]
  );

  const getAllDaysInRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return [];
    }

    const daysDiff = getDaysDiff(dateRange.startDate, dateRange.endDate);
    return Array.from({ length: daysDiff }, (_, i) => {
      const day = new Date(dateRange.startDate);
      day.setUTCDate(dateRange.startDate.getUTCDate() + i);
      return new Date(day);
    });
  };

  const generateShowDatesFromEvents = (events, currentDateRange) => {
    if (
      !events ||
      events.length === 0 ||
      !currentDateRange.startDate ||
      !currentDateRange.endDate
    ) {
      return [];
    }

    const allDaysInRange = getAllDaysInRange();
    const eventsByDate = {};

    events.forEach((event) => {
      if (!event.startTime || !event.endTime) return;

      const startDay = event.startTime.day;
      let endDay = event.endTime.day;

      if (event.is_midnight_passed) {
        endDay = startDay;
      }

      for (let day = startDay; day <= endDay; day++) {
        if (allDaysInRange[day]) {
          const dateStr = formatDateForAPI(allDaysInRange[day]);

          if (!eventsByDate[dateStr]) {
            // FIX: Store show_date_id in the structure
            eventsByDate[dateStr] = {
              show_date_id: event.show_date_id,
              show_times: [],
            };
          }

          eventsByDate[dateStr].show_times.push({
            // FIX: Include show_time ID
            id: event.show_time_id,
            start_time: `${event.startTime.hour.toString().padStart(2, "0")}:${(
              event.startTime.minute || 0
            )
              .toString()
              .padStart(2, "0")}`,
            end_time: `${event.endTime.hour.toString().padStart(2, "0")}:${(
              event.endTime.minute || 0
            )
              .toString()
              .padStart(2, "0")}`,
            // FIX: Include ticket_structure_id and other fields
            ticket_structure_id: event.ticket_structure_id,
            offer_ids: event.offer_ids || [],
            coupon_ids: event.coupon_ids || [],
            ticket_set: event.ticket_set,
            seat_structure_id: event.seat_structure_id,
            is_midnight: event.is_midnight_passed ? "true" : "false",
            show_end_date:
              event.is_midnight_passed && event.show_end_date
                ? event.show_end_date
                : null,
            timezone: timezone,
          });
        }
      }
    });

    const showDates = Object.entries(eventsByDate).map(
      ([dateStr, dateData]) => {
        let endDate = null;

        const hasMidnightEvent = dateData.show_times.some(
          (st) => st.is_midnight === "true"
        );

        if (hasMidnightEvent) {
          const midnightEvent = dateData.show_times.find(
            (st) => st.is_midnight === "true"
          );
          if (midnightEvent && midnightEvent.show_end_date) {
            endDate = midnightEvent.show_end_date;
          } else {
            const startDate = new Date(dateStr);
            const nextDay = new Date(startDate);
            nextDay.setDate(startDate.getDate() + 1);
            endDate = formatDateForAPI(nextDay);
          }
        }

        return {
          // FIX: Include show_date ID
          id: dateData.show_date_id,
          start_date: dateStr,
          end_date: endDate,
          show_times: dateData.show_times,
          offer_ids: [],
          coupon_ids: [],
          timezone: timezone,
        };
      }
    );

    showDates.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    return showDates;
  };

  const handleCreateEvent = async () => {
    try {
      if (blockingInfo?.isScheduleEditableStatus) {
        message.error("Cannot save: Schedule is locked due to active bookings");
        return;
      }

      if (!allEvents || allEvents.length === 0) {
        message.error(
          "Please add at least one time slot before saving the schedule."
        );
        return;
      }

      const hasBlockedEvents = allEvents.some((event) => {
        return blockedEventIds.has(event.id);
      });

      if (hasBlockedEvents && isScheduleBlocked) {
        message.error(
          "Cannot save: schedule has locked time slots with active bookings"
        );
        return;
      }

      const currentFormData = form?.getFieldsValue() || {};

      const finalData = {
        ...scheduleFormData,
        ...currentFormData,
        start_date: formatDateForAPI(dateRange.startDate),
        end_date: formatDateForAPI(dateRange.endDate),
        ad_start_date_time: formatDateTime(adStartDateTime),
        booking_start_date_time: formatDateTime(bookingStartDateTime),
        show_dates: generateShowDatesFromEvents(allEvents, dateRange),
        timezone: timezone,
      };

      console.log("💾 SUBMITTING SCHEDULE DATA:", finalData);

      const result = await onSubmit(finalData);

      message.success("Schedule saved successfully!");
    } catch (error) {
      console.error("❌ SCHEDULE SUBMISSION ERROR:", error);

      if (error?.response?.data?.status?.message) {
        message.error(error.response.data.status.message);
      } else if (error?.response?.data?.server_error) {
        message.error(error.response.data.server_error);
      } else if (error?.message) {
        message.error(error.message);
      } else {
        message.error("Failed to save schedule. Please try again.");
      }
    }
  };

  const getColorForDay = (dayIndex) => {
    return timeSlotColors[dayIndex % timeSlotColors.length];
  };

  const handleEventSave = (eventData) => {
    // Check if schedule is globally blocked
    if (blockingInfo?.isScheduleEditableStatus) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    // Check if this specific event's date/time is blocked
    if (eventData.show_date_id && eventData.show_time_id) {
      if (
        !canEditEvent(
          eventData.id,
          eventData.show_date_id,
          eventData.show_time_id,
          blockingInfo
        )
      ) {
        message.error(
          "This time slot has active bookings and cannot be modified"
        );
        return;
      }
    }

    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (eventData.id && eventData.id.startsWith("temp-")) {
      const eventDayIndex = eventData.startTime.day + currentWeekStart;
      const colorClass = getColorForDay(eventDayIndex);

      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        color: colorClass,
        timezone: timezone,
        startTime: {
          ...eventData.startTime,
          day: eventDayIndex,
        },
        endTime: {
          ...eventData.endTime,
          day: eventData.is_midnight_passed
            ? eventDayIndex
            : eventData.endTime.day + currentWeekStart,
        },
      };

      setAllEvents((prev) => {
        const updated = [...prev, newEvent];
        debouncedSave({
          ...scheduleFormData,
          show_dates: generateShowDatesFromEvents(updated, dateRange),
          timezone: timezone,
        });
        return updated;
      });
      message.success("Time slot created successfully!");
    } else {
      const eventDayIndex =
        eventData.originalStartDay !== undefined
          ? eventData.originalStartDay
          : eventData.startTime.day;
      const colorClass = getColorForDay(eventDayIndex);

      const updatedEvent = {
        ...eventData,
        color: colorClass,
        timezone: timezone,
        startTime: {
          ...eventData.startTime,
          day:
            eventData.originalStartDay !== undefined
              ? eventData.originalStartDay
              : eventData.startTime.day + currentWeekStart,
        },
        endTime: {
          ...eventData.endTime,
          day: eventData.is_midnight_passed
            ? eventData.originalStartDay !== undefined
              ? eventData.originalStartDay
              : eventData.startTime.day + currentWeekStart
            : eventData.originalEndDay !== undefined
            ? eventData.originalEndDay
            : eventData.endTime.day + currentWeekStart,
        },
      };

      setAllEvents((prev) => {
        const updated = prev.map((e) =>
          e.id === eventData.id ? updatedEvent : e
        );
        debouncedSave({
          ...scheduleFormData,
          show_dates: generateShowDatesFromEvents(updated, dateRange),
          timezone: timezone,
        });
        return updated;
      });
      message.success("Time slot updated successfully!");
    }
  };

  const handleEventDelete = (eventId) => {
    if (blockingInfo?.isScheduleEditableStatus) {
      message.error("Cannot delete: Schedule is locked due to active bookings");
      return;
    }

    if (blockedEventIds.has(eventId)) {
      message.error("This time slot has active bookings and cannot be deleted");
      return;
    }

    setAllEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      debouncedSave({
        ...scheduleFormData,
        show_dates: generateShowDatesFromEvents(updated, dateRange),
        timezone: timezone,
      });
      return updated;
    });
    message.success("Time slot deleted successfully!");
  };

  const getVisibleDays = () => {
    const allDays = getAllDaysInRange();
    const maxDays = Math.min(allDays.length, 7);
    return allDays.slice(currentWeekStart, currentWeekStart + maxDays);
  };

  const getVisibleEvents = () => {
    const visibleDays = getVisibleDays();
    const visibleEvents = allEvents.filter((event) => {
      if (!event.startTime || !event.endTime) return false;

      const eventStartDay = event.startTime.day;
      const eventEndDay = event.endTime.day;
      const weekStart = currentWeekStart;
      const weekEnd = currentWeekStart + visibleDays.length - 1;

      return !(eventEndDay < weekStart || eventStartDay > weekEnd);
    });

    return visibleEvents.map((event) => ({
      ...event,
      startTime: {
        ...event.startTime,
        day: event.startTime.day - currentWeekStart,
      },
      endTime: {
        ...event.endTime,
        day: event.endTime.day - currentWeekStart,
      },
      originalStartDay: event.startTime.day,
      originalEndDay: event.endTime.day,
    }));
  };

  const getBookingMinDate = () => {
    if (adStartDateTime) {
      const minDate = new Date(adStartDateTime);
      minDate.setMinutes(minDate.getMinutes() + 1);
      return minDate;
    }
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  };

  const getEventMinDate = () => {
    if (bookingStartDateTime) {
      const minDate = new Date(bookingStartDateTime);
      minDate.setDate(minDate.getDate());
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  };

  // Create blocked dates set for calendar
  const getBlockedDatesSet = () => {
    const blockedDates = new Set();

    if (blockingInfo?.blockedDates) {
      // If blockedDates is already a Set of date IDs, convert to date strings
      blockingInfo.blockedDates.forEach((showDateId) => {
        // Find corresponding date string from timeSlots
        Object.entries(scheduleFormData?.timeSlots || {}).forEach(
          ([dateStr, slots]) => {
            if (Array.isArray(slots)) {
              const hasBlockedDate = slots.some(
                (slot) => slot.show_date_id === showDateId
              );
              if (hasBlockedDate) {
                blockedDates.add(dateStr);
              }
            }
          }
        );
      });
    }

    return blockedDates;
  };

  // ==================== COMPUTED VALUES ====================
  const allDaysInRange = getAllDaysInRange();
  const visibleDays = getVisibleDays();
  const totalDays = allDaysInRange.length;
  const canNavigateNext = currentWeekStart + 7 < totalDays;
  const canNavigatePrev = currentWeekStart > 0;
  const hasValidDateRange = dateRange.startDate && dateRange.endDate;

  const isAdDateDisabled =
    blockingInfo?.isScheduleEditableStatus || isScheduleBlocked;

  const isBookingDateDisabled =
    !adStartDateTime ||
    blockingInfo?.isScheduleEditableStatus ||
    isScheduleBlocked;

  const isEventDateDisabled =
    !bookingStartDateTime ||
    !adStartDateTime ||
    blockingInfo?.isScheduleEditableStatus ||
    isScheduleBlocked;

  // ==================== RENDER ====================
  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* HEADER SECTION */}
      <div className="mb-6">
        {/* Schedule Blocked Warning */}
        {isScheduleBlocked && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
              {/* <ExclamationCircleOutlined className="text-red-600 text-lg" /> */}
              <div>
                <p className="text-sm font-semibold text-red-900">
                  🔒 Schedule Locked
                </p>
                <p className="text-xs text-red-700">
                  This schedule cannot be modified because:
                  {!isScheduleEditable && " Schedule has active bookings."}
                  {!isPlaceEditable && " Place settings are locked."}
                  {!isVenueEditable && " Venue settings are locked."}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Schedule</h1>
            <p className="text-gray-600">
              {hasValidDateRange
                ? `Manage your time slots for the selected dates (${timezone})`
                : `Select dates to start scheduling (${timezone})`}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Events: {allEvents.length} | Days: {allDaysInRange.length}
              {blockedEventIds.size > 0 && (
                <span className="ml-2 text-red-600">
                  🔒 {blockedEventIds.size} locked
                </span>
              )}
            </div>
          </div>
        </div>

        {!isAllDatesValid() && hasValidDateRange && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 text-sm">
              {allEvents.length === 0
                ? "⚠️ Please add at least one time slot to save the schedule."
                : "⚠️ Please check your date configuration."}
            </p>
          </div>
        )}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="col-span-3 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Advertisement Start Time *
              </label>
              <CompactDateTimePicker
                onDateTimeChange={handleAdStartTimeChange}
                label=""
                fullWidth={true}
                size="default"
                minDateTime={new Date(Date.now() + 60 * 60 * 1000)}
                showClearButton={true}
                value={adStartDateTime}
                timezone={timezone}
                disablePastDates={true}
                disablePastTimes={true}
                disabled={
                  isAdDateDisabled || blockingInfo?.isScheduleEditableStatus
                }
                blockedDates={getBlockedDatesSet(
                  scheduleFormData,
                  blockingInfo,
                  checkedscheduleDetails
                )}
                isScheduleBlocked={
                  blockingInfo?.isScheduleEditableStatus || false
                }
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Booking Start Time *
              </label>
              <CompactDateTimePicker
                onDateTimeChange={handleBookingStartTimeChange}
                label=""
                fullWidth={true}
                size="default"
                minDateTime={getBookingMinDate()}
                showClearButton={true}
                value={bookingStartDateTime}
                timezone={timezone}
                disablePastDates={true}
                disablePastTimes={true}
                disabled={
                  isBookingDateDisabled ||
                  blockingInfo?.isScheduleEditableStatus
                }
                blockedDates={getBlockedDatesSet(
                  scheduleFormData,
                  blockingInfo,
                  checkedscheduleDetails
                )}
                isScheduleBlocked={
                  blockingInfo?.isScheduleEditableStatus || false
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Dates *
            </label>
            <div
              className={
                isEventDateDisabled ? "opacity-50 pointer-events-none" : ""
              }
            >
              <CalendarWidget
                onDateRangeChange={handleDateRangeChange}
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
                minDate={getEventMinDate()} // Already calculated in your code
                blockedDates={getBlockedDatesSet(
                  scheduleFormData,
                  blockingInfo,
                  checkedscheduleDetails
                )}
                isScheduleBlocked={
                  blockingInfo?.isScheduleEditableStatus || false
                }
                isEditMode={true}
              />
            </div>
          </div>

          {hasValidDateRange && (
            <TimeSlotsSidebar
              allEvents={allEvents}
              onEventClick={(eventData, clickEvent) => {
                if (blockedEventIds.has(eventData.id)) {
                  message.warning(
                    "This time slot has active bookings and cannot be modified"
                  );
                  return;
                }
                const clickPosition = {
                  x: clickEvent?.clientX || 0,
                  y: clickEvent?.clientY || 0,
                };
                setSelectedEvent({ ...eventData, clickPosition });
                setModalOpen(true);
              }}
              onEventDelete={handleEventDelete}
              onEventUpdate={(event) => {
                if (blockedEventIds.has(event.id)) {
                  message.warning(
                    "This time slot has active bookings and cannot be modified"
                  );
                  return;
                }
                setSelectedEvent(event);
                setModalOpen(true);
              }}
              onApplyToAll={(templateEvent) => {
                if (isScheduleBlocked) {
                  message.error("Cannot add slots: Schedule is locked");
                  return;
                }

                const newEvents = [];
                allDaysInRange.forEach((_, dayIndex) => {
                  const hasConflict = allEvents.some((event) => {
                    return ScheduleUtil.isTimeOverlapping(event, {
                      startTime: { ...templateEvent.startTime, day: dayIndex },
                      endTime: { ...templateEvent.endTime, day: dayIndex },
                    });
                  });

                  if (!hasConflict) {
                    const colorClass = getColorForDay(dayIndex);
                    newEvents.push({
                      ...templateEvent,
                      id: `applied-${Date.now()}-${dayIndex}`,
                      color: colorClass,
                      timezone: timezone,
                      startTime: { ...templateEvent.startTime, day: dayIndex },
                      endTime: { ...templateEvent.endTime, day: dayIndex },
                    });
                  }
                });

                if (newEvents.length > 0) {
                  setAllEvents((prev) => {
                    const updated = [...prev, ...newEvents];
                    debouncedSave({
                      ...scheduleFormData,
                      show_dates: generateShowDatesFromEvents(
                        updated,
                        dateRange
                      ),
                      timezone: timezone,
                    });
                    return updated;
                  });
                  message.success(
                    `Successfully applied time slot to ${newEvents.length} days!`
                  );
                } else {
                  message.error(
                    "Could not apply time slot due to conflicts on all days."
                  );
                }
              }}
              allDaysInRange={allDaysInRange}
              timezone={timezone}
              blockedEventIds={blockedEventIds}
            />
          )}
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="col-span-9">
          {hasValidDateRange ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() =>
                      setCurrentWeekStart(Math.max(0, currentWeekStart - 7))
                    }
                    disabled={!canNavigatePrev}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentWeekStart(
                        Math.min(currentWeekStart + 7, totalDays - 7)
                      )
                    }
                    disabled={!canNavigateNext}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {visibleDays.length > 0
                      ? `${visibleDays[0].toLocaleDateString()} - ${visibleDays[
                          visibleDays.length - 1
                        ].toLocaleDateString()}`
                      : "Select Date Range"}
                  </h2>
                  {totalDays > 7 && (
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                      Days {currentWeekStart + 1}-
                      {Math.min(currentWeekStart + 7, totalDays)} of {totalDays}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={onBack}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <span>Go Back</span>
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                      isAllDatesValid() && !isScheduleBlocked
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                    disabled={!isAllDatesValid() || isScheduleBlocked}
                    title={
                      isScheduleBlocked
                        ? "Schedule is locked"
                        : !isAllDatesValid()
                        ? allEvents.length === 0
                          ? "Please add at least one time slot"
                          : "Please check your configuration"
                        : "Save schedule"
                    }
                  >
                    <Plus size={16} />
                    <span>Save Schedule</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div
                  className="grid gap-4 mb-4"
                  style={{
                    gridTemplateColumns:
                      "64px repeat(" + visibleDays.length + ", 1fr)",
                  }}
                >
                  <div></div>
                  {visibleDays.map((day, index) => (
                    <div key={index} className="text-center">
                      <div className="text-sm text-gray-500 font-medium mb-1">
                        {
                          weekDayNames[
                            day.getDay() === 0 ? 6 : day.getDay() - 1
                          ]
                        }
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                <TimeSelector
                  days={visibleDays}
                  selectedTimeSlot={null}
                  onTimeSlotSelect={(timeSlot) => {
                    if (blockingInfo?.isScheduleEditableStatus) {
                      message.error("Cannot add slots: Schedule is locked");
                      return;
                    }
                    setSelectedEvent(timeSlot);
                    setModalOpen(true);
                  }}
                  events={getVisibleEvents()}
                  onEventClick={(eventData, clickEvent) => {
                    if (blockingInfo?.isScheduleEditableStatus) {
                      message.warning(
                        "This schedule is locked and cannot be modified"
                      );
                      return;
                    }
                    if (blockedEventIds.has(eventData.id)) {
                      message.warning(
                        "This time slot has active bookings and cannot be modified"
                      );
                      return;
                    }
                    const clickPosition = {
                      x: clickEvent?.clientX || 0,
                      y: clickEvent?.clientY || 0,
                    };
                    setSelectedEvent({ ...eventData, clickPosition });
                    setModalOpen(true);
                  }}
                  scrollContainerRef={scrollContainerRef}
                  blockedSlots={[]}
                  dayColors={timeSlotColors}
                  getColorForDay={getColorForDay}
                  onOverlapWarning={(msg) => message.warning(msg)}
                  eventDateRange={dateRange}
                  ticketOptionsMap={{}}
                  ticketSetOptionsMap={{}}
                  seatStructureOptionsMap={{}}
                  timezone={timezone}
                  blockedEventIds={blockedEventIds}
                  blockingInfo={blockingInfo}
                  checkedscheduleDetails={checkedscheduleDetails}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-center p-8">
                <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Configure Schedule Times
                </h3>
                <p className="text-gray-500">
                  Set your advertisement time, booking time, and event dates to
                  start scheduling (Timezone: {timezone})
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EVENT MODAL */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        allDays={allDaysInRange}
        existingEvents={allEvents}
        form={form}
        eventDateRange={dateRange}
        timezone={timezone}
        isBlocked={
          blockingInfo?.isScheduleEditableStatus ||
          (selectedEvent && blockedEventIds.has(selectedEvent.id))
        }
        blockingInfo={blockingInfo}
        checkedscheduleDetails={checkedscheduleDetails}
      />
      {/* RESET CONFIRMATION MODAL */}
      <Modal
        title="Reset All Time Slots"
        open={showResetConfirmModal}
        onOk={() => {
          if (pendingDateChange?.type === "dateRange") {
            proceedWithDateRangeChange(pendingDateChange.range);
          }
          setShowResetConfirmModal(false);
          setPendingDateChange(null);
        }}
        onCancel={() => {
          setShowResetConfirmModal(false);
          setPendingDateChange(null);
        }}
        okText="Yes, Reset All"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        centered
      >
        <div className="py-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Confirm Time Slots Reset
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Changing the date range will reset ALL currently selected time
                slots ({allEvents.length} events). This action cannot be undone.
                Are you sure you want to continue?
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarViewCard;
