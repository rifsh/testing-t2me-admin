// PlanCard.jsx - Fixed main calendar with proper Apply to All and multi-date selection
import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  MoreHorizontal,
} from "lucide-react";

// Import components
import CalendarWidget from "./CalendarWidget";
import TimeSelector from "./TimeSelector";
import EventModal from "./EventModal";

// Import utilities
import {
  getDaysDiff,
  getTypeColor,
  formatTime,
  formatDateToString,
  ScheduleUtil,
} from "../utils";
import CompactDateTimePicker from "./CompactDateTimePicker";
import { message } from "antd";
import TimeSlotsSidebar from "./TimeSlotsSidebar";

const CalendarViewCard = () => {
  // FIXED: Set default date range - 7 days starting 7 days from current date
  const getDefaultDateRange = () => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 7); // 7 days from today

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // 7 days total

    return {
      startDate,
      endDate,
      isSelecting: false,
    };
  };

  const [dateRange, setDateRange] = useState(getDefaultDateRange());
  const [allEvents, setAllEvents] = useState([]); // Store all events across all dates
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(0);
  const scrollContainerRef = useRef(null);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [blockedSlots, setBlockedSlots] = useState([]); // Track blocked time slots
  const [multiDateSelectionEnabled, setMultiDateSelectionEnabled] =
    useState(true); // FIXED: Add flag to enable/disable multi-date selection

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    setCurrentWeekStart(0); // Reset week view when date range changes
  };

  const getAllDaysInRange = () => {
    // FIXED: Always use the selected date range (including default)
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

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleEventSave = (eventData) => {
    if (eventData.id && eventData.id.startsWith("temp-")) {
      // New event
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        color: getTypeColor(eventData.type),
        // Adjust day index to account for current week offset
        startTime: {
          ...eventData.startTime,
          day: eventData.startTime.day + currentWeekStart,
        },
        endTime: {
          ...eventData.endTime,
          day: eventData.endTime.day + currentWeekStart, // FIXED: Support multi-day events
        },
      };
      setAllEvents((prev) => [...prev, newEvent]);
      message.success("Event created successfully!");
    } else {
      // Update existing event
      const updatedEvent = {
        ...eventData,
        color: getTypeColor(eventData.type),
      };
      setAllEvents((prev) =>
        prev.map((e) => (e.id === eventData.id ? updatedEvent : e))
      );
      message.success("Event updated successfully!");
    }
  };

  // FIXED: Apply to All with proper day index management and multi-day validation
  const handleApplyToAll = (templateEvent) => {
    console.log("=== APPLY TO ALL DEBUG ===");
    console.log("Template Event:", templateEvent);
    console.log("All Days in Range:", allDaysInRange.length);
    console.log("Current All Events:", allEvents.length);

    // FIXED: Check if template event is multi-day and prevent application
    if (templateEvent.startTime && templateEvent.endTime) {
      if (templateEvent.startTime.day !== templateEvent.endTime.day) {
        message.warning(
          "Cannot apply multi-day time slots to all days. Please select a single-day time slot."
        );
        return;
      }
    }

    // FIXED: Create events with absolute day indices (not relative to currentWeekStart)
    const newEvents = [];
    const conflicts = [];

    allDaysInRange.forEach((day, absoluteDayIndex) => {
      const newEvent = {
        ...templateEvent,
        id: `applied-${Date.now()}-${absoluteDayIndex}`,
        color: getTypeColor(templateEvent.type || "meeting"),
        startTime: {
          ...templateEvent.startTime,
          day: absoluteDayIndex, // Use absolute day index
        },
        endTime: {
          ...templateEvent.endTime,
          day: absoluteDayIndex, // Ensure same day for single-day events
        },
      };

      console.log(`Creating event for day ${absoluteDayIndex}:`, newEvent);

      // Check for conflicts with existing events
      const conflictingEvents = allEvents.filter((existingEvent) => {
        if (!existingEvent.startTime || !existingEvent.endTime) return false;

        // Check if same day
        if (existingEvent.startTime.day !== absoluteDayIndex) return false;

        // Check time overlap
        const newStart =
          templateEvent.startTime.hour * 60 +
          (templateEvent.startTime.minute || 0);
        const newEnd =
          templateEvent.endTime.hour * 60 + (templateEvent.endTime.minute || 0);
        const existingStart =
          existingEvent.startTime.hour * 60 +
          (existingEvent.startTime.minute || 0);
        const existingEnd =
          existingEvent.endTime.hour * 60 + (existingEvent.endTime.minute || 0);

        return newStart < existingEnd && newEnd > existingStart;
      });

      if (conflictingEvents.length > 0) {
        conflicts.push({
          dayIndex: absoluteDayIndex,
          conflictingEvents: conflictingEvents.length,
          day: day,
        });
        console.log(`Conflict found on day ${absoluteDayIndex}`);
      } else {
        newEvents.push(newEvent);
        console.log(`Event added for day ${absoluteDayIndex}`);
      }
    });

    console.log("New Events to Add:", newEvents);

    if (newEvents.length > 0) {
      // FIXED: Update events state properly
      setAllEvents((prev) => {
        const updated = [...prev, ...newEvents];
        console.log("Updated All Events:", updated);
        return updated;
      });

      // Enhanced notification with detailed info
      if (conflicts.length > 0) {
        const conflictDays = conflicts.length;
        const successfulDays = newEvents.length;
        const totalDays = allDaysInRange.length;

        message.warning(
          `Applied to ${successfulDays} out of ${totalDays} days. ${conflictDays} days skipped due to conflicts.`
        );

        console.log("Conflicts:", conflicts);
      } else {
        const totalDays = allDaysInRange.length;
        message.success(
          `Successfully applied to all ${totalDays} days! Created ${newEvents.length} events.`
        );
      }
    } else {
      const totalDays = allDaysInRange.length;
      message.error(
        `Could not apply to any of the ${totalDays} days due to conflicts.`
      );
    }

    console.log("=== END APPLY TO ALL DEBUG ===");
  };

  // FIXED: Get events for visible days with proper day index filtering
  const getVisibleEvents = () => {
    return allEvents.filter((event) => {
      if (!event.startTime) return false;

      const eventDay = event.startTime.day;
      const adjustedEventDay = eventDay - currentWeekStart;

      const isInVisibleRange =
        adjustedEventDay >= 0 && adjustedEventDay < visibleDays.length;

      console.log(
        `Event ${event.id} on day ${eventDay}, adjusted: ${adjustedEventDay}, visible: ${isInVisibleRange}`
      );

      return isInVisibleRange;
    });
  };

  const handleEventDelete = (eventId) => {
    console.log("Deleting event:", eventId);
    setAllEvents((prev) => {
      const updated = prev.filter((e) => e.id !== eventId);
      console.log("Events after deletion:", updated);
      return updated;
    });
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
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  // FIXED: Handle multi-date time slot creation
  const handleMultiDateTimeSlot = (timeSlotData) => {
    const newMultiEvent = {
      ...timeSlotData,
      id: `multi-${Date.now()}`,
      type: "blocked",
      isMultiDay: true,
      color: "bg-orange-400",
    };

    setBlockedSlots((prev) => [...prev, newMultiEvent]);
    setAllEvents((prev) => [...prev, newMultiEvent]);
    message.success("Multi-day time slot created successfully!");
  };

  // Auto-scroll to 8 AM when visible days change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 8 * 48; // 8 AM (8 hours * 48px per hour)
    }
  }, [visibleDays]);

  // FIXED: Debug effect to monitor events
  useEffect(() => {
    console.log("All Events Updated:", allEvents.length, allEvents);
  }, [allEvents]);

  const getDateRangeText = () => {
    if (!dateRange.startDate) return "No dates selected";
    if (!dateRange.endDate)
      return `Start: ${dateRange.startDate.toLocaleDateString()}`;
    return `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`;
  };

  // Export data in the required API format
  const exportToApiFormat = () => {
    const apiData = ScheduleUtil.convertToApiFormat(allEvents, allDaysInRange);
    console.log("API Format:", JSON.stringify(apiData, null, 2));
    return apiData;
  };

  const weekDayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Check if we have valid dates to show time slots
  const hasValidDateRange = dateRange.startDate && dateRange.endDate;

  return (
    <div className="max-w-full mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header Section */}
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
          {/* FIXED: Multi-date selection toggle */}
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

      {/* Main Content Area */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="col-span-3 space-y-6">
          <div className="mt-8 flex gap-4">
            <CompactDateTimePicker
              onDateTimeChange={(date) => console.log("Picker 2:", date)}
              placeholder="Meeting Time"
            />
            <CompactDateTimePicker
              onDateTimeChange={(date) => console.log("Picker 3:", date)}
              placeholder="Deadline"
            />
          </div>

          {/* Calendar Widget */}
          <CalendarWidget
            onDateRangeChange={handleDateRangeChange}
            initialStartDate={dateRange.startDate}
            initialEndDate={dateRange.endDate}
          />

          {/* Date Range Info Display */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Selected Period
            </h4>
            <p className="text-sm text-blue-600">{getDateRangeText()}</p>
            <div className="text-xs text-blue-500 mt-1">
              Total Days: {allDaysInRange.length}
            </div>
          </div>

          {/* Time Slots Sidebar - Shows when dates are selected */}
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

        {/* Main Calendar Area */}
        <div className="col-span-9">
          {hasValidDateRange ? (
            <>
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateWeek(-1)}
                    disabled={!canNavigatePrev}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous week"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => navigateWeek(1)}
                    disabled={!canNavigateNext}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next week"
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

              {/* Calendar Grid */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                {/* Week Headers */}
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

                {/* Time Selection Component */}
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
                  onOverlapWarning={(msg, conflicts) => {
                    console.warn("Overlap detected:", msg, conflicts);
                    message.warning(msg);
                  }}
                />
              </div>
            </>
          ) : (
            /* Show placeholder when no dates selected */
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

      {/* Event Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        event={selectedEvent}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        onApplyToAll={handleApplyToAll}
        allDays={allDaysInRange}
        existingEvents={allEvents}
        multiDateSelectionEnabled={multiDateSelectionEnabled}
      />
    </div>
  );
};

export default CalendarViewCard;
