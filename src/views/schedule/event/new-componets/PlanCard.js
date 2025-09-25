import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Plus } from "lucide-react";
import { Modal, message } from "antd";
import { useSelector } from "react-redux";

import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";

import { getDaysDiff, getTypeColor, ScheduleUtil } from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
import TimeSlotsSidebar from "./TimeSlotsSidebar";

const CalendarViewCard = ({ form, onSubmit }) => {
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

  const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    return {
      startDate,
      endDate,
      isSelecting: false,
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [allEvents, setAllEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const scrollContainerRef = useRef(null);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [multiDateSelectionEnabled, setMultiDateSelectionEnabled] =
    useState(true);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [pendingDateChange, setPendingDateChange] = useState(null);

  const { eventDetails } = useSelector((state) => state.event || {});
  const { selectedVenue } = useSelector((state) => state.locations || {});

  const getColorForDay = (dayIndex) => {
    return timeSlotColors[dayIndex % timeSlotColors.length];
  };

  const ticketOptionsMap = React.useMemo(() => {
    if (!eventDetails?.venue_ticket_structures) return {};

    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );

    if (!venueTicketStructure) return {};

    const map = {};
    venueTicketStructure.ticket_structures.forEach((structure) => {
      map[structure.ticket_structure] = structure.ticket_structure_name;
    });

    return map;
  }, [eventDetails, selectedVenue]);

  const ticketSetOptionsMap = React.useMemo(() => {
    if (!eventDetails?.venue_ticket_structures) return {};

    const venueTicketStructure = eventDetails.venue_ticket_structures.find(
      (vts) => vts.venue.id === selectedVenue
    );

    if (!venueTicketStructure) return {};

    const map = {};
    venueTicketStructure.ticket_structures.forEach((structure) => {
      if (structure.ticket_sets) {
        structure.ticket_sets.forEach((set) => {
          map[set.id || set] = set.name || `Ticket Set ${set}`;
        });
      }
    });

    return map;
  }, [eventDetails, selectedVenue]);

  const seatStructureOptionsMap = React.useMemo(() => {
    if (!eventDetails?.event_venue_seat_structure) return {};
    if (selectedVenue === undefined || selectedVenue === null) return {};

    const venueSeatStructure = eventDetails.event_venue_seat_structure.find(
      (vts) => vts.venue_id === selectedVenue
    );

    if (!venueSeatStructure || !venueSeatStructure.event_seats) return {};

    const map = {};
    venueSeatStructure.event_seats.forEach((seat) => {
      map[seat.id] = seat.seat_structure_name || `Seat Structure ${seat.id}`;
    });

    return map;
  }, [eventDetails, selectedVenue]);

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

  const ResetConfirmationModal = () => (
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
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
  );

  const getAllDaysInRange = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      const defaultRange = getDefaultDateRange();
      const daysDiff =
        getDaysDiff(defaultRange.startDate, defaultRange.endDate) + 1;
      return Array.from({ length: daysDiff }, (_, i) => {
        const day = new Date(defaultRange.startDate);
        day.setDate(defaultRange.startDate.getDate() + i);
        return day;
      });
    }

    const daysDiff = getDaysDiff(dateRange.startDate, dateRange.endDate) + 1;
    return Array.from({ length: daysDiff }, (_, i) => {
      const day = new Date(dateRange.startDate);
      day.setDate(dateRange.startDate.getDate() + i);
      return day;
    });
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

    setSelectedEvent({
      ...eventData,
      clickPosition,
    });
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

      setAllEvents((prev) => [...prev, newEvent]);
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
              : eventData.startTime.day,
        },
        endTime: {
          ...eventData.endTime,
          day:
            eventData.originalEndDay !== undefined
              ? eventData.originalEndDay
              : eventData.endTime.day,
        },
      };

      setAllEvents((prev) =>
        prev.map((e) => (e.id === eventData.id ? updatedEvent : e))
      );
      message.success("Event updated successfully!");
    }
  };

  const handleApplyToAll = (templateEvent) => {
    const isTemplateMultiDay =
      templateEvent.startTime?.day !== templateEvent.endTime?.day;

    if (isTemplateMultiDay && !multiDateSelectionEnabled) {
      message.error(
        "Cannot apply multi-day time slot to all days: Multi-date selection is disabled. Enable multi-date selection first.",
        4
      );
      return;
    }

    const newEvents = [];

    allDaysInRange.forEach((_, dayIndex) => {
      const hasConflict = allEvents.some((event) => {
        return (
          event.startTime.day === dayIndex &&
          (event.startTime.hour < templateEvent.endTime.hour ||
            (event.startTime.hour === templateEvent.endTime.hour &&
              event.startTime.minute < templateEvent.endTime.minute)) &&
          (event.endTime.hour > templateEvent.startTime.hour ||
            (event.endTime.hour === templateEvent.startTime.hour &&
              event.endTime.minute > templateEvent.startTime.minute))
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
      setAllEvents((prev) => [...prev, ...newEvents]);
      message.success(
        `Successfully applied time slot to ${newEvents.length} days!`
      );
    } else {
      message.error("Could not apply time slot due to conflicts on all days.");
    }
  };

  const getVisibleEvents = () => {
    const visibleEvents = allEvents.filter((event) => {
      if (!event.startTime || !event.endTime) {
        return false;
      }

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

  const handleEventDelete = (eventId) => {
    setAllEvents((prevEvents) => prevEvents.filter((e) => e.id !== eventId));
    setBlockedSlots((prevBlocked) =>
      prevBlocked.filter((e) => e.id !== eventId)
    );

    setTimeout(() => {
      setCurrentWeekStart((prev) => prev);
    }, 100);

    message.success("Event deleted successfully!");
  };

  const navigateWeek = (direction) => {
    const newStart = currentWeekStart + direction * 7;
    if (direction > 0 && canNavigateNext) {
      setCurrentWeekStart(newStart);
    } else if (direction < 0 && canNavigatePrev) {
      setCurrentWeekStart(Math.max(0, newStart));
    }
  };

  const handleCreateEvent = () => {
    onSubmit();
  };

  const handleMultiDateTimeSlot = (timeSlotData) => {
    const newMultiEvent = {
      ...timeSlotData,
      id: `multi-${Date.now()}`,
      type: "blocked",
      isMultiDay: true,
      color: "bg-orange-500 border-orange-600",
    };

    setBlockedSlots((prev) => [...prev, newMultiEvent]);
    setAllEvents((prev) => [...prev, newMultiEvent]);
    message.success("Multi-day time slot created successfully!");
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * 48;
    }
  }, [visibleDays]);

  const getDateRangeText = () => {
    if (!dateRange.startDate) return "No dates selected";
    if (!dateRange.endDate)
      return `Start: ${dateRange.startDate.toLocaleDateString()}`;
    return `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
  };

  const hasValidDateRange = dateRange.startDate && dateRange.endDate;

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
                onChange={(e) => setMultiDateSelectionEnabled(e.target.checked)}
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
            <CompactDateTimePicker
              onDateTimeChange={(date) => {
                form.setFieldValue("advertisement_start_time", date);
              }}
              placeholder="Select a Date"
              label="Advertisement Start Time"
              fullWidth={true}
              size="default"
              minDate={new Date()}
              showClearButton={true}
            />

            <CompactDateTimePicker
              onDateTimeChange={(date) => {
                form.setFieldValue("booking_start_time", date);
              }}
              placeholder="Select a Date"
              label="Booking Start Time"
              fullWidth={true}
              size="default"
              minDate={new Date()}
              showClearButton={true}
            />
          </div>

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
          </div>

          {hasValidDateRange && (
            <TimeSlotsSidebar
              allEvents={allEvents}
              onEventClick={handleEventClick}
              onEventDelete={handleEventDelete}
              onEventUpdate={(event) => {
                setSelectedEvent(event);
                setModalOpen(true);
              }}
              onApplyToAll={handleApplyToAll}
              allDaysInRange={allDaysInRange}
            />
          )}
        </div>

        <div className="col-span-9">
          {hasValidDateRange ? (
            <>
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
                <button
                  onClick={handleCreateEvent}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus size={16} />
                  <span>Create Event</span>
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div
                  className="grid gap-4 mb-4"
                  style={{
                    gridTemplateColumns: `64px repeat(${visibleDays.length}, 1fr)`,
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
                  onMultiDateTimeSlot={handleMultiDateTimeSlot}
                  multiDateSelectionEnabled={multiDateSelectionEnabled}
                  dayColors={timeSlotColors}
                  getColorForDay={getColorForDay}
                  ticketOptionsMap={ticketOptionsMap}
                  ticketSetOptionsMap={ticketSetOptionsMap}
                  seatStructureOptionsMap={seatStructureOptionsMap}
                  onOverlapWarning={(msg) => {
                    message.warning(msg);
                  }}
                />
              </div>
            </>
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
        onDelete={handleEventDelete}
        onApplyToAll={handleApplyToAll}
        allDays={allDaysInRange}
        existingEvents={allEvents}
        form={form}
      />

      <ResetConfirmationModal />
    </div>
  );
};

export default CalendarViewCard;
