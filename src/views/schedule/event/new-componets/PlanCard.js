import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button, Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setScheduleFormData } from "store/slices/scheduleSlice";

import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";
import { getDaysDiff, ScheduleUtil } from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
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
import { EDIT } from "constants/AppConstants";

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

const CalendarViewCard = ({ form, onSubmit, onBack, blockingInfo, mode }) => {
  const dispatch = useDispatch();
  const { eventDetails } = useSelector((state) => state.event || {});
  const { scheduleFormData, scheduleDetails, checkedscheduleDetails } =
    useSelector((state) => state.schedules);
  const [blockedEventIds, setBlockedEventIds] = useState(new Set());
  // After other useState declarations (around line ~150-180)
  const [showBlockedDatesWarningModal, setShowBlockedDatesWarningModal] =
    useState(false);
  const [excludedBlockedDates, setExcludedBlockedDates] = useState([]);
  const [pendingBlockedDateChange, setPendingBlockedDateChange] =
    useState(null);

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
    eventDetails?.venue_events?.[0]?.venue?.place?.country?.time_zone;

  // ==================== EDITABLE FLAGS ====================
  const isScheduleEditable = scheduleDetails?.editable !== false;
  const isPlaceEditable = scheduleDetails?.place_editable !== false;
  const isVenueEditable = scheduleDetails?.venue_editable !== false;
  const isOfferEditable = scheduleDetails?.offer_editable !== false;
  const isCouponEditable = scheduleDetails?.coupon_editable !== false;

  // Check if entire schedule is blocked for editing
  const isScheduleBlocked =
    !isScheduleEditable || !isPlaceEditable || !isVenueEditable;

  // ==================== STATE INITIALIZATION (NO DEFAULTS) ====================
  const [adStartDateTime, setAdStartDateTime] = useState(() => {
    return scheduleFormData?.ad_start_date_time
      ? new Date(scheduleFormData.ad_start_date_time)
      : null; // Changed: No default
  });

  const [bookingStartDateTime, setBookingStartDateTime] = useState(() => {
    return scheduleFormData?.booking_start_date_time
      ? new Date(scheduleFormData.booking_start_date_time)
      : null; // Changed: No default
  });

  const [dateRange, setDateRange] = useState(() => ({
    startDate: scheduleFormData?.start_date
      ? new Date(scheduleFormData.start_date)
      : null, // Changed: No default
    endDate: scheduleFormData?.end_date
      ? new Date(scheduleFormData.end_date)
      : null, // Changed: No default
    isSelecting: false,
  }));

  const [allEvents, setAllEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);

  useEffect(() => {
    // Don't load if we already have events or are in the middle of loading
    if (allEvents.length > 0 || hasLoadedEditData.current) {
      return;
    }

    const showDates =
      scheduleFormData?.show_dates || scheduleFormData?.showdates;

    if (
      showDates &&
      showDates.length > 0 &&
      scheduleFormData.start_date &&
      scheduleFormData.end_date
    ) {
      console.log("===== LOADING EVENTS FROM REDUX =====");
      console.log("Show dates count:", showDates.length);
      console.log("Show dates data:", showDates);

      try {
        const startDate = new Date(scheduleFormData.start_date);
        const endDate = new Date(scheduleFormData.end_date);

        setDateRange({
          startDate,
          endDate,
          isSelecting: false,
        });

        if (scheduleFormData.ad_start_date_time) {
          setAdStartDateTime(new Date(scheduleFormData.ad_start_date_time));
        }

        if (scheduleFormData.booking_start_date_time) {
          setBookingStartDateTime(
            new Date(scheduleFormData.booking_start_date_time)
          );
        }

        const loadedEvents = [];
        let eventIdCounter = 0;

        showDates.forEach((showDate, dateIndex) => {
          const dateStr = showDate.startdate || showDate.start_date;
          const slotDate = new Date(dateStr);
          const daysDiff = Math.floor(
            (slotDate - startDate) / (1000 * 60 * 60 * 24)
          );

          console.log(`📅 Processing show_date ${dateIndex}:`, {
            dateStr,
            daysDiff,
            showtimes: showDate.showtimes || showDate.show_times,
          });

          const showtimes = showDate.showtimes || showDate.show_times;

          if (showtimes && Array.isArray(showtimes)) {
            showtimes.forEach((timeSlot, slotIndex) => {
              const startTime = parseTimeString(
                timeSlot.starttime || timeSlot.start_time
              );
              const endTime = parseTimeString(
                timeSlot.endtime || timeSlot.end_time
              );
              const colorClass =
                timeSlotColors[daysDiff % timeSlotColors.length];

              // ✅ CRITICAL: Normalize ALL midnight field variations
              const isMidnight =
                timeSlot.ismidnight === true ||
                timeSlot.is_midnight_passed === true ||
                timeSlot.ismidnightpassed === true ||
                timeSlot.is_midnight === "true" ||
                timeSlot.ismidnight === "true";

              console.log(`⏰ Processing time slot ${slotIndex}:`, {
                startTime: `${startTime.hour}:${startTime.minute}`,
                endTime: `${endTime.hour}:${endTime.minute}`,
                isMidnight,
                rawMidnightValue: {
                  ismidnight: timeSlot.ismidnight,
                  is_midnight_passed: timeSlot.is_midnight_passed,
                  ismidnightpassed: timeSlot.ismidnightpassed,
                  is_midnight: timeSlot.is_midnight,
                },
              });

              const event = {
                id: `loaded-${dateStr}-${slotIndex}-${eventIdCounter}`,
                startTime: {
                  day: daysDiff,
                  hour: startTime.hour,
                  minute: startTime.minute,
                },
                endTime: {
                  day: isMidnight ? daysDiff + 1 : daysDiff,
                  hour: endTime.hour,
                  minute: endTime.minute,
                },
                // ✅ Store ALL midnight field variations as BOOLEAN
                is_midnight_passed: isMidnight,
                ismidnightpassed: isMidnight,
                ismidnight: isMidnight,
                // ✅ Ticket/Seat fields
                ticketType:
                  timeSlot.ticketstructureid || timeSlot.ticket_structure_id,
                ticketstructureid:
                  timeSlot.ticketstructureid || timeSlot.ticket_structure_id,
                ticket_structure_id:
                  timeSlot.ticketstructureid || timeSlot.ticket_structure_id,
                seatstructureid:
                  timeSlot.seatstructureid || timeSlot.seat_structure_id,
                seat_structure_id:
                  timeSlot.seatstructureid || timeSlot.seat_structure_id,
                ticketset: timeSlot.ticketset || timeSlot.ticket_set,
                ticket_set: timeSlot.ticketset || timeSlot.ticket_set,
                showenddate: showDate.enddate || showDate.end_date,
                show_end_date: showDate.enddate || showDate.end_date,
                showdateid: showDate.id || showDate.show_date_id,
                showtimeid: timeSlot.id || timeSlot.show_time_id,
                offerids: timeSlot.offerids || timeSlot.offer_ids || [],
                offer_ids: timeSlot.offerids || timeSlot.offer_ids || [],
                couponids: timeSlot.couponids || timeSlot.coupon_ids || [],
                coupon_ids: timeSlot.couponids || timeSlot.coupon_ids || [],
                color: colorClass,
                timezone: timezone,
              };

              console.log(`✅ Created event ${eventIdCounter}:`, event);
              loadedEvents.push(event);
              eventIdCounter++;
            });
          }
        });

        console.log(`✅ Total loaded events: ${loadedEvents.length}`);
        console.log("📊 All loaded events:", loadedEvents);

        setAllEvents(loadedEvents);
        hasLoadedEditData.current = true;
        message.success(`Loaded ${loadedEvents.length} time slots`);
      } catch (error) {
        console.error("❌ Error loading events:", error);
        message.error("Failed to load time slots");
      }
    }
  }, [scheduleFormData?.show_dates, scheduleFormData?.showdates, timezone]);

  useEffect(() => {
    // Detect if show_dates was cleared from Redux
    const showDates =
      scheduleFormData?.show_dates || scheduleFormData?.showdates;

    if (!showDates || showDates.length === 0) {
      // Redux was cleared, clear local state too
      console.log("🧹 Clearing local state - Redux show_dates is empty");
      setAllEvents([]);
      hasLoadedEditData.current = false;
      blockingChecked.current = false;
      setBlockedEventIds(new Set());
    }
  }, [scheduleFormData?.show_dates, scheduleFormData?.showdates]);

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
  // Add this useEffect to AUTO-SAVE allEvents to Redux whenever they change
  useEffect(() => {
    if (allEvents.length > 0 && dateRange.startDate && dateRange.endDate) {
      const showDates = generateShowDatesFromEvents(allEvents, dateRange);

      console.log("💾 AUTO-SAVING to Redux:", {
        allEventsCount: allEvents.length,
        showDatesCount: showDates.length,
        showDates,
      });

      // Save to Redux immediately
      dispatch(
        setScheduleFormData({
          show_dates: showDates,
          timezone: timezone,
        })
      );
    } else if (allEvents.length === 0) {
      console.log("⚠️ No events to save");
    }
  }, [allEvents, dateRange.startDate, dateRange.endDate, timezone, dispatch]);

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

  const isAllDatesValid = () => {
    console.log("🔍 Validation Check:", {
      adStartDateTime: adStartDateTime ? "✓" : "✗",
      bookingStartDateTime: bookingStartDateTime ? "✓" : "✗",
      dateRangeStart: dateRange.startDate ? "✓" : "✗",
      dateRangeEnd: dateRange.endDate ? "✓" : "✗",
      allEventsCount: allEvents.length,
      scheduleFormDataShowDates: scheduleFormData?.show_dates?.length,
    });

    // Check if all required dates are set
    if (
      !adStartDateTime ||
      !bookingStartDateTime ||
      !dateRange.startDate ||
      !dateRange.endDate
    ) {
      message.error("Please set all required dates");
      console.log("❌ Missing required dates");
      return false;
    }

    // Check date order: ad < booking
    if (adStartDateTime > bookingStartDateTime) {
      console.log("❌ Ad time must be before booking time");
      message.error("Advertisement time must be before Booking time");
      return false;
    }

    // ✅ FIX: More lenient date comparison
    // Booking can end on the same day or before the event starts
    const bookingDate = new Date(bookingStartDateTime);
    const eventStart = new Date(dateRange.startDate);

    // Set booking to end of day and event to start of day for comparison
    const bookingEndOfDay = new Date(bookingDate);
    bookingEndOfDay.setHours(23, 59, 59, 999);

    const eventStartOfDay = new Date(eventStart);
    eventStartOfDay.setHours(0, 0, 0, 0);

    console.log("📅 Date Comparison:", {
      bookingDateTime: bookingDate.toISOString(),
      bookingEndOfDay: bookingEndOfDay.toISOString(),
      eventStartDate: dateRange.startDate,
      eventStartOfDay: eventStartOfDay.toISOString(),
      comparison: eventStartOfDay.getTime() - bookingEndOfDay.getTime(),
    });

    // ✅ FIX: Allow event to start on the same day as booking ends
    // Only fail if event starts BEFORE booking date (not same day)
    if (eventStartOfDay < new Date(bookingDate.setHours(0, 0, 0, 0))) {
      console.log("❌ Event must not start before booking date");
      message.error("Event start date must be on or after Booking date");
      return false;
    }

    // ✅ Check for time slots in BOTH allEvents AND Redux
    const hasEventsInState = allEvents && allEvents.length > 0;
    const hasEventsInRedux =
      scheduleFormData?.show_dates && scheduleFormData.show_dates.length > 0;

    // ✅ NOW PROPERLY DEFINED
    const hasTimeSlotsInRedux =
      scheduleFormData?.timeSlots &&
      Object.keys(scheduleFormData.timeSlots).length > 0;

    // Then used in validation
    if (!hasEventsInState && !hasEventsInRedux && !hasTimeSlotsInRedux) {
      console.log("❌ No time slots found in any source");
      message.error("Please add at least one time slot");
      return false;
    }

    // ✅ If we have events, validate they have proper ticket/seat configuration
    if (hasEventsInState) {
      const invalidEvents = allEvents.filter((event) => {
        const hasTicketStructure =
          event.ticket_structure_id ||
          event.ticketstructureid ||
          event.ticketType;

        const hasSeatStructure =
          event.seat_structure_id || event.seatstructureid;

        const hasTicketSet = event.ticket_set || event.ticketset;

        return !(hasTicketStructure || hasTicketSet || hasSeatStructure);
      });

      if (invalidEvents.length > 0) {
        console.log(
          "❌ Some time slots are missing ticket/seat configuration:",
          invalidEvents
        );
        return false;
      }
    }

    console.log("✅ All validations passed");
    return true;
  };
  // FIXED: Better validation with immediate response
  const handleAdStartTimeChange = (date) => {
    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (!date) {
      setAdStartDateTime(null);
      setBookingStartDateTime(null);
      setDateRange({ startDate: null, endDate: null, isSelecting: false });
      setAllEvents([]);
      blockingChecked.current = false;

      form?.setFieldValue("ad_start_date_time", null);
      form?.setFieldValue("booking_start_date_time", null);

      dispatch(
        setScheduleFormData({
          ...scheduleFormData,
          ad_start_date_time: null,
          booking_start_date_time: null,
          start_date: null,
          end_date: null,
          show_dates: [],
          timeSlots: {},
        })
      );

      message.warning("All dates have been cleared.");
      return;
    }

    // ✅ FIX: Check against CURRENT bookingStartDateTime, not stale state
    if (bookingStartDateTime) {
      const currentBooking = new Date(bookingStartDateTime);
      const newAd = new Date(date);

      // Clear milliseconds for fair comparison
      currentBooking.setMilliseconds(0);
      newAd.setMilliseconds(0);

      if (newAd >= currentBooking) {
        message.error("Advertisement time must be BEFORE Booking time");
        return; // Don't update - validation failed
      }
    }

    // ✅ Validation passed, update state
    setAdStartDateTime(date);
    form?.setFieldValue("ad_start_date_time", date);

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        ad_start_date_time: formatDateTime(date),
      })
    );

    message.success("Advertisement time updated successfully");
  };

  const handleBookingStartTimeChange = (date) => {
    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (!date) {
      setBookingStartDateTime(null);
      setDateRange({ startDate: null, endDate: null, isSelecting: false });
      setAllEvents([]);
      blockingChecked.current = false;

      form?.setFieldValue("booking_start_date_time", null);

      dispatch(
        setScheduleFormData({
          ...scheduleFormData,
          booking_start_date_time: null,
          start_date: null,
          end_date: null,
          show_dates: [],
          timeSlots: {},
        })
      );

      message.warning("Booking date cleared. Event dates have been reset.");
      return;
    }

    // ✅ FIX: Check against CURRENT adStartDateTime, not stale state
    if (adStartDateTime) {
      const currentAd = new Date(adStartDateTime);
      const newBooking = new Date(date);

      // Clear milliseconds for fair comparison
      currentAd.setMilliseconds(0);
      newBooking.setMilliseconds(0);

      if (newBooking <= currentAd) {
        message.error("Booking time must be AFTER Advertisement time");
        return; // Don't update - validation failed
      }
    }

    // Check if we need to reset event dates
    if (dateRange.startDate) {
      const bookingDate = dayjs(date).tz(timezone).startOf("day");
      const eventStart = dayjs(dateRange.startDate).tz(timezone).startOf("day");

      if (bookingDate.isSameOrAfter(eventStart)) {
        setDateRange({ startDate: null, endDate: null, isSelecting: false });
        setAllEvents([]);
        blockingChecked.current = false;

        dispatch(
          setScheduleFormData({
            ...scheduleFormData,
            booking_start_date_time: formatDateTime(date),
            start_date: null,
            end_date: null,
            show_dates: [],
            timeSlots: {},
          })
        );

        message.warning("Event dates reset - must be after new Booking time");
        setBookingStartDateTime(date);
        form?.setFieldValue("booking_start_date_time", date);
        return;
      }
    }

    // ✅ Validation passed, update state
    setBookingStartDateTime(date);
    form?.setFieldValue("booking_start_date_time", date);

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        booking_start_date_time: formatDateTime(date),
      })
    );

    message.success("Booking time updated successfully");
  };

  // ✅ UPDATED: Helper function to check excluded blocked dates
  const getExcludedBlockedDates = (startDate, endDate, blockedDatesSet) => {
    if (!blockedDatesSet || blockedDatesSet.size === 0) {
      return [];
    }

    const startDay = dayjs(startDate).tz(timezone).startOf("day");
    const endDay = dayjs(endDate).tz(timezone).startOf("day");
    const excluded = [];

    blockedDatesSet.forEach((dateStr) => {
      const blockedDay = dayjs(dateStr, "YYYY-MM-DD")
        .tz(timezone)
        .startOf("day");

      // If blocked date is outside the range, it's excluded
      if (
        blockedDay.isBefore(startDay, "day") ||
        blockedDay.isAfter(endDay, "day")
      ) {
        excluded.push(dateStr);
      }
    });

    return excluded;
  };

  // ✅ UPDATED: Main handler
  const handleDateRangeChange = (range) => {
    console.log("📍 handleDateRangeChange called with:", {
      rangeStart: range.startDate
        ? new Date(range.startDate).toISOString()
        : null,
      rangeEnd: range.endDate ? new Date(range.endDate).toISOString() : null,
      isSelecting: range.isSelecting,
    });

    // Check blocking first
    if (isScheduleBlocked) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    if (!range.startDate || !range.endDate) {
      if (range.isSelecting) {
        setDateRange(range);
        return;
      }

      // ✅ FIX: In edit mode with blocked dates, prevent clearing
      const blockedDatesSet = getBlockedDatesSet(
        scheduleFormData,
        blockingInfo,
        checkedscheduleDetails
      );

      if (mode === EDIT && blockedDatesSet && blockedDatesSet.size > 0) {
        message.error(
          "Cannot clear dates when there are active bookings. Please select new dates that include all booking dates."
        );
        return;
      }

      setDateRange({ startDate: null, endDate: null, isSelecting: false });
      setAllEvents([]);
      blockingChecked.current = false;

      dispatch(
        setScheduleFormData({
          ...scheduleFormData,
          start_date: null,
          end_date: null,
          show_dates: [],
          timeSlots: {},
        })
      );

      message.warning("Event dates cleared.");
      return;
    }

    // VALIDATION: event start > booking start date
    if (bookingStartDateTime) {
      const bookingDate = dayjs(bookingStartDateTime)
        .tz(timezone)
        .startOf("day");
      const eventStart = dayjs(range.startDate).tz(timezone).startOf("day");

      if (eventStart.isSameOrBefore(bookingDate)) {
        message.error("Event start date must be after Booking date");
        return;
      }
    }

    // VALIDATION: end > start
    if (range.startDate >= range.endDate) {
      message.error("Event end date must be after start date");
      return;
    }

    // ✅ NEW VALIDATION: Check if blocked dates are included
    const blockedDatesSet = getBlockedDatesSet(
      scheduleFormData,
      blockingInfo,
      checkedscheduleDetails
    );

    console.log("🔒 Blocked dates found:", blockedDatesSet?.size || 0);

    if (mode === EDIT && blockedDatesSet && blockedDatesSet.size > 0) {
      // Calculate min and max blocked dates
      const blockedDatesArray = Array.from(blockedDatesSet).map((dateStr) =>
        dayjs(dateStr, "YYYY-MM-DD").tz(timezone).startOf("day")
      );

      const minBlockedDate = blockedDatesArray.reduce((min, date) =>
        date.isBefore(min) ? date : min
      );

      const maxBlockedDate = blockedDatesArray.reduce((max, date) =>
        date.isAfter(max) ? date : max
      );

      const newStartDay = dayjs(range.startDate).tz(timezone).startOf("day");
      const newEndDay = dayjs(range.endDate).tz(timezone).startOf("day");

      console.log("📅 Blocked date boundaries:", {
        minBlocked: minBlockedDate.format("YYYY-MM-DD"),
        maxBlocked: maxBlockedDate.format("YYYY-MM-DD"),
        newStart: newStartDay.format("YYYY-MM-DD"),
        newEnd: newEndDay.format("YYYY-MM-DD"),
      });

      // ✅ FIX 1: Block if new start date is AFTER min blocked date
      if (newStartDay.isAfter(minBlockedDate, "day")) {
        console.log("❌ Start date is AFTER first booking - BLOCKING");
        Modal.error({
          title: (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "20px" }}>❌</span>
              <span>Invalid Start Date</span>
            </div>
          ),
          content: (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fef2f2",
                  border: "2px solid #fca5a5",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#991b1b",
                    marginBottom: "8px",
                  }}
                >
                  ⚠️ Start date cannot be AFTER the first booking date:
                </p>
                <p
                  style={{
                    color: "#dc2626",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  First booking: {minBlockedDate.format("YYYY-MM-DD")}
                </p>
              </div>
            </div>
          ),
          okText: "I Understand",
          centered: true,
          width: 520,
          maskClosable: false,
        });
        return;
      }

      // ✅ FIX 2: Block if new end date is BEFORE max blocked date
      if (newEndDay.isBefore(maxBlockedDate, "day")) {
        console.log("❌ End date is BEFORE last booking - BLOCKING");
        Modal.error({
          title: (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: "20px" }}>❌</span>
              <span>Invalid End Date</span>
            </div>
          ),
          content: (
            <div style={{ marginTop: "16px" }}>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#fef2f2",
                  border: "2px solid #fca5a5",
                  borderRadius: "8px",
                  marginBottom: "12px",
                }}
              >
                <p
                  style={{
                    fontWeight: "bold",
                    color: "#991b1b",
                    marginBottom: "8px",
                  }}
                >
                  ⚠️ End date cannot be BEFORE the last booking date:
                </p>
                <p
                  style={{
                    color: "#dc2626",
                    fontWeight: "bold",
                    fontSize: "14px",
                  }}
                >
                  Last booking: {maxBlockedDate.format("YYYY-MM-DD")}
                </p>
              </div>
            </div>
          ),
          okText: "I Understand",
          centered: true,
          width: 520,
          maskClosable: false,
        });
        return;
      }

      console.log("✅ All blocked dates are included - VALID");
    }

    // Validate against blocking info
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

    // Check if range changed and we have events
    const isDateRangeChanged =
      !dateRange.startDate ||
      !dateRange.endDate ||
      dateRange.startDate.getTime() !== range.startDate.getTime() ||
      dateRange.endDate.getTime() !== range.endDate.getTime();

    console.log("📊 Range check:", {
      oldRangeExists: !!(dateRange.startDate && dateRange.endDate),
      isDateRangeChanged,
      allEventsCount: allEvents.length,
      shouldCheckExtension: allEvents.length > 0 && isDateRangeChanged,
    });

    if (allEvents.length > 0 && isDateRangeChanged) {
      // ✅ FIX 3: Handle NULL dates on first edit
      if (!dateRange.startDate || !dateRange.endDate) {
        console.log("✅ First time setting dates - NO MODAL NEEDED");
        proceedWithDateRangeChange(range);
        return;
      }

      // ✅ FIX 4: Proper timezone-aware extension check
      const oldStartDay = dayjs(dateRange.startDate)
        .tz(timezone)
        .startOf("day");
      const oldEndDay = dayjs(dateRange.endDate).tz(timezone).startOf("day");
      const newStartDay = dayjs(range.startDate).tz(timezone).startOf("day");
      const newEndDay = dayjs(range.endDate).tz(timezone).startOf("day");

      console.log("🔄 Extension check details:", {
        oldStart: oldStartDay.format("YYYY-MM-DD"),
        oldEnd: oldEndDay.format("YYYY-MM-DD"),
        newStart: newStartDay.format("YYYY-MM-DD"),
        newEnd: newEndDay.format("YYYY-MM-DD"),
        newStartBeforeOrEqual_OldStart: newStartDay.isSameOrBefore(
          oldStartDay,
          "day"
        ),
        newEndAfterOrEqual_OldEnd: newEndDay.isSameOrAfter(oldEndDay, "day"),
      });

      // Check if new range CONTAINS old range (extension-only, no shrinking)
      const isExtensionOnly =
        newStartDay.isSameOrBefore(oldStartDay, "day") &&
        newEndDay.isSameOrAfter(oldEndDay, "day");

      console.log("🎯 Is Extension Only:", isExtensionOnly);

      if (!isExtensionOnly) {
        // Range modified (not just extension) - show confirmation modal
        console.log("⚠️ NOT AN EXTENSION - SHOWING RESET MODAL");
        setPendingDateChange({ type: "dateRange", range });
        setShowResetConfirmModal(true);
        return;
      }

      // ✅ It's a valid extension - proceed without modal
      console.log("✅ VALID EXTENSION - PROCEEDING WITHOUT MODAL");
    }

    // Apply changes
    console.log("✅ FINAL: Proceeding with date range change");
    proceedWithDateRangeChange(range);
  };

  // ✅ NEW: Handle blocked dates warning modal
  const handleBlockedDatesWarningOk = () => {
    // User clicked OK on the warning - show them the correct dates
    if (excludedBlockedDates.length > 0) {
      const minBlockedDate = excludedBlockedDates.sort()[0];
      const maxBlockedDate =
        excludedBlockedDates.sort()[excludedBlockedDates.length - 1];

      message.warning({
        content: (
          <div>
            <p style={{ marginBottom: "8px", fontWeight: "bold" }}>
              ℹ️ Please adjust your dates
            </p>
            <p>You can only exclude dates that don't have bookings.</p>
            <p
              style={{ color: "#dc2626", fontWeight: "bold", marginTop: "8px" }}
            >
              Your selection must include: {minBlockedDate} to {maxBlockedDate}
            </p>
          </div>
        ),
        duration: 0,
      });
    }

    setShowBlockedDatesWarningModal(false);
    setPendingBlockedDateChange(null);
    setExcludedBlockedDates([]);
  };

  const handleBlockedDatesWarningCancel = () => {
    setShowBlockedDatesWarningModal(false);
    setPendingBlockedDateChange(null);
    setExcludedBlockedDates([]);
  };

  // ✅ NEW: Render blocked dates warning modal
  const renderBlockedDatesWarningModal = () => {
    if (excludedBlockedDates.length === 0) return null;

    const sortedExcluded = excludedBlockedDates.sort();
    const minBlocked = sortedExcluded[0];
    const maxBlocked = sortedExcluded[sortedExcluded.length - 1];

    return (
      <Modal
        title={
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-red-600" />
            <span>Booked Dates Excluded</span>
          </div>
        }
        open={showBlockedDatesWarningModal}
        onOk={handleBlockedDatesWarningOk}
        onCancel={handleBlockedDatesWarningCancel}
        okText="Understood"
        cancelText="Cancel Selection"
        width={550}
        maskClosable={false}
      >
        <div className="space-y-4">
          {/* Error Box */}
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
            <p className="text-sm font-bold text-red-900 mb-2">
              ❌ Invalid Date Selection
            </p>
            <p className="text-sm text-red-800">
              Your selected date range does NOT include all booking dates.
            </p>
          </div>

          {/* Excluded dates box */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <p className="text-sm font-semibold text-yellow-900 mb-3">
              ⚠️ These booked dates are excluded:
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {excludedBlockedDates.sort().map((date) => (
                <span
                  key={date}
                  className="px-3 py-1 bg-red-200 text-red-900 font-semibold rounded-full text-sm"
                >
                  {date}
                </span>
              ))}
            </div>
            <p className="text-xs text-yellow-800">
              These dates have active bookings and cannot be excluded from your
              event date range.
            </p>
          </div>

          {/* Required range box */}
          <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ✓ Your selection MUST include:
            </p>
            <p className="text-sm text-blue-800 font-bold">
              From: <span className="text-base">{minBlocked}</span>
            </p>
            <p className="text-sm text-blue-800 font-bold">
              To: <span className="text-base">{maxBlocked}</span>
            </p>
          </div>

          {/* Instruction box */}
          <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
            <p className="text-sm font-semibold text-green-900 mb-2">
              📋 What to do:
            </p>
            <ul className="text-sm text-green-800 space-y-1">
              <li>
                ✓ Extend your start date to{" "}
                <strong>ON or BEFORE {minBlocked}</strong>
              </li>
              <li>
                ✓ Extend your end date to{" "}
                <strong>ON or AFTER {maxBlocked}</strong>
              </li>
              <li>✓ You can add dates before or after the booking dates</li>
              <li>✓ You CANNOT exclude booking dates</li>
            </ul>
          </div>

          {/* Current selection info */}
          {pendingBlockedDateChange?.range && (
            <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Your Current Selection:
              </p>
              <p className="text-xs text-gray-600">
                <strong>Start:</strong>{" "}
                {dayjs(pendingBlockedDateChange.range.startDate).format(
                  "YYYY-MM-DD"
                )}
                <br />
                <strong>End:</strong>{" "}
                {dayjs(pendingBlockedDateChange.range.endDate).format(
                  "YYYY-MM-DD"
                )}
              </p>
            </div>
          )}
        </div>
      </Modal>
    );
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

    message.success("Event dates updated successfully");
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

  // Replace the getAllDaysInRange function in CalendarViewCard.jsx

  const getAllDaysInRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      return [];
    }

    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);

    // Set to start of day to avoid time zone issues
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate days difference (inclusive)
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    console.log("📅 getAllDaysInRange:", {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString(),
      daysDiff,
      expectedDays: daysDiff,
    });

    // Generate array of dates
    return Array.from({ length: daysDiff }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };
  const hasValidTimeSlots = () => {
    if (!allEvents || allEvents.length === 0) {
      return false;
    }

    // Check if all events have required fields
    return allEvents.every(
      (event) => event.ticketType || event.ticket_set || event.seat_structure_id
    );
  };
  const handleSubmit = () => {
    console.log("🔍 Submit Validation:", {
      allEventsCount: allEvents.length,
      scheduleFormDataShowDates: scheduleFormData?.show_dates?.length,
      adStartDateTime: !!adStartDateTime,
      bookingStartDateTime: !!bookingStartDateTime,
      dateRange: !!(dateRange.startDate && dateRange.endDate),
    });

    // Validate required dates
    if (!isAllDatesValid()) {
      // message.error(
      //   "Please fill in all required dates and configure at least one time slot"
      // );
      return;
    }

    // ✅ Try to get show_dates from Redux first
    let showDates = scheduleFormData?.show_dates || scheduleFormData?.showdates;

    // ✅ If not in Redux, generate from allEvents
    if (!showDates || showDates.length === 0) {
      console.log("⚠️ No show_dates in Redux, generating from allEvents...");
      showDates = generateShowDatesFromEvents(allEvents, dateRange);
    }

    if (!showDates || showDates.length === 0) {
      message.error(
        "No time slots configured. Please add at least one time slot."
      );
      console.error("❌ Failed to get or generate show_dates:", {
        reduxShowDates: scheduleFormData?.show_dates,
        allEvents,
        dateRange,
      });
      return;
    }

    // ✅ Validate that all time slots have proper configuration
    const invalidSlots = showDates.filter(
      (sd) =>
        !sd.show_times ||
        sd.show_times.length === 0 ||
        sd.show_times.some(
          (st) =>
            !st.ticket_structure_id && !st.seat_structure_id && !st.ticket_set
        )
    );

    if (invalidSlots.length > 0) {
      message.error("Some time slots are missing ticket/seat configuration");
      console.error("❌ Invalid time slots:", invalidSlots);
      return;
    }

    // ✅ Prepare the complete form data to pass to parent
    const formData = {
      start_date: formatDateForAPI(dateRange.startDate),
      end_date: formatDateForAPI(dateRange.endDate),
      ad_start_date_time: formatDateTimeForAPI(adStartDateTime),
      booking_start_date_time: formatDateTimeForAPI(bookingStartDateTime),
      show_dates: showDates,
      timezone: timezone,
    };

    console.log("✅ Submitting validated data to parent:", {
      show_dates_count: showDates.length,
      formData,
    });

    // ✅ Call parent's onSubmit handler (handleTimeSlotSubmit from ScheduleDetails)
    if (onSubmit) {
      onSubmit(formData);
    } else {
      message.error("Submit handler not found");
    }
  };

  const generateShowDatesFromEvents = (events, currentDateRange) => {
    console.log("📅 generateShowDatesFromEvents called:", {
      eventsCount: events?.length,
      hasDateRange: !!(
        currentDateRange?.startDate && currentDateRange?.endDate
      ),
      availableTypes: scheduleFormData?.available_types,
    });

    if (!events || events.length === 0) {
      console.warn("⚠️ No events to generate show_dates");
      return [];
    }

    if (!currentDateRange.startDate || !currentDateRange.endDate) {
      console.warn("⚠️ Invalid date range");
      return [];
    }

    const allDaysInRange = getAllDaysInRange();
    const eventsByDate = {};
    const isSeatBased = scheduleFormData?.available_types === "seat_structure";

    console.log(
      `🔄 Processing ${events.length} events (${
        isSeatBased ? "SEAT" : "TICKET"
      } based)`
    );

    events.forEach((event, index) => {
      if (!event.startTime || !event.endTime) {
        console.warn(`⚠️ Event ${index} missing time data:`, event);
        return;
      }

      // ✅ Validate configuration based on booking type
      let hasValidConfig = false;

      if (isSeatBased) {
        hasValidConfig = !!(event.seat_structure_id || event.seatstructureid);
        if (!hasValidConfig) {
          console.warn(
            `⚠️ Seat-based event ${index} missing seat_structure_id:`,
            event
          );
          return;
        }
      } else {
        const hasTicketStructure = !!(
          event.ticket_structure_id ||
          event.ticketstructureid ||
          event.ticketType
        );
        const hasTicketSet = !!(event.ticket_set || event.ticketset);
        hasValidConfig = hasTicketStructure || hasTicketSet;

        if (!hasValidConfig) {
          console.warn(
            `⚠️ Ticket-based event ${index} missing ticket config:`,
            event
          );
          return;
        }
      }

      const startDay = event.startTime.day;
      const isMidnight =
        event.is_midnight_passed || event.ismidnightpassed || false;
      const endDay = isMidnight ? startDay : event.endTime.day;

      for (let day = startDay; day <= endDay; day++) {
        if (allDaysInRange[day]) {
          const dateStr = formatDateForAPI(allDaysInRange[day]);

          if (!eventsByDate[dateStr]) {
            eventsByDate[dateStr] = {
              show_date_id: event.show_date_id || event.showdateid,
              show_times: [],
            };
          }

          const startHour = String(event.startTime.hour).padStart(2, "0");
          const startMinute = String(event.startTime.minute || 0).padStart(
            2,
            "0"
          );
          const endHour = String(event.endTime.hour).padStart(2, "0");
          const endMinute = String(event.endTime.minute || 0).padStart(2, "0");

          const showTime = {
            show_time_id: event.show_time_id || event.showtimeid || event.id,
            start_time: `${startHour}:${startMinute}`,
            end_time: `${endHour}:${endMinute}`,
            is_midnight: isMidnight ? "true" : "false",
            offer_ids: event.offer_ids || event.offerids || [],
            coupon_ids: event.coupon_ids || event.couponids || [],
          };

          // ✅ Add fields based on booking type
          if (isSeatBased) {
            showTime.seat_structure_id =
              event.seat_structure_id || event.seatstructureid;
            showTime.ticket_structure_id = null;
            showTime.ticket_set = null;
          } else {
            showTime.ticket_structure_id =
              event.ticket_structure_id ||
              event.ticketstructureid ||
              event.ticketType;
            showTime.ticket_set = event.ticket_set || event.ticketset;
            showTime.seat_structure_id =
              event.seat_structure_id || event.seatstructureid || null;
          }

          eventsByDate[dateStr].show_times.push(showTime);

          console.log(
            `✅ Added ${
              isSeatBased ? "seat" : "ticket"
            }-based show_time for ${dateStr}:`,
            showTime
          );
        }
      }
    });

    const showDates = Object.entries(eventsByDate).map(
      ([dateStr, dateData]) => {
        let endDate = null;
        const hasMidnight = dateData.show_times.some(
          (st) => st.is_midnight === "true"
        );

        if (hasMidnight) {
          const startDate = new Date(dateStr);
          const nextDay = new Date(startDate);
          nextDay.setDate(startDate.getDate() + 1);
          endDate = formatDateForAPI(nextDay);
        }

        return {
          show_date_id: dateData.show_date_id,
          start_date: dateStr,
          end_date: endDate,
          show_times: dateData.show_times,
          offer_ids: [],
          coupon_ids: [],
        };
      }
    );

    showDates.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    console.log(
      `✅ Generated ${showDates.length} ${
        isSeatBased ? "seat" : "ticket"
      }-based show_dates:`,
      showDates
    );

    return showDates;
  };

  const getColorForDay = (dayIndex) => {
    return timeSlotColors[dayIndex % timeSlotColors.length];
  };

  const handleEventSave = (eventData) => {
    if (blockingInfo?.isScheduleEditableStatus) {
      message.error("Cannot modify: Schedule is locked due to active bookings");
      return;
    }

    console.log("💾 Saving event:", eventData);

    // Validation
    if (!eventData.startTime || !eventData.endTime) {
      message.error("Please select valid start and end times");
      return;
    }

    // Check for ticket/seat configuration
    const hasTicketStructure =
      eventData.ticket_structure_id ||
      eventData.ticketstructureid ||
      eventData.ticketType;

    const hasSeatStructure =
      eventData.seat_structure_id || eventData.seatstructureid;

    const hasTicketSet = eventData.ticket_set || eventData.ticketset;

    if (!hasTicketStructure && !hasSeatStructure && !hasTicketSet) {
      message.error(
        "Please select ticket structure, ticket set, or seat structure"
      );
      return;
    }

    if (eventData.id && eventData.id.startsWith("temp-")) {
      // Creating new event
      const eventDayIndex = eventData.startTime.day + currentWeekStart;
      const colorClass = getColorForDay(eventDayIndex);

      const newEvent = {
        ...eventData,
        id: `event-${Date.now()}`,
        color: colorClass,
        timezone: timezone,
        // ✅ Normalize all field names (store both variations)
        ticket_structure_id: hasTicketStructure || null,
        ticketstructureid: hasTicketStructure || null,
        ticketType: hasTicketStructure || null,
        ticket_set: hasTicketSet || null,
        ticketset: hasTicketSet || null,
        seat_structure_id: hasSeatStructure || null,
        seatstructureid: hasSeatStructure || null,
        is_midnight_passed:
          eventData.is_midnight_passed || eventData.ismidnightpassed || false,
        ismidnightpassed:
          eventData.is_midnight_passed || eventData.ismidnightpassed || false,
        offer_ids: eventData.offer_ids || eventData.offerids || [],
        offerids: eventData.offer_ids || eventData.offerids || [],
        coupon_ids: eventData.coupon_ids || eventData.couponids || [],
        couponids: eventData.coupon_ids || eventData.couponids || [],
        startTime: {
          ...eventData.startTime,
          day: eventDayIndex,
        },
        endTime: {
          ...eventData.endTime,
          day:
            eventData.is_midnight_passed || eventData.ismidnightpassed
              ? eventDayIndex
              : eventData.endTime.day + currentWeekStart,
        },
      };

      console.log("✅ Created new event:", newEvent);

      setAllEvents((prev) => {
        const updated = [...prev, newEvent];

        // Generate and save show_dates
        const showDates = generateShowDatesFromEvents(updated, dateRange);

        dispatch(
          setScheduleFormData({
            show_dates: showDates,
            timezone: timezone,
          })
        );

        return updated;
      });

      message.success("Time slot created successfully!");
    } else {
      // Updating existing event
      setAllEvents((prev) => {
        const updated = prev.map((e) => {
          if (e.id === eventData.id) {
            return {
              ...e,
              ...eventData,
              // ✅ Normalize field names
              ticket_structure_id: hasTicketStructure || null,
              ticketstructureid: hasTicketStructure || null,
              ticket_set: hasTicketSet || null,
              ticketset: hasTicketSet || null,
              seat_structure_id: hasSeatStructure || null,
              seatstructureid: hasSeatStructure || null,
            };
          }
          return e;
        });

        // Generate and save show_dates
        const showDates = generateShowDatesFromEvents(updated, dateRange);

        dispatch(
          setScheduleFormData({
            show_dates: showDates,
            timezone: timezone,
          })
        );

        return updated;
      });

      message.success("Time slot updated successfully!");
    }

    setModalOpen(false);
    setSelectedEvent(null);
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

    console.log("🔍 getVisibleEvents called:", {
      totalEvents: allEvents.length,
      visibleDaysCount: visibleDays.length,
      currentWeekStart,
    });

    const visibleEvents = allEvents.filter((event) => {
      if (!event.startTime || !event.endTime) {
        console.warn("❌ Event missing time data:", event);
        return false;
      }

      const eventStartDay = event.startTime.day;
      const eventEndDay = event.endTime.day;
      const weekStart = currentWeekStart;
      const weekEnd = currentWeekStart + visibleDays.length - 1;

      const isVisible = !(eventEndDay < weekStart || eventStartDay > weekEnd);

      if (isVisible) {
        // console.log("✅ Event is visible:", {
        //   id: event.id,
        //   eventStartDay,
        //   eventEndDay,
        //   weekRange: `${weekStart}-${weekEnd}`,
        // });
      }

      return isVisible;
    });

    // console.log(
    //   `📊 Returning ${visibleEvents.length} visible events out of ${allEvents.length} total`
    // );

    return visibleEvents.map((event) => {
      // ✅ NORMALIZE the event before passing to TimeSelector
      const normalized = {
        ...event,
        // Normalize midnight field as BOOLEAN
        is_midnight_passed:
          event.is_midnight_passed === true ||
          event.ismidnightpassed === true ||
          event.ismidnight === true,
        ismidnightpassed:
          event.is_midnight_passed === true ||
          event.ismidnightpassed === true ||
          event.ismidnight === true,
        ismidnight:
          event.is_midnight_passed === true ||
          event.ismidnightpassed === true ||
          event.ismidnight === true,
        // Adjust day indices for current week view
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
      };

      // console.log("✅ Normalized event for TimeSelector:", {
      //   id: normalized.id,
      //   adjustedStartDay: normalized.startTime.day,
      //   adjustedEndDay: normalized.endTime.day,
      //   is_midnight: normalized.is_midnight_passed,
      // });

      return normalized;
    });
  };

  const getEventMinDate = () => {
    if (bookingStartDateTime) {
      const minDate = new Date(bookingStartDateTime);
      minDate.setDate(minDate.getDate() + 1);
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }
    return null;
  };

  // ==================== COMPUTED VALUES ====================
  const allDaysInRange = getAllDaysInRange();
  const visibleDays = getVisibleDays();
  const totalDays = allDaysInRange.length;
  const canNavigateNext = currentWeekStart + 7 < totalDays;
  const canNavigatePrev = currentWeekStart > 0;
  const hasValidDateRange = dateRange.startDate && dateRange.endDate;
  // ✅ ADD THIS - Define blockedDatesSet variable BEFORE JSX
  const blockedDatesSet = getBlockedDatesSet(
    scheduleFormData,
    blockingInfo,
    checkedscheduleDetails
  );

  // ==================== RENDER ====================
  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* HEADER SECTION */}
      <div className="mb-6">
        {/* Schedule Blocked Warning */}
        {isScheduleBlocked && (
          <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center space-x-2">
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
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT SIDEBAR */}
        <div className="col-span-3 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              {/* In CalendarViewCard render section */}
              <CompactDateTimePicker
                label="Advertisement Start Time"
                value={adStartDateTime}
                onDateTimeChange={handleAdStartTimeChange}
                timezone={timezone}
                disablePastDates={true}
                disablePastTimes={true}
                maxDateTime={bookingStartDateTime}
                disabled={isScheduleBlocked}
                blockedDates={getBlockedDatesSet(
                  scheduleFormData,
                  blockingInfo,
                  checkedscheduleDetails
                )}
                isScheduleBlocked={isScheduleBlocked}
                isEditMode={mode === EDIT} // ✅ ADD THIS
                originalDateTime={scheduleFormData?.ad_start_date_time} // ✅ ADD THIS
              />
            </div>

            <div className="space-y-2">
              <CompactDateTimePicker
                label="Booking Start Time"
                value={bookingStartDateTime}
                onDateTimeChange={handleBookingStartTimeChange}
                timezone={timezone}
                minDateTime={adStartDateTime}
                disablePastDates={true}
                minDate={adStartDateTime}
                disablePastTimes={true}
                disabled={!adStartDateTime || isScheduleBlocked}
                blockedDates={getBlockedDatesSet(
                  scheduleFormData,
                  blockingInfo,
                  checkedscheduleDetails
                )}
                isScheduleBlocked={isScheduleBlocked}
                isEditMode={mode === EDIT} // ✅ ADD THIS
                originalDateTime={scheduleFormData?.booking_start_date_time} // ✅ ADD THIS
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Dates *
            </label>
            <div
              className={
                !bookingStartDateTime || isScheduleBlocked
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            >
              <CalendarWidget
                onDateRangeChange={handleDateRangeChange}
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
                minDate={getEventMinDate()}
                blockedDates={blockedDatesSet} // ✅ NOW USES DEFINED VARIABLE
                isScheduleBlocked={isScheduleBlocked}
                isEditMode={true}
                timezone={timezone}
              />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="col-span-9">
          {hasValidDateRange ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() =>
                      setCurrentWeekStart(Math.max(0, currentWeekStart - 7))
                    }
                    disabled={!canNavigatePrev}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentWeekStart(
                        Math.min(currentWeekStart + 7, totalDays - 7)
                      )
                    }
                    disabled={!canNavigateNext}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </Button>
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
                  <Button onClick={onBack} type="default">
                    <span>Go Back</span>
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    type="primary"
                    // disabled={!isAllDatesValid() || isScheduleBlocked}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    // loading={loading}
                  >
                    <Plus size={16} />
                    <span>
                      {allEvents.length > 0
                        ? `Save Schedule (${allEvents.length} time slots)`
                        : "Save Schedule"}
                    </span>
                  </Button>
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
                  // ADD THIS PROP:
                  onEventDelete={handleEventDelete}
                  onApplyToAll={(templateEvent) => {
                    if (isScheduleBlocked) {
                      message.error("Cannot add slots: Schedule is locked");
                      return;
                    }

                    console.log(
                      "🔄 Apply to All triggered with template:",
                      templateEvent
                    );

                    const newEvents = [];
                    let skippedDays = 0;
                    const allDaysInRange = getAllDaysInRange();

                    // ✅ ADD THIS VALIDATION
                    console.log("📊 Applying to days:", {
                      totalDays: allDaysInRange.length,
                      dateRange: {
                        start: dateRange.startDate?.toISOString(),
                        end: dateRange.endDate?.toISOString(),
                      },
                    });

                    allDaysInRange.forEach((currentDay, dayIndex) => {
                      // ✅ ADD THIS CHECK - Skip if day is after end date
                      if (currentDay > dateRange.endDate) {
                        console.warn(
                          `⚠️ Skipping day ${dayIndex} - after end date:`,
                          currentDay
                        );
                        return;
                      }

                      // Create the event for this day
                      const potentialEvent = {
                        startTime: {
                          hour: templateEvent.startTime.hour,
                          minute: templateEvent.startTime.minute || 0,
                          day: dayIndex,
                        },
                        endTime: {
                          hour: templateEvent.endTime.hour,
                          minute: templateEvent.endTime.minute || 0,
                          day:
                            templateEvent.ismidnightpassed ||
                            templateEvent.is_midnight_passed
                              ? dayIndex + 1
                              : dayIndex,
                        },
                      };

                      // Check for conflicts
                      const hasConflict = allEvents.some((event) => {
                        return ScheduleUtil.isTimeOverlapping(
                          event,
                          potentialEvent
                        );
                      });

                      if (!hasConflict) {
                        const colorClass = getColorForDay(dayIndex);

                        // ✅ Create complete event with ALL fields from template
                        const newEvent = {
                          id: `applied-${Date.now()}-${dayIndex}-${Math.random()
                            .toString(36)
                            .substr(2, 9)}`,
                          startTime: potentialEvent.startTime,
                          endTime: potentialEvent.endTime,
                          color: colorClass,
                          timezone: timezone,

                          // ✅ Copy ALL ticket/seat fields (handle both field name variations)
                          ticketType:
                            templateEvent.ticketType ||
                            templateEvent.ticket_structure_id ||
                            templateEvent.ticketstructureid,
                          ticket_structure_id:
                            templateEvent.ticket_structure_id ||
                            templateEvent.ticketstructureid ||
                            templateEvent.ticketType,
                          ticketstructureid:
                            templateEvent.ticket_structure_id ||
                            templateEvent.ticketstructureid ||
                            templateEvent.ticketType,

                          ticket_set:
                            templateEvent.ticket_set || templateEvent.ticketset,
                          ticketset:
                            templateEvent.ticket_set || templateEvent.ticketset,

                          seat_structure_id:
                            templateEvent.seat_structure_id ||
                            templateEvent.seatstructureid,
                          seatstructureid:
                            templateEvent.seat_structure_id ||
                            templateEvent.seatstructureid,

                          // ✅ Copy midnight flag
                          is_midnight_passed:
                            templateEvent.is_midnight_passed ||
                            templateEvent.ismidnightpassed ||
                            false,
                          ismidnightpassed:
                            templateEvent.is_midnight_passed ||
                            templateEvent.ismidnightpassed ||
                            false,

                          // ✅ Copy end date if midnight
                          show_end_date:
                            templateEvent.show_end_date ||
                            templateEvent.showenddate ||
                            null,
                          showenddate:
                            templateEvent.show_end_date ||
                            templateEvent.showenddate ||
                            null,

                          // ✅ Copy offer and coupon IDs
                          offer_ids:
                            templateEvent.offer_ids ||
                            templateEvent.offerids ||
                            [],
                          offerids:
                            templateEvent.offer_ids ||
                            templateEvent.offerids ||
                            [],
                          coupon_ids:
                            templateEvent.coupon_ids ||
                            templateEvent.couponids ||
                            [],
                          couponids:
                            templateEvent.coupon_ids ||
                            templateEvent.couponids ||
                            [],
                        };

                        console.log(
                          `✅ Created event for day ${dayIndex}:`,
                          newEvent
                        );
                        newEvents.push(newEvent);
                      } else {
                        skippedDays++;
                      }
                    });

                    if (newEvents.length > 0) {
                      // ✅ Update state and IMMEDIATELY save to Redux
                      setAllEvents((prev) => {
                        const updated = [...prev, ...newEvents];

                        console.log(
                          `💾 Saving ${updated.length} events to Redux (${newEvents.length} new)`
                        );

                        // ✅ Generate show_dates IMMEDIATELY
                        const showDates = generateShowDatesFromEvents(
                          updated,
                          dateRange
                        );

                        console.log("📊 Generated show_dates:", {
                          totalEvents: updated.length,
                          showDatesCount: showDates.length,
                          showDates,
                        });

                        // ✅ CRITICAL: Force immediate Redux save (don't rely on useEffect)
                        const formDataToSave = {
                          ...scheduleFormData,
                          show_dates: showDates,
                          timezone: timezone,
                        };

                        dispatch(setScheduleFormData(formDataToSave));

                        console.log("✅ Redux updated with show_dates");

                        return updated;
                      });

                      if (skippedDays > 0) {
                        message.success(
                          `Successfully applied time slot to ${newEvents.length} days! (${skippedDays} days skipped due to conflicts)`
                        );
                      } else {
                        message.success(
                          `Successfully applied time slot to all ${newEvents.length} days!`
                        );
                      }
                    } else {
                      message.error(
                        "Could not apply time slot due to conflicts on all days."
                      );
                    }
                  }}
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
      {renderBlockedDatesWarningModal()}
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
