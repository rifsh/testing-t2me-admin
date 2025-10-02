import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setScheduleFormData } from "store/slices/scheduleSlice";

import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";
import { getDaysDiff, ScheduleUtil } from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
import TimeSlotsSidebar from "./TimeSlotsSidebar";

// FIXED: Helper function to format date for API
const formatDateForAPI = (date) => {
  if (!date) return null;
  if (typeof date === "string") {
    // If it's already a string, ensure it's in YYYY-MM-DD format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return date; // Return as-is if invalid
    return dateObj.toISOString().split("T")[0];
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

const CalendarViewCard = ({ form, onSubmit, onBack }) => {
  const dispatch = useDispatch();
  const { eventDetails } = useSelector((state) => state.event || {});
  const { scheduleFormData } = useSelector((state) => state.schedules);

  // ==================== REFS ====================
  const lastSavedData = useRef(null);
  const saveTimeout = useRef(null);
  const scrollContainerRef = useRef(null);

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

  const [adStartDateTime, setAdStartDateTime] = useState(
    scheduleFormData?.ad_start_date_time
      ? new Date(scheduleFormData.ad_start_date_time)
      : defaults.adStartTime
  );

  const [bookingStartDateTime, setBookingStartDateTime] = useState(
    scheduleFormData?.booking_start_date_time
      ? new Date(scheduleFormData.booking_start_date_time)
      : defaults.bookingStartTime
  );

  const [dateRange, setDateRange] = useState({
    startDate: scheduleFormData?.start_date
      ? new Date(scheduleFormData.start_date)
      : defaults.eventStartDate,
    endDate: scheduleFormData?.end_date
      ? new Date(scheduleFormData.end_date)
      : defaults.eventEndDate,
    isSelecting: false,
  });

  const [allEvents, setAllEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);

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

    // Rule 1: Ad date must be before booking date
    if (adStartDateTime >= bookingStartDateTime) {
      return false;
    }

    // Rule 2: Event dates must be AFTER booking date
    const bookingDate = new Date(bookingStartDateTime);
    bookingDate.setHours(23, 59, 59, 999);

    const eventStart = new Date(dateRange.startDate);
    eventStart.setHours(0, 0, 0, 0);

    if (eventStart <= bookingDate) {
      return false;
    }

    // FIXED: Must have at least one time slot
    if (!allEvents || allEvents.length === 0) {
      return false;
    }

    return true;
  };

  // ==================== RESET FUNCTIONS ====================
  const resetToDefaults = () => {
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
      })
    );
  };

  // ==================== EVENT HANDLERS ====================
  const handleAdStartTimeChange = (date) => {
    if (!date) {
      // FIXED: Reset to defaults instead of nulls
      resetToDefaults();
      message.warning(
        "Advertisement date cleared. All dates have been reset to defaults."
      );
      return;
    }

    setAdStartDateTime(date);
    form?.setFieldValue("ad_start_date_time", date);

    // Auto-reset if invalid
    if (bookingStartDateTime && date >= bookingStartDateTime) {
      const newDefaults = getDefaultDates();
      setBookingStartDateTime(newDefaults.bookingStartTime);
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
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
    if (!date) {
      // FIXED: Reset booking and event dates to defaults
      const newDefaults = getDefaultDates();
      setBookingStartDateTime(newDefaults.bookingStartTime);
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
      form?.setFieldValue(
        "booking_start_date_time",
        newDefaults.bookingStartTime
      );

      message.warning(
        "Booking date cleared. Booking and event dates have been reset to defaults."
      );
      return;
    }

    setBookingStartDateTime(date);
    form?.setFieldValue("booking_start_date_time", date);

    // Auto-reset if event dates are invalid
    if (dateRange.startDate) {
      const bookingDate = new Date(date);
      bookingDate.setHours(23, 59, 59, 999);

      const eventStart = new Date(dateRange.startDate);
      eventStart.setHours(0, 0, 0, 0);

      if (eventStart <= bookingDate) {
        const newDefaults = getDefaultDates();
        setDateRange({
          startDate: newDefaults.eventStartDate,
          endDate: newDefaults.eventEndDate,
          isSelecting: false,
        });
        setAllEvents([]);
        message.warning(
          "Event dates have been reset because they must be after the booking date."
        );
      }
    }

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        booking_start_date_time: formatDateTime(date),
      })
    );
  };

  // FIXED: Enhanced date range change with proper validation
  const handleDateRangeChange = (range) => {
    if (!range.startDate || !range.endDate) {
      // FIXED: Reset to defaults instead of nulls
      const newDefaults = getDefaultDates();
      setDateRange({
        startDate: newDefaults.eventStartDate,
        endDate: newDefaults.eventEndDate,
        isSelecting: false,
      });
      setAllEvents([]);
      message.warning(
        "Event dates cleared. Dates have been reset to defaults."
      );
      return;
    }

    // FIXED: Validate that event dates are after booking date
    if (bookingStartDateTime) {
      const bookingDate = new Date(bookingStartDateTime);
      bookingDate.setHours(23, 59, 59, 999);

      const eventStart = new Date(range.startDate);
      eventStart.setHours(0, 0, 0, 0);

      if (eventStart <= bookingDate) {
        message.error(
          "Event start date must be after the booking date. Please select a later date."
        );
        return; // Don't update the range
      }
    }

    // FIXED: Validate that start date is before end date
    if (range.startDate >= range.endDate) {
      message.error(
        "End date must be after start date. Please select a valid date range."
      );
      return; // Don't update the range
    }

    const hasExistingTimeSlots = allEvents && allEvents.length > 0;

    if (hasExistingTimeSlots) {
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

    dispatch(
      setScheduleFormData({
        ...scheduleFormData,
        start_date: formatDateForAPI(range.startDate),
        end_date: formatDateForAPI(range.endDate),
        show_dates: [],
      })
    );

    message.success("Event dates updated successfully.");
  };

  // ==================== UTILITY FUNCTIONS ====================
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

  // FIXED: Enhanced show dates generation with CORRECT midnight handling
  const generateShowDatesFromEvents = (events, currentDateRange) => {
    if (
      !events ||
      events.length === 0 ||
      !currentDateRange.startDate ||
      !currentDateRange.endDate
    ) {
      return [];
    }

    console.log("🌙 GENERATING show dates with timezone:", timezone);

    const allDaysInRange = getAllDaysInRange();
    const eventsByDate = {};

    events.forEach((event) => {
      if (!event.startTime || !event.endTime) return;

      const startDay = event.startTime.day;
      let endDay = event.endTime.day;

      if (event.is_midnight_passed) {
        endDay = startDay; // Keep on same day but mark as midnight
      }

      for (let day = startDay; day <= endDay; day++) {
        if (allDaysInRange[day]) {
          const dateStr = formatDateForAPI(allDaysInRange[day]);

          if (!eventsByDate[dateStr]) {
            eventsByDate[dateStr] = [];
          }

          eventsByDate[dateStr].push({
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
            ticket_structure_id: event.ticket_structure_id || 11,
            ticket_set: event.ticket_set || "GOLD A1",
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

    // FIXED: Convert to proper show_dates format with CORRECTED midnight handling
    const showDates = Object.entries(eventsByDate).map(
      ([dateStr, showTimes]) => {
        let endDate = null;

        // FIXED: For midnight events, end_date must be DIFFERENT from start_date
        const hasMidnightEvent = showTimes.some(
          (st) => st.is_midnight === "true"
        );

        if (hasMidnightEvent) {
          const midnightEvent = showTimes.find(
            (st) => st.is_midnight === "true"
          );

          if (midnightEvent && midnightEvent.show_end_date) {
            // Use the specified show_end_date
            endDate = midnightEvent.show_end_date;
          } else {
            // FIXED: MUST be next day for midnight events - API requirement
            const startDate = new Date(dateStr);
            const nextDay = new Date(startDate);
            nextDay.setDate(startDate.getDate() + 1);
            endDate = formatDateForAPI(nextDay);
          }

          // CRITICAL FIX: Ensure end_date is NEVER same as start_date for midnight events
          if (endDate === dateStr) {
            const startDate = new Date(dateStr);
            const nextDay = new Date(startDate);
            nextDay.setDate(startDate.getDate() + 1);
            endDate = formatDateForAPI(nextDay);

            console.log("🚨 FIXED midnight end_date:", {
              startDate: dateStr,
              correctedEndDate: endDate,
            });
          }
        }

        return {
          start_date: dateStr,
          end_date: endDate, // FIXED: Will be null for regular events, NEXT DAY for midnight events
          show_times: showTimes,
          timezone: timezone,
        };
      }
    );

    showDates.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

    // FIXED: Log final show_dates for debugging
    console.log("📊 FINAL SHOW_DATES:", JSON.stringify(showDates, null, 2));

    return showDates;
  };

  // FIXED: Enhanced create event with API error handling
  const handleCreateEvent = async () => {
    try {
      // FIXED: Validate time slots exist
      if (!allEvents || allEvents.length === 0) {
        message.error(
          "Please add at least one time slot before saving the schedule."
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

      // FIXED: Call onSubmit and handle potential API errors
      const result = await onSubmit(finalData);

      // If we get here, submission was successful
      message.success("Schedule saved successfully!");
    } catch (error) {
      console.error("❌ SCHEDULE SUBMISSION ERROR:", error);

      // FIXED: Handle specific API error format
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
    if (eventData.id && eventData.id.startsWith("temp-")) {
      // CREATE NEW EVENT
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
      // UPDATE EXISTING EVENT
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

  // FIXED: Event dates must be AFTER booking date (not same day)
  const getEventMinDate = () => {
    if (bookingStartDateTime) {
      const minDate = new Date(bookingStartDateTime);
      minDate.setDate(minDate.getDate() + 1);
      minDate.setHours(0, 0, 0, 0);
      return minDate;
    }
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  };

  // ==================== COMPUTED VALUES ====================
  const allDaysInRange = getAllDaysInRange();
  const visibleDays = getVisibleDays();
  const totalDays = allDaysInRange.length;
  const canNavigateNext = currentWeekStart + 7 < totalDays;
  const canNavigatePrev = currentWeekStart > 0;
  const hasValidDateRange = dateRange.startDate && dateRange.endDate;

  const isAdDateDisabled = false;
  const isBookingDateDisabled = !adStartDateTime;
  const isEventDateDisabled = !bookingStartDateTime || !adStartDateTime;

  // ==================== RENDER ====================
  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* HEADER SECTION */}
      <div className="mb-6">
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
            </div>
          </div>
        </div>

        {/* FIXED: Show validation messages */}
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
                disabled={isAdDateDisabled}
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
                disabled={isBookingDateDisabled}
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
                minDate={getEventMinDate()}
                disabled={isEventDateDisabled}
              />
            </div>
          </div>

          {hasValidDateRange && (
            <TimeSlotsSidebar
              allEvents={allEvents}
              onEventClick={(eventData, clickEvent) => {
                const clickPosition = {
                  x: clickEvent?.clientX || 0,
                  y: clickEvent?.clientY || 0,
                };
                setSelectedEvent({ ...eventData, clickPosition });
                setModalOpen(true);
              }}
              onEventDelete={(eventId) => {
                setAllEvents((prevEvents) => {
                  const updated = prevEvents.filter((e) => e.id !== eventId);
                  debouncedSave({
                    ...scheduleFormData,
                    show_dates: generateShowDatesFromEvents(updated, dateRange),
                  });
                  return updated;
                });
                message.success("Time slot deleted successfully!");
              }}
              onEventUpdate={(event) => {
                setSelectedEvent(event);
                setModalOpen(true);
              }}
              onApplyToAll={(templateEvent) => {
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
                  {/* FIXED: Enhanced save button with better validation */}
                  <button
                    onClick={handleCreateEvent}
                    className={`px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2 ${
                      isAllDatesValid()
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-gray-300 cursor-not-allowed text-gray-500"
                    }`}
                    disabled={!isAllDatesValid()}
                    title={
                      !isAllDatesValid()
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
                    setSelectedEvent(timeSlot);
                    setModalOpen(true);
                  }}
                  events={getVisibleEvents()}
                  onEventClick={(eventData, clickEvent) => {
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
        onDelete={(eventId) => {
          setAllEvents((prevEvents) => {
            const updated = prevEvents.filter((e) => e.id !== eventId);
            debouncedSave({
              ...scheduleFormData,
              show_dates: generateShowDatesFromEvents(updated, dateRange),
              timezone: timezone,
            });
            return updated;
          });
          message.success("Time slot deleted successfully!");
        }}
        allDays={allDaysInRange}
        existingEvents={allEvents}
        form={form}
        eventDateRange={dateRange}
        timezone={timezone}
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
