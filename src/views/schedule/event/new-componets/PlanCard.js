import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { Modal, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { setScheduleFormData } from "store/slices/scheduleSlice";

import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";

import { getDaysDiff, getTypeColor, ScheduleUtil } from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
import TimeSlotsSidebar from "./TimeSlotsSidebar";

const formatDateForAPI = (date) => {
  if (!date) return null;
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

const getAllDaysInRangeFromDates = (startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return [];

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  const daysDiff = getDaysDiff(startDate, endDate);

  return Array.from({ length: daysDiff }, (_, i) => {
    const day = new Date(startDate);
    day.setUTCDate(startDate.getUTCDate() + i);
    return new Date(day);
  });
};

const CalendarViewCard = ({ form, onSubmit, onBack }) => {
  const dispatch = useDispatch();
  const { eventDetails } = useSelector((state) => state.event || {});
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

  const { scheduleFormData } = useSelector((state) => state.schedules);

  const lastSavedData = useRef(null);
  const saveTimeout = useRef(null);
  const isInitialized = useRef(false);

  const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return { startDate, endDate, isSelecting: false };
  };

  const [dateRange, setDateRange] = useState(() => {
    if (scheduleFormData?.start_date && scheduleFormData?.end_date) {
      return {
        startDate: new Date(scheduleFormData.start_date),
        endDate: new Date(scheduleFormData.end_date),
        isSelecting: false,
      };
    }
    return getDefaultDateRange();
  });

  const [allEvents, setAllEvents] = useState(() => {
    if (
      scheduleFormData?.show_dates &&
      scheduleFormData.show_dates.length > 0
    ) {
      const restoredEvents = [];
      let eventIdCounter = 1;

      const allDaysInRange = getAllDaysInRangeFromDates(
        scheduleFormData.start_date,
        scheduleFormData.end_date
      );

      scheduleFormData.show_dates.forEach((showDate) => {
        const absoluteDayIndex = allDaysInRange.findIndex((day) => {
          const dayStr = formatDateForAPI(day);
          return dayStr === showDate.start_date;
        });

        if (absoluteDayIndex !== -1) {
          showDate.show_times.forEach((showTime) => {
            const [startHour, startMinute] = showTime.start_time
              .split(":")
              .map(Number);
            const [endHour, endMinute] = showTime.end_time
              .split(":")
              .map(Number);

            const event = {
              id: `restored-${eventIdCounter++}`,
              type: "meeting",
              startTime: {
                day: absoluteDayIndex,
                hour: startHour,
                minute: startMinute || 0,
              },
              endTime: {
                day: absoluteDayIndex,
                hour: endHour,
                minute: endMinute || 0,
              },
              ticket_structure_id: showTime.ticket_structure_id,
              ticket_set: showTime.ticket_set,
              seat_structure_id: showTime.seat_structure_id,
              is_multi_date: showTime.is_midnight === "true",
              color: getTypeColor("meeting"),
            };

            restoredEvents.push(event);
          });
        }
      });

      return restoredEvents;
    }
    return [];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const scrollContainerRef = useRef(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [multiDateSelectionEnabled, setMultiDateSelectionEnabled] = useState(
    scheduleFormData?.is_multi_date || true
  );
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);

  useEffect(() => {
    if (scheduleFormData && !isInitialized.current) {
      if (scheduleFormData.ad_start_date_time) {
        const adStartDate = new Date(scheduleFormData.ad_start_date_time);
        form.setFieldValue("ad_start_date_time", adStartDate);
      }

      if (scheduleFormData.booking_start_date_time) {
        const bookingStartDate = new Date(
          scheduleFormData.booking_start_date_time
        );
        form.setFieldValue("booking_start_date_time", bookingStartDate);
      }

      if (scheduleFormData.is_multi_date !== undefined) {
        setMultiDateSelectionEnabled(scheduleFormData.is_multi_date);
      }

      isInitialized.current = true;
    }
  }, [scheduleFormData, form]);

  const generateShowDatesFromEvents = useCallback(
    (events, currentDateRange) => {
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
        const endDay = event.endTime.day;

        for (let day = startDay; day <= endDay; day++) {
          if (allDaysInRange[day]) {
            const dateStr = formatDateForAPI(allDaysInRange[day]);

            if (!eventsByDate[dateStr]) {
              eventsByDate[dateStr] = [];
            }

            eventsByDate[dateStr].push({
              start_time: `${event.startTime.hour
                .toString()
                .padStart(2, "0")}:${(event.startTime.minute || 0)
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
              is_midnight:
                event.endTime.hour < event.startTime.hour ? "true" : "false",
            });
          }
        }
      });

      const showDates = Object.entries(eventsByDate).map(
        ([dateStr, showTimes]) => ({
          start_date: dateStr,
          end_date: null,
          show_times: showTimes,
        })
      );

      showDates.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));

      return showDates;
    },
    []
  );

  const debouncedSave = useCallback(
    (dataToSave) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(() => {
        const dataString = JSON.stringify(dataToSave);
        const lastDataString = JSON.stringify(lastSavedData.current);

        if (dataString !== lastDataString) {
          dispatch(setScheduleFormData(dataToSave));
          lastSavedData.current = { ...dataToSave };
        }
      }, 1000);
    },
    [dispatch]
  );

  const saveToRedux = useCallback(() => {
    const currentFormData = form.getFieldsValue();

    const dataToSave = {
      ...scheduleFormData,
      ...currentFormData,
      start_date: dateRange.startDate
        ? formatDateForAPI(dateRange.startDate)
        : scheduleFormData?.start_date,
      end_date: dateRange.endDate
        ? formatDateForAPI(dateRange.endDate)
        : scheduleFormData?.end_date,
      is_multi_date: multiDateSelectionEnabled,
      ad_start_date_time: currentFormData.ad_start_date_time
        ? formatDateTime(currentFormData.ad_start_date_time)
        : scheduleFormData?.ad_start_date_time,
      booking_start_date_time: currentFormData.booking_start_date_time
        ? formatDateTime(currentFormData.booking_start_date_time)
        : scheduleFormData?.booking_start_date_time,
      show_dates: generateShowDatesFromEvents(allEvents, dateRange),
    };

    dispatch(setScheduleFormData(dataToSave));
    lastSavedData.current = { ...dataToSave };
  }, [
    dispatch,
    form,
    scheduleFormData,
    dateRange,
    multiDateSelectionEnabled,
    generateShowDatesFromEvents,
    allEvents,
  ]);

  const handleAdStartTimeChange = useCallback(
    (date) => {
      form.setFieldValue("ad_start_date_time", date);

      const updatedData = {
        ...scheduleFormData,
        ad_start_date_time: date ? formatDateTime(date) : null,
      };

      debouncedSave(updatedData);
    },
    [form, scheduleFormData, debouncedSave]
  );

  const handleBookingStartTimeChange = useCallback(
    (date) => {
      form.setFieldValue("booking_start_date_time", date);

      const updatedData = {
        ...scheduleFormData,
        booking_start_date_time: date ? formatDateTime(date) : null,
      };

      debouncedSave(updatedData);
    },
    [form, scheduleFormData, debouncedSave]
  );

  const getColorForDay = (dayIndex) => {
    return timeSlotColors[dayIndex % timeSlotColors.length];
  };

  const getAllDaysInRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      const defaultRange = getDefaultDateRange();
      const daysDiff = getDaysDiff(
        defaultRange.startDate,
        defaultRange.endDate
      );
      return Array.from({ length: daysDiff }, (_, i) => {
        const day = new Date(defaultRange.startDate);
        day.setUTCDate(defaultRange.startDate.getUTCDate() + i);
        return new Date(day);
      });
    }

    const daysDiff = getDaysDiff(dateRange.startDate, dateRange.endDate);
    return Array.from({ length: daysDiff }, (_, i) => {
      const day = new Date(dateRange.startDate);
      day.setUTCDate(dateRange.startDate.getUTCDate() + i);
      return new Date(day);
    });
  };

  const handleCreateEvent = () => {
    saveToRedux();

    const currentFormData = form.getFieldsValue();

    const finalData = {
      ...scheduleFormData,
      ...currentFormData,
      start_date: formatDateForAPI(dateRange.startDate),
      end_date: formatDateForAPI(dateRange.endDate),
      is_multi_date: multiDateSelectionEnabled,
      ad_start_date_time: currentFormData.ad_start_date_time
        ? formatDateTime(currentFormData.ad_start_date_time)
        : scheduleFormData?.ad_start_date_time,
      booking_start_date_time: currentFormData.booking_start_date_time
        ? formatDateTime(currentFormData.booking_start_date_time)
        : scheduleFormData?.booking_start_date_time,
      show_dates: generateShowDatesFromEvents(allEvents, dateRange),
    };

    onSubmit(finalData);
  };

  const handleDateRangeChange = (range) => {
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
    setBlockedSlots([]);

    const updatedData = {
      ...scheduleFormData,
      start_date: formatDateForAPI(range.startDate),
      end_date: formatDateForAPI(range.endDate),
      show_dates: [],
    };

    dispatch(setScheduleFormData(updatedData));
    message.success("Date range changed and all time slots have been reset");
  };

  const handleResetConfirmation = (confirmed) => {
    if (confirmed && pendingDateChange) {
      if (pendingDateChange.type === "dateRange") {
        proceedWithDateRangeChange(pendingDateChange.range);
      }
    }
    setShowResetConfirmModal(false);
    setPendingDateChange(null);
  };

  const getVisibleDays = () => {
    const allDays = getAllDaysInRange();
    const maxDays = Math.min(allDays.length, 7);
    return allDays.slice(currentWeekStart, currentWeekStart + maxDays);
  };

  const allDaysInRange = getAllDaysInRange();
  const visibleDays = getVisibleDays();
  const totalDays = allDaysInRange.length;
  const canNavigateNext = currentWeekStart + 7 < totalDays;
  const canNavigatePrev = currentWeekStart > 0;

  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedEvent(timeSlot);
    setModalOpen(true);
  };

  const handleEventClick = (eventData, clickEvent) => {
    const clickPosition = {
      x: clickEvent?.clientX || 0,
      y: clickEvent?.clientY || 0,
    };
    setSelectedEvent({ ...eventData, clickPosition });
    setModalOpen(true);
  };

  const handleEventSave = (eventData) => {
    if (eventData.id && eventData.id.startsWith("temp-")) {
      const eventDayIndex = eventData.startTime.day + currentWeekStart;
      const colorClass = getColorForDay(eventDayIndex);

      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        color: colorClass,
        startTime: {
          ...eventData.startTime,
          day: eventDayIndex,
        },
        endTime: {
          ...eventData.endTime,
          day: eventData.endTime.day + currentWeekStart,
        },
      };

      setAllEvents((prev) => {
        const updated = [...prev, newEvent];
        debouncedSave({
          ...scheduleFormData,
          show_dates: generateShowDatesFromEvents(updated, dateRange),
        });
        return updated;
      });
      message.success("Event created successfully!");
    } else {
      const eventDayIndex =
        eventData.originalStartDay !== undefined
          ? eventData.originalStartDay
          : eventData.startTime.day;
      const colorClass = getColorForDay(eventDayIndex);

      const updatedEvent = {
        ...eventData,
        color: colorClass,
        startTime: {
          ...eventData.startTime,
          day:
            eventData.originalStartDay !== undefined
              ? eventData.originalStartDay
              : eventData.startTime.day + currentWeekStart,
        },
        endTime: {
          ...eventData.endTime,
          day:
            eventData.originalEndDay !== undefined
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
        });
        return updated;
      });
      message.success("Event updated successfully!");
    }
  };

  const getVisibleEvents = () => {
    const visibleEvents = allEvents.filter((event) => {
      if (!event.startTime || !event.endTime) return false;

      const eventStartDay = event.startTime.day;
      const eventEndDay = event.endTime.day;
      const weekStart = currentWeekStart;
      const weekEnd = currentWeekStart + visibleDays.length - 1;

      return !(eventEndDay < weekStart || eventStartDay > weekEnd);
    });

    const mappedEvents = visibleEvents.map((event) => ({
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

    return mappedEvents;
  };

  const navigateWeek = (direction) => {
    const newStart = currentWeekStart + direction * 7;
    if (direction > 0 && canNavigateNext) {
      setCurrentWeekStart(newStart);
    } else if (direction < 0 && canNavigatePrev) {
      setCurrentWeekStart(Math.max(0, newStart));
    }
  };

  const getDateRangeText = () => {
    if (!dateRange.startDate) return "No dates selected";
    if (!dateRange.endDate)
      return `Start: ${dateRange.startDate.toLocaleDateString()}`;
    return `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
  };

  const hasValidDateRange = dateRange.startDate && dateRange.endDate;

  useEffect(() => {
    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, []);

  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Event Schedule</h1>
            <p className="text-gray-600">
              {hasValidDateRange
                ? "Manage your time slots for the selected dates"
                : "Select dates to start scheduling"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={multiDateSelectionEnabled}
                onChange={(e) => {
                  setMultiDateSelectionEnabled(e.target.checked);
                  debouncedSave({
                    ...scheduleFormData,
                    is_multi_date: e.target.checked,
                  });
                }}
                className="rounded"
              />
              <span className="text-sm text-gray-600">
                Allow Multi-date Selection
              </span>
            </label>
            <div className="text-sm text-gray-500">
              Events: {allEvents.length} | Days: {allDaysInRange.length}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3 space-y-6">
          <div className="mt-8 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Advertisement Start Time *
              </label>
              <CompactDateTimePicker
                onDateTimeChange={handleAdStartTimeChange}
                label=""
                fullWidth={true}
                size="default"
                minDate={new Date()}
                showClearButton={true}
                value={form.getFieldValue("ad_start_date_time")}
                timezone={
                  eventDetails?.venue_events?.[0]?.venue?.place?.country
                    ?.time_zone
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
                minDate={new Date()}
                showClearButton={true}
                value={form.getFieldValue("booking_start_date_time")}
                timezone={
                  eventDetails?.venue_events?.[0]?.venue?.place?.country
                    ?.time_zone
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Event Dates
            </label>
            <CalendarWidget
              onDateRangeChange={handleDateRangeChange}
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
            />
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Selected Period
              </h4>
              <p className="text-sm text-blue-600">{getDateRangeText()}</p>
              <div className="text-xs text-blue-500 mt-1">
                Total Days: {allDaysInRange.length}
              </div>

              <div className="mt-2 space-y-1">
                {scheduleFormData?.ad_start_date_time && (
                  <div className="text-xs text-purple-600">
                    Ad Start:{" "}
                    {new Date(
                      scheduleFormData.ad_start_date_time
                    ).toLocaleString()}
                  </div>
                )}
                {scheduleFormData?.booking_start_date_time && (
                  <div className="text-xs text-purple-600">
                    Booking Start:{" "}
                    {new Date(
                      scheduleFormData.booking_start_date_time
                    ).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasValidDateRange && (
            <TimeSlotsSidebar
              allEvents={allEvents}
              onEventClick={handleEventClick}
              onEventDelete={(eventId) => {
                setAllEvents((prevEvents) => {
                  const updated = prevEvents.filter((e) => e.id !== eventId);
                  debouncedSave({
                    ...scheduleFormData,
                    show_dates: generateShowDatesFromEvents(updated, dateRange),
                  });
                  return updated;
                });
                message.success("Event deleted successfully!");
              }}
              onEventUpdate={(event) => {
                setSelectedEvent(event);
                setModalOpen(true);
              }}
              onApplyToAll={(templateEvent) => {
                const newEvents = [];
                allDaysInRange.forEach((_, dayIndex) => {
                  const hasConflict = allEvents.some((event) => {
                    return (
                      event.startTime.day === dayIndex &&
                      (event.startTime.hour < templateEvent.endTime.hour ||
                        (event.startTime.hour === templateEvent.endTime.hour &&
                          event.startTime.minute <
                            templateEvent.endTime.minute)) &&
                      (event.endTime.hour > templateEvent.startTime.hour ||
                        (event.endTime.hour === templateEvent.startTime.hour &&
                          event.endTime.minute >
                            templateEvent.startTime.minute))
                    );
                  });

                  if (!hasConflict) {
                    const colorClass = getColorForDay(dayIndex);
                    newEvents.push({
                      ...templateEvent,
                      id: `applied-${Date.now()}-${dayIndex}`,
                      color: colorClass,
                      startTime: {
                        ...templateEvent.startTime,
                        day: dayIndex,
                      },
                      endTime: {
                        ...templateEvent.endTime,
                        day: dayIndex,
                      },
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
            />
          )}
        </div>

        <div className="col-span-9">
          {hasValidDateRange ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateWeek(-1)}
                    disabled={!canNavigatePrev}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateWeek(1)}
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
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus size={16} />
                    <span>Save Timeslotes</span>
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
                  onTimeSlotSelect={handleTimeSlotSelect}
                  events={getVisibleEvents()}
                  onEventClick={handleEventClick}
                  scrollContainerRef={scrollContainerRef}
                  blockedSlots={blockedSlots}
                  onMultiDateTimeSlot={(timeSlotData) => {
                    const newMultiEvent = {
                      ...timeSlotData,
                      id: `multi-${Date.now()}`,
                      type: "blocked",
                      is_multi_date: true,
                      color: "bg-orange-500 border-orange-600",
                    };
                    setBlockedSlots((prev) => [...prev, newMultiEvent]);
                    setAllEvents((prev) => {
                      const updated = [...prev, newMultiEvent];
                      debouncedSave({
                        ...scheduleFormData,
                        show_dates: generateShowDatesFromEvents(
                          updated,
                          dateRange
                        ),
                      });
                      return updated;
                    });
                    message.success(
                      "Multi-day time slot created successfully!"
                    );
                  }}
                  multiDateSelectionEnabled={multiDateSelectionEnabled}
                  dayColors={timeSlotColors}
                  getColorForDay={getColorForDay}
                  onOverlapWarning={(msg) => message.warning(msg)}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-center p-8">
                <Calendar size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Select Date Range
                </h3>
                <p className="text-gray-500">
                  Choose your dates from the calendar on the left to start
                  scheduling
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

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
            });
            return updated;
          });
          setBlockedSlots((prevBlocked) =>
            prevBlocked.filter((e) => e.id !== eventId)
          );
          setTimeout(() => setCurrentWeekStart((prev) => prev), 100);
          message.success("Event deleted successfully!");
        }}
        allDays={allDaysInRange}
        existingEvents={allEvents}
        form={form}
      />

      <Modal
        title="Reset All Time Slots"
        open={showResetConfirmModal}
        onOk={() => handleResetConfirmation(true)}
        onCancel={() => handleResetConfirmation(false)}
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
