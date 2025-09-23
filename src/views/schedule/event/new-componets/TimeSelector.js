import React, { useState } from "react";
import { Copy, AlertTriangle } from "lucide-react";
import {
  generateTimeSlots,
  ScheduleUtil,
  formatTime,
  timeToMinutes,
} from "../utils";
import { message } from "antd";

const TimeSelector = ({
  days,
  selectedTimeSlot,
  onTimeSlotSelect,
  events,
  onEventClick,
  scrollContainerRef,
  onApplyToAll,
  onOverlapWarning,
  blockedSlots = [],
  onBlockTimeSlot,
  // FIXED: Add missing props
  multiDateSelectionEnabled = false,
  onMultiDateTimeSlot = null,
}) => {
  const timeSlots = generateTimeSlots();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [overlapMessage, setOverlapMessage] = useState(null);

  const getSlotFromPosition = (dayIndex, slotIndex) => {
    const hour = slotIndex;
    const minute = 0;
    return { day: dayIndex, hour, minute };
  };

  const handleMouseDown = (dayIndex, slotIndex) => {
    if (!days[dayIndex]) return;

    setOverlapMessage(null);

    const slotTime = getSlotFromPosition(dayIndex, slotIndex);
    if (getEventInSlot(dayIndex, slotTime.hour, slotTime.minute)) {
      return;
    }

    setIsSelecting(true);
    const start = slotTime;
    setSelectionStart(start);
    setDragEnd(start);
  };

  const handleMouseEnter = (dayIndex, slotIndex) => {
    if (!days[dayIndex] || !isSelecting) return;

    const potentialEnd = getSlotFromPosition(dayIndex, slotIndex);

    // FIXED: Allow cross-day selection if multi-date is enabled
    if (multiDateSelectionEnabled || potentialEnd.day === selectionStart?.day) {
      setDragEnd(potentialEnd);
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && dragEnd) {
      let startTime = { ...selectionStart };
      let endTime = {
        day: dragEnd.day,
        hour: dragEnd.hour + 1,
        minute: 0,
      };

      // Handle hour overflow for multi-day events
      if (endTime.hour >= 24) {
        endTime.day += Math.floor(endTime.hour / 24);
        endTime.hour = endTime.hour % 24;
      }

      // Ensure proper time ordering
      const startMinutes =
        startTime.day * 1440 + timeToMinutes(startTime.hour, startTime.minute);
      const endMinutes =
        endTime.day * 1440 + timeToMinutes(endTime.hour, endTime.minute);

      if (startMinutes >= endMinutes) {
        const temp = { ...startTime };
        startTime = { ...endTime };
        endTime = { ...temp };
      }

      const newEvent = {
        startTime,
        endTime,
        id: `temp-${Date.now()}`,
      };

      // FIXED: Check if multi-date selection is allowed
      if (startTime.day !== endTime.day) {
        if (multiDateSelectionEnabled) {
          newEvent.isMultiDay = true;
          newEvent.type = "blocked";

          // Call the multi-date handler if provided
          if (onMultiDateTimeSlot) {
            onMultiDateTimeSlot(newEvent);
          } else {
            // Fallback to regular time slot handler
            onTimeSlotSelect(newEvent);
          }
          message.success("Multi-day time slot created successfully!");
        } else {
          message.warning(
            "Multi-day selections are disabled. Enable it from the toggle above."
          );
        }
      } else {
        // Single day event - check for conflicts
        const conflictingEvents = ScheduleUtil.findConflictingEvents(
          newEvent,
          events
        );

        if (conflictingEvents.length > 0) {
          const conflictMessage = `Cannot create event: overlaps with ${conflictingEvents.length} existing event(s)`;
          setOverlapMessage({
            type: "error",
            message: conflictMessage,
          });

          if (onOverlapWarning) {
            onOverlapWarning(conflictMessage, conflictingEvents);
          }

          setTimeout(() => setOverlapMessage(null), 4000);
        } else {
          onTimeSlotSelect(newEvent);
          message.success("Time slot selected successfully!");
        }
      }
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setDragEnd(null);
  };

  // FIXED: Show selection for both single and multi-day based on settings
  const isSlotSelected = (dayIndex, slotIndex) => {
    if (!selectionStart || !dragEnd || !isSelecting) {
      return false;
    }

    // If multi-date is disabled, only highlight same-day selections
    if (!multiDateSelectionEnabled && dayIndex !== selectionStart.day) {
      return false;
    }

    const currentMinutes = dayIndex * 1440 + slotIndex * 60;
    const startMinutes =
      selectionStart.day * 1440 +
      selectionStart.hour * 60 +
      selectionStart.minute;
    const endMinutes = dragEnd.day * 1440 + dragEnd.hour * 60 + dragEnd.minute;

    const minMinutes = Math.min(startMinutes, endMinutes);
    const maxMinutes = Math.max(startMinutes, endMinutes + 60);

    return currentMinutes >= minMinutes && currentMinutes < maxMinutes;
  };

  const isSlotBlocked = (dayIndex, slotIndex) => {
    const currentMinutes = dayIndex * 1440 + slotIndex * 60;
    return blockedSlots.some((blocked) => {
      if (!blocked.startTime || !blocked.endTime) return false;
      const startMinutes =
        blocked.startTime.day * 1440 +
        blocked.startTime.hour * 60 +
        (blocked.startTime.minute || 0);
      const endMinutes =
        blocked.endTime.day * 1440 +
        blocked.endTime.hour * 60 +
        (blocked.endTime.minute || 0);
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };

  // FIXED: Enhanced getEventInSlot for proper event display
  const getEventInSlot = (dayIndex, hour, minute) => {
    const visibleEvent = events.find((event) => {
      if (!event.startTime || !event.endTime) return false;

      const eventStartDay = event.startTime.day;
      const eventEndDay = event.endTime.day;
      const eventStartMinutes = timeToMinutes(
        event.startTime.hour,
        event.startTime.minute || 0
      );
      const eventEndMinutes = timeToMinutes(
        event.endTime.hour,
        event.endTime.minute || 0
      );
      const slotMinutes = timeToMinutes(hour, minute);

      console.log(
        `Checking event ${event.id} for slot Day:${dayIndex} ${hour}:${minute}`
      );
      console.log(`Event spans Day:${eventStartDay} to Day:${eventEndDay}`);

      if (dayIndex < eventStartDay || dayIndex > eventEndDay) return false;

      // Handle both single-day and multi-day events
      if (eventStartDay === eventEndDay) {
        // Single day event
        const matches =
          dayIndex === eventStartDay &&
          slotMinutes >= eventStartMinutes &&
          slotMinutes < eventEndMinutes;
        if (matches) console.log(`✓ Single-day event ${event.id} matches slot`);
        return matches;
      } else {
        // Multi-day event logic
        if (dayIndex === eventStartDay) {
          const matches = slotMinutes >= eventStartMinutes;
          if (matches)
            console.log(`✓ Multi-day event ${event.id} matches start day`);
          return matches;
        } else if (dayIndex === eventEndDay) {
          const matches = slotMinutes < eventEndMinutes;
          if (matches)
            console.log(`✓ Multi-day event ${event.id} matches end day`);
          return matches;
        } else {
          // Middle days of multi-day event
          const matches = dayIndex > eventStartDay && dayIndex < eventEndDay;
          if (matches)
            console.log(`✓ Multi-day event ${event.id} matches middle day`);
          return matches;
        }
      }
    });

    return visibleEvent;
  };

  const getEventDisplayInfo = (event, dayIndex, slotIndex) => {
    if (!event || !event.startTime || !event.endTime) return null;

    const eventStartDay = event.startTime.day;
    const eventEndDay = event.endTime.day;
    const eventStartHour = event.startTime.hour;
    const eventStartMinute = event.startTime.minute || 0;
    const eventStartSlot = eventStartHour;

    if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
      let durationMinutes = 0;

      if (eventStartDay === eventEndDay) {
        // Single day event
        const eventEndMinutes = timeToMinutes(
          event.endTime.hour,
          event.endTime.minute || 0
        );
        const eventStartMinutes = timeToMinutes(
          eventStartHour,
          eventStartMinute
        );
        durationMinutes = eventEndMinutes - eventStartMinutes;
      } else {
        // Multi-day event - show duration from start time to end of day
        const endOfDayMinutes = timeToMinutes(23, 59);
        const eventStartMinutes = timeToMinutes(
          eventStartHour,
          eventStartMinute
        );
        durationMinutes = endOfDayMinutes - eventStartMinutes;
      }

      const heightSlots = Math.max(1, Math.ceil(durationMinutes / 60));

      return {
        show: true,
        height: heightSlots,
      };
    }

    // Handle continuation of multi-day events
    if (
      event.isMultiDay &&
      dayIndex > eventStartDay &&
      dayIndex <= eventEndDay
    ) {
      if (dayIndex < eventEndDay) {
        // Full day
        return { show: true, height: 24 };
      } else if (dayIndex === eventEndDay && slotIndex === 0) {
        // Last day - show from start of day to end time
        const eventEndMinutes = timeToMinutes(
          event.endTime.hour,
          event.endTime.minute || 0
        );
        const heightSlots = Math.max(1, Math.ceil(eventEndMinutes / 60));
        return { show: true, height: heightSlots };
      }
    }

    return { show: false };
  };

  const getEventColors = (event) => {
    // Multi-day or blocked events
    if (event.isBlocked || event.type === "blocked" || event.isMultiDay) {
      return {
        main: "bg-orange-500",
        light: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
      };
    }

    const colorOptions = [
      {
        main: "bg-blue-500",
        light: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-700",
      },
      {
        main: "bg-green-500",
        light: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
      },
      {
        main: "bg-yellow-500",
        light: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-700",
      },
      {
        main: "bg-purple-500",
        light: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-700",
      },
      {
        main: "bg-red-500",
        light: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
      },
    ];

    if (!event.colorIndex) {
      event.colorIndex = Math.floor(Math.random() * colorOptions.length);
    }

    return colorOptions[event.colorIndex] || colorOptions[0];
  };

  const displaySlots = [];
  for (let hour = 0; hour < 24; hour++) {
    displaySlots.push({
      hour,
      minute: 0,
      time12: formatTime(hour, 0),
      isHourMark: true,
    });
  }

  return (
    <div
      ref={scrollContainerRef}
      className="h-full bg-white rounded-xl border border-gray-200 relative overflow-auto"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#CBD5E0 #F7FAFC",
        maxHeight: "600px",
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Overlap Warning Message */}
      {overlapMessage && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 p-3 rounded-lg shadow-lg border flex items-center space-x-2 ${
            overlapMessage.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
          <AlertTriangle size={16} />
          <span className="text-sm font-medium">{overlapMessage.message}</span>
        </div>
      )}

      {/* Selection Mode Indicator */}
      <div className="absolute top-4 right-4 z-40 bg-blue-50 border border-blue-200 rounded-lg p-2">
        <div className="text-xs text-blue-700 font-medium">
          {multiDateSelectionEnabled
            ? "📅 Multi-day Selection Enabled"
            : "📅 Single Day Selection Only"}
        </div>
      </div>

      {/* Time slots on the left - Sticky */}
      <div className="sticky left-0 z-20 w-20 bg-gray-50 border-r border-gray-200 float-left">
        {displaySlots.map((slot, i) => (
          <div
            key={`time-${i}`}
            className="h-16 flex items-center justify-center text-xs text-gray-600 font-medium border-b border-gray-300 bg-gray-50"
            style={{ minHeight: "64px" }}
          >
            {slot.time12}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        className="ml-20 grid min-h-full"
        style={{
          gridTemplateColumns: `repeat(${Math.max(days.length, 1)}, 1fr)`,
          minHeight: `${displaySlots.length * 64}px`,
        }}
      >
        {days.map((day, dayIndex) => (
          <div
            key={`day-${dayIndex}`}
            className="border-r border-gray-100 last:border-r-0 relative"
          >
            {displaySlots.map((slot, slotIndex) => {
              const event = getEventInSlot(dayIndex, slot.hour, slot.minute);
              const isSelected = isSlotSelected(dayIndex, slotIndex);
              const isBlocked = isSlotBlocked(dayIndex, slotIndex);
              const isOccupied = !!event || isBlocked;
              const eventInfo = event
                ? getEventDisplayInfo(event, dayIndex, slotIndex)
                : { show: false };

              return (
                <div
                  key={`slot-${dayIndex}-${slotIndex}`}
                  className={`h-16 border-b border-gray-50 relative transition-colors select-none ${
                    isOccupied
                      ? "cursor-not-allowed"
                      : isSelected
                      ? multiDateSelectionEnabled
                        ? "bg-orange-200 cursor-pointer" // Orange for multi-day
                        : "bg-blue-200 cursor-pointer" // Blue for single day
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  style={{ minHeight: "64px" }}
                  onMouseDown={() => handleMouseDown(dayIndex, slotIndex)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex)}
                >
                  {/* Event Block */}
                  {event && eventInfo.show && (
                    <div
                      className="absolute inset-x-1 top-0 cursor-pointer hover:opacity-90 transition-opacity z-10 flex"
                      style={{
                        height: `${Math.max(1, eventInfo.height) * 64}px`,
                        minHeight: "64px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                      title={`${
                        event.isMultiDay
                          ? "Multi-day"
                          : event.type === "blocked"
                          ? "Blocked"
                          : event.type
                      } - ${formatTime(
                        event.startTime.hour,
                        event.startTime.minute || 0
                      )} to ${formatTime(
                        event.endTime.hour,
                        event.endTime.minute || 0
                      )}`}
                    >
                      <div
                        className={`w-1 rounded-l ${
                          getEventColors(event).main
                        }`}
                      />
                      <div
                        className={`flex-1 ${getEventColors(event).light} ${
                          getEventColors(event).border
                        } border-l-0 border rounded-r p-2 overflow-hidden`}
                      >
                        <div
                          className={`font-medium truncate text-sm leading-tight capitalize ${
                            getEventColors(event).text
                          }`}
                        >
                          {event.isMultiDay
                            ? "Multi-day"
                            : event.type === "blocked"
                            ? "Blocked"
                            : event.type}
                        </div>
                        <div
                          className={`opacity-75 truncate text-xs leading-tight mt-1 ${
                            getEventColors(event).text
                          }`}
                        >
                          {formatTime(
                            event.startTime.hour,
                            event.startTime.minute || 0
                          )}
                        </div>
                        {eventInfo.height > 1 && (
                          <div
                            className={`opacity-75 text-xs mt-1 ${
                              getEventColors(event).text
                            }`}
                          >
                            {ScheduleUtil.formatDuration(
                              event.startTime,
                              event.endTime
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        div::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        div::-webkit-scrollbar-track {
          background: #f8fafc;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb {
          background: #cbd5e0;
          border-radius: 4px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #a0aec0;
        }
        div::-webkit-scrollbar-corner {
          background: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default TimeSelector;
