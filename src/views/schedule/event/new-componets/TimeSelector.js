import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  generateTimeSlots,
  ScheduleUtil,
  formatTime,
  timeToMinutes,
} from "../utils";
import { message } from "antd";

const TimeSelector = ({
  days = [],
  selectedTimeSlot,
  onTimeSlotSelect,
  events = [],
  onEventClick,
  scrollContainerRef,
  onApplyToAll,
  onOverlapWarning,
  blockedSlots = [],
  dayColors = [],
  getColorForDay,
  ticketOptionsMap = {},
  ticketSetOptionsMap = {},
  seatStructureOptionsMap = {},
  eventDateRange = null,
  selectedEventId = null,
  blockedEventIds = new Set(),
}) => {
  const timeSlots = generateTimeSlots();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [overlapMessage, setOverlapMessage] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const isEventBlocked = (eventId) => {
    return blockedEventIds.has(eventId);
  };
  
  const logMidnightEvent = (event, context = "") => {
    if (event.is_midnight_passed) {
      console.log(`🌙 MIDNIGHT EVENT ${context}:`, {
        id: event.id,
        startDay: event.startTime.day,
        endDay: event.endTime.day,
        startTime: `${event.startTime.hour}:${String(
          event.startTime.minute || 0
        ).padStart(2, "0")}`,
        endTime: `${event.endTime.hour}:${String(
          event.endTime.minute || 0
        ).padStart(2, "0")}`,
        show_end_date: event.show_end_date,
        totalDuration: calculateMidnightDuration(event),
        dayOneDuration: calculateDayOneDuration(event),
        dayTwoDuration: calculateDayTwoDuration(event),
      });
    }
  };

  // FIXED: Calculate total midnight event duration
  const calculateMidnightDuration = (event) => {
    if (!event.is_midnight_passed) return 0;

    const startMinutes = timeToMinutes(
      event.startTime.hour,
      event.startTime.minute || 0
    );
    const endMinutes = timeToMinutes(
      event.endTime.hour,
      event.endTime.minute || 0
    );

    // Day 1: from start time to midnight (24:00)
    const dayOneDuration = 24 * 60 - startMinutes;

    // Day 2: from midnight (00:00) to end time
    const dayTwoDuration = endMinutes;

    return {
      total: dayOneDuration + dayTwoDuration,
      dayOne: dayOneDuration,
      dayTwo: dayTwoDuration,
      startMinutes,
      endMinutes,
    };
  };

  // FIXED: Calculate day one duration (start time to midnight)
  const calculateDayOneDuration = (event) => {
    if (!event.is_midnight_passed) return 0;
    const startMinutes = timeToMinutes(
      event.startTime.hour,
      event.startTime.minute || 0
    );
    return 24 * 60 - startMinutes; // Minutes from start to midnight
  };

  // FIXED: Calculate day two duration (midnight to end time)
  const calculateDayTwoDuration = (event) => {
    if (!event.is_midnight_passed) return 0;
    return timeToMinutes(event.endTime.hour, event.endTime.minute || 0);
  };

  const getDaySpecificColors = (dayIndex) => {
    const colorSets = [
      {
        main: "bg-red-500",
        light: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
      },
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
        main: "bg-pink-500",
        light: "bg-pink-50",
        border: "border-pink-200",
        text: "text-pink-700",
      },
      {
        main: "bg-indigo-500",
        light: "bg-indigo-50",
        border: "border-indigo-200",
        text: "text-indigo-700",
      },
    ];
    return colorSets[dayIndex % colorSets.length];
  };

  const getEventColors = (event, dayIndex) => {
    if (event.is_midnight_passed) {
      return {
        main: "bg-orange-500",
        light: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-700",
      };
    }
    return getDaySpecificColors(dayIndex);
  };

  const getEventDisplayText = (event) => {
    if (event.ticketType && ticketOptionsMap[event.ticketType]) {
      return ticketOptionsMap[event.ticketType];
    }
    if (event.ticketSet && ticketSetOptionsMap[event.ticketSet]) {
      return ticketSetOptionsMap[event.ticketSet];
    }
    if (
      event.seat_structure_id &&
      seatStructureOptionsMap[event.seat_structure_id]
    ) {
      return seatStructureOptionsMap[event.seat_structure_id];
    }
    if (event.ticketType) return `Ticket ${event.ticketType}`;
    if (event.ticketSet) return `Set ${event.ticketSet}`;
    if (event.seat_structure_id) return `Seat ${event.seat_structure_id}`;
    if (event.is_midnight_passed) return "Midnight Event";
    return event.type || "Time Slot";
  };

  const getEventTooltip = (event) => {
    const details = [];

    if (event.ticketType) {
      const name = ticketOptionsMap[event.ticketType] || event.ticketType;
      details.push(`Ticket Type: ${name}`);
    }
    if (event.ticketSet) {
      const name = ticketSetOptionsMap[event.ticketSet] || event.ticketSet;
      details.push(`Ticket Set: ${name}`);
    }
    if (event.seat_structure_id) {
      const name =
        seatStructureOptionsMap[event.seat_structure_id] ||
        event.seat_structure_id;
      details.push(`Seats: ${name}`);
    }

    const timeRange = `${formatTime(
      event.startTime.hour,
      event.startTime.minute || 0
    )} to ${formatTime(event.endTime.hour, event.endTime.minute || 0)}`;
    details.push(timeRange);

    if (event.is_midnight_passed) {
      const duration = calculateMidnightDuration(event);
      details.push(
        `Crosses Midnight (${Math.floor(duration.total / 60)}h ${
          duration.total % 60
        }m total)`
      );
    }

    return details.join(" • ");
  };

  // Check if slot is outside event date range
  const isSlotOutsideEventRange = (dayIndex) => {
    if (!eventDateRange || !days[dayIndex]) return false;

    const currentDate = days[dayIndex];
    const eventStart = new Date(eventDateRange.startDate);
    const eventEnd = new Date(eventDateRange.endDate);

    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);

    return currentDate < eventStart || currentDate > eventEnd;
  };

  const getSlotFromPosition = (dayIndex, slotIndex) => {
    const hour = slotIndex;
    const minute = 0;
    return { day: dayIndex, hour, minute };
  };

  // Simplified mouse handlers - No auto midnight detection
  const handleMouseDown = (dayIndex, slotIndex) => {
    if (!days[dayIndex]) return;

    if (isSlotOutsideEventRange(dayIndex)) {
      message.error("Cannot create time slots outside the event date range");
      return;
    }

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

    if (isSlotOutsideEventRange(dayIndex)) return;

    const potentialEnd = getSlotFromPosition(dayIndex, slotIndex);

    if (selectionStart) {
      let startTime = { ...selectionStart };
      let endTime = {
        day: potentialEnd.day,
        hour: potentialEnd.hour + 1,
        minute: 0,
      };

      if (endTime.hour >= 24) {
        endTime.day += Math.floor(endTime.hour / 24);
        endTime.hour = endTime.hour % 24;
      }

      const isValidSelection = potentialEnd.day === selectionStart.day;

      if (isValidSelection) {
        const potentialEvent = {
          startTime,
          endTime,
          id: "temp-drag-preview",
        };

        const conflictingEvents = ScheduleUtil.findConflictingEvents(
          potentialEvent,
          events
        );
        if (conflictingEvents.length > 0) {
          setOverlapMessage({
            type: "warning",
            message: `Selection would overlap with ${conflictingEvents.length} existing events`,
          });
        } else if (overlapMessage?.message.includes("overlap")) {
          setOverlapMessage(null);
        }

        setDragEnd(potentialEnd);
      }
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && dragEnd) {
      let startTime = { ...selectionStart };
      let endTime = { day: dragEnd.day, hour: dragEnd.hour + 1, minute: 0 };

      if (endTime.hour >= 24) {
        endTime.day += Math.floor(endTime.hour / 24);
        endTime.hour = endTime.hour % 24;
      }

      const newEvent = {
        startTime,
        endTime,
        id: `temp-${Date.now()}`,
        is_midnight_passed: false, // Default to false, user can toggle in modal
      };

      const conflictingEvents = ScheduleUtil.findConflictingEvents(
        newEvent,
        events
      );
      if (conflictingEvents.length > 0) {
        const conflictMessage = `Cannot create event: overlaps with ${conflictingEvents.length} existing events`;
        setOverlapMessage({
          type: "error",
          message: conflictMessage,
        });
        if (onOverlapWarning)
          onOverlapWarning(conflictMessage, conflictingEvents);
        setTimeout(() => setOverlapMessage(null), 4000);
      } else {
        onTimeSlotSelect(newEvent);
        message.success("Time slot selected successfully!");
      }
    }

    setIsSelecting(false);
    setSelectionStart(null);
    setDragEnd(null);
  };

  const getSelectionColor = (dayIndex) => {
    const colors = getDaySpecificColors(dayIndex);
    return colors.light.replace("bg-", "bg-").replace("-50", "-200");
  };

  // Simple slot selection - only on same day
  const isSlotSelected = (dayIndex, slotIndex) => {
    if (!selectionStart || !dragEnd || !isSelecting) return false;
    if (dayIndex !== selectionStart.day) return false;

    const currentSlot = slotIndex;
    const startSlot = selectionStart.hour;
    const endSlot = dragEnd.hour;

    const minSlot = Math.min(startSlot, endSlot);
    const maxSlot = Math.max(startSlot, endSlot);

    return currentSlot >= minSlot && currentSlot <= maxSlot;
  };

  const isSlotInConflict = (dayIndex, slotIndex) => {
    if (!selectionStart || !dragEnd || !isSelecting) return false;

    if (isSlotSelected(dayIndex, slotIndex)) {
      let startTime = { ...selectionStart };
      let endTime = { ...dragEnd, hour: dragEnd.hour + 1 };

      const potentialEvent = {
        startTime,
        endTime,
        id: "temp-conflict-check",
      };

      const conflicts = ScheduleUtil.findConflictingEvents(
        potentialEvent,
        events
      );
      return conflicts.length > 0;
    }
    return false;
  };

  const isSlotBlocked = (dayIndex, slotIndex) => {
    if (isSlotOutsideEventRange(dayIndex)) return true;

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

  // FIXED: Enhanced event finder for midnight events - supports multiple days
  const getEventInSlot = (dayIndex, hour, minute) => {
    const validEvents = events.filter((event) => {
      const isValid =
        event &&
        event.id &&
        event.startTime &&
        event.endTime &&
        typeof event.startTime.day === "number" &&
        typeof event.startTime.hour === "number" &&
        typeof event.endTime.day === "number" &&
        typeof event.endTime.hour === "number";
      return isValid;
    });

    const visibleEvent = validEvents.find((event) => {
      const eventStartDay = event.startTime.day;
      const eventStartMinutes = timeToMinutes(
        event.startTime.hour,
        event.startTime.minute || 0
      );
      const eventEndMinutes = timeToMinutes(
        event.endTime.hour,
        event.endTime.minute || 0
      );
      const slotMinutes = timeToMinutes(hour, minute);

      // Log midnight event for debugging
      logMidnightEvent(event, `checking slot ${dayIndex}:${hour}:${minute}`);

      if (event.is_midnight_passed) {
        // FIXED: Midnight events span two days
        if (dayIndex === eventStartDay) {
          // Day 1: Show from start time to end of day
          return slotMinutes >= eventStartMinutes;
        } else if (dayIndex === eventStartDay + 1) {
          // Day 2: Show from start of day to end time
          return slotMinutes < eventEndMinutes;
        }
        return false;
      } else {
        // Regular same-day events
        if (dayIndex !== eventStartDay) return false;
        return (
          slotMinutes >= eventStartMinutes && slotMinutes < eventEndMinutes
        );
      }
    });

    return visibleEvent;
  };

  // FIXED: Enhanced event display calculation for midnight events
  const getEventDisplayInfo = (event, dayIndex, slotIndex) => {
    if (!event || !event.startTime || !event.endTime) return null;

    const eventStartDay = event.startTime.day;
    const eventStartHour = event.startTime.hour;
    const eventStartMinute = event.startTime.minute || 0;
    const eventStartSlot = eventStartHour;

    // Check if event is blocked
    const blocked = isEventBlocked(event.id);

    logMidnightEvent(
      event,
      `calculating display info for day ${dayIndex}, slot ${slotIndex}`
    );

    if (event.is_midnight_passed) {
      // Day 1: Show from start time to midnight
      if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
        const duration = calculateDayOneDuration(event);
        const heightSlots = Math.max(1, Math.ceil(duration / 60));

        return {
          show: true,
          height: heightSlots,
          type: "midnight-day1",
          duration: duration,
          blocked: blocked, // Add blocked flag
        };
      }

      // Day 2: Show from midnight to end time
      if (dayIndex === eventStartDay + 1 && slotIndex === 0) {
        const duration = calculateDayTwoDuration(event);
        if (duration > 0) {
          const heightSlots = Math.max(1, Math.ceil(duration / 60));

          return {
            show: true,
            height: heightSlots,
            type: "midnight-day2",
            duration: duration,
            blocked: blocked, // Add blocked flag
          };
        }
      }
    } else {
      // Regular event display
      if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
        const eventEndMinutes = timeToMinutes(
          event.endTime.hour,
          event.endTime.minute || 0
        );
        const eventStartMinutes = timeToMinutes(
          eventStartHour,
          eventStartMinute
        );
        const durationMinutes = eventEndMinutes - eventStartMinutes;
        const heightSlots = Math.max(1, Math.ceil(durationMinutes / 60));
        return {
          show: true,
          height: heightSlots,
          type: "regular",
          blocked: blocked, // Add blocked flag
        };
      }
    }

    return { show: false };
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

  // NEW: Check if event is selected
  const isEventSelected = (event) => {
    return activeEventId === event.id || selectedEventId === event.id;
  };

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
      {/* Overlap message */}
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

      <div>
        {/* Time column */}
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

        {/* Days grid */}
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
                const isOutsideRange = isSlotOutsideEventRange(dayIndex);

                const selectionColorClass = isSelected
                  ? isSlotInConflict(dayIndex, slotIndex)
                    ? "bg-red-200 border-2 border-red-400 cursor-not-allowed"
                    : `${getSelectionColor(dayIndex)} cursor-pointer border-2 ${
                        getDaySpecificColors(dayIndex).border
                      }`
                  : "";

                return (
                  <div
                    key={`slot-${dayIndex}-${slotIndex}`}
                    className={`h-16 border-b border-gray-50 relative transition-colors select-none ${
                      isOutsideRange
                        ? "bg-gray-100 cursor-not-allowed opacity-50"
                        : isOccupied
                        ? "cursor-not-allowed"
                        : isSelected
                        ? selectionColorClass
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                    style={{ minHeight: "64px" }}
                    onMouseDown={() =>
                      !isOutsideRange && handleMouseDown(dayIndex, slotIndex)
                    }
                    onMouseEnter={() =>
                      !isOutsideRange && handleMouseEnter(dayIndex, slotIndex)
                    }
                  >
                    {/* FIXED: Enhanced event display with SELECTION STATE */}
                    {event && eventInfo.show && (
                      <div
                        className={`absolute inset-x-1 top-0 cursor-pointer transition-all duration-200 z-10 flex ${
                          eventInfo.blocked
                            ? "opacity-75 cursor-not-allowed" // Blocked styling
                            : isEventSelected(event)
                            ? "ring-4 ring-blue-400 ring-opacity-70 shadow-2xl scale-105"
                            : "hover:opacity-90 hover:shadow-lg"
                        }`}
                        style={{
                          height: Math.max(1, eventInfo.height) * 64 + "px",
                          minHeight: "64px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (eventInfo.blocked) {
                            message.warning(
                              "This time slot has active bookings and cannot be modified"
                            );
                            return;
                          }
                          setActiveEventId(event.id);
                          onEventClick(event, e);
                        }}
                        title={
                          eventInfo.blocked
                            ? "🔒 Locked - Has active bookings"
                            : getEventTooltip(event)
                        }
                      >
                        {/* Color bar with lock indication */}
                        <div
                          className={`rounded-l transition-all ${
                            eventInfo.blocked
                              ? "bg-gray-400" // Blocked color
                              : getEventColors(event, dayIndex).main
                          } ${isEventSelected(event) ? "w-2" : "w-1"}`}
                        ></div>

                        {/* Event content with lock overlay */}
                        <div
                          className={`flex-1 ${
                            eventInfo.blocked
                              ? "bg-gray-50 border-gray-300" // Blocked styling
                              : getEventColors(event, dayIndex).light
                          } ${
                            eventInfo.blocked
                              ? "border-gray-300"
                              : getEventColors(event, dayIndex).border
                          } border-l-0 border rounded-r p-2 overflow-hidden relative transition-all ${
                            isEventSelected(event)
                              ? "bg-opacity-100 border-2 border-blue-400"
                              : ""
                          }`}
                        >
                          {/* LOCK BADGE FOR BLOCKED EVENTS */}
                          {eventInfo.blocked && (
                            <div className="absolute top-1 right-1 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow-md z-20">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>LOCKED</span>
                            </div>
                          )}

                          {/* Midnight indicator */}
                          {event.is_midnight_passed && !eventInfo.blocked && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                          )}

                          {/* Event title */}
                          <div
                            className={`font-medium truncate text-sm leading-tight ${
                              eventInfo.blocked
                                ? "text-gray-600"
                                : getEventColors(event, dayIndex).text
                            }`}
                          >
                            {getEventDisplayText(event)}
                            {event.is_midnight_passed && (
                              <span className="text-xs ml-1 opacity-75">
                                {eventInfo.type === "midnight-day1"
                                  ? "(Day 1)"
                                  : eventInfo.type === "midnight-day2"
                                  ? "(Day 2)"
                                  : ""}
                              </span>
                            )}
                          </div>

                          {/* Event time */}
                          <div
                            className={`opacity-75 truncate text-xs leading-tight mt-1 ${
                              eventInfo.blocked
                                ? "text-gray-500"
                                : getEventColors(event, dayIndex).text
                            }`}
                          >
                            {eventInfo.type === "midnight-day1" && (
                              <span>
                                {formatTime(
                                  event.startTime.hour,
                                  event.startTime.minute || 0
                                )}{" "}
                                → Midnight
                              </span>
                            )}
                            {eventInfo.type === "midnight-day2" && (
                              <span>
                                Midnight →{" "}
                                {formatTime(
                                  event.endTime.hour,
                                  event.endTime.minute || 0
                                )}
                              </span>
                            )}
                            {eventInfo.type === "regular" && (
                              <span>
                                {formatTime(
                                  event.startTime.hour,
                                  event.startTime.minute || 0
                                )}
                              </span>
                            )}
                          </div>

                          {/* Duration info */}
                          {eventInfo.height > 1 && (
                            <div
                              className={`opacity-75 text-xs mt-1 ${
                                eventInfo.blocked
                                  ? "text-gray-500"
                                  : getEventColors(event, dayIndex).text
                              }`}
                            >
                              {event.is_midnight_passed ? (
                                <div className="space-y-1">
                                  <div className="text-orange-600 font-medium text-xs">
                                    {eventInfo.type === "midnight-day1"
                                      ? `${Math.floor(
                                          eventInfo.duration / 60
                                        )}h ${
                                          eventInfo.duration % 60
                                        }m to midnight`
                                      : eventInfo.type === "midnight-day2"
                                      ? `${Math.floor(
                                          eventInfo.duration / 60
                                        )}h ${
                                          eventInfo.duration % 60
                                        }m from midnight`
                                      : "Midnight Event"}
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  {ScheduleUtil.formatDuration(
                                    event.startTime,
                                    event.endTime
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Blocked message overlay */}
                          {eventInfo.blocked && eventInfo.height > 2 && (
                            <div className="absolute bottom-2 left-2 right-2 bg-red-50 border border-red-200 rounded px-2 py-1">
                              <p className="text-xs text-red-700 font-medium">
                                Has active bookings
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {isOutsideRange && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs text-gray-400 font-medium">
                          Outside Event Range
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

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
