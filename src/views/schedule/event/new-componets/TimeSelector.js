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
}) => {
  const timeSlots = generateTimeSlots();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [overlapMessage, setOverlapMessage] = useState(null);

  // FIXED: Enhanced monitoring for midnight events
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

    // Log event info calculation
    logMidnightEvent(
      event,
      `calculating display info for day ${dayIndex}, slot ${slotIndex}`
    );

    if (event.is_midnight_passed) {
      // FIXED: Display midnight events across two days

      // Day 1: Show from start time to midnight
      if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
        const duration = calculateDayOneDuration(event);
        const heightSlots = Math.max(1, Math.ceil(duration / 60));

        console.log(`🌙 DAY 1 DISPLAY:`, {
          dayIndex,
          slotIndex,
          duration,
          heightSlots,
          startTime: `${eventStartHour}:${String(eventStartMinute).padStart(
            2,
            "0"
          )}`,
        });

        return {
          show: true,
          height: heightSlots,
          type: "midnight-day1",
          duration: duration,
        };
      }

      // Day 2: Show from midnight to end time
      if (dayIndex === eventStartDay + 1 && slotIndex === 0) {
        const duration = calculateDayTwoDuration(event);
        if (duration > 0) {
          const heightSlots = Math.max(1, Math.ceil(duration / 60));

          console.log(`🌙 DAY 2 DISPLAY:`, {
            dayIndex,
            slotIndex,
            duration,
            heightSlots,
            endTime: `${event.endTime.hour}:${String(
              event.endTime.minute || 0
            ).padStart(2, "0")}`,
          });

          return {
            show: true,
            height: heightSlots,
            type: "midnight-day2",
            duration: duration,
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
        return { show: true, height: heightSlots, type: "regular" };
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
                    {/* FIXED: Enhanced event display for midnight events */}
                    {event && eventInfo.show && (
                      <div
                        className="absolute inset-x-1 top-0 cursor-pointer hover:opacity-90 transition-opacity z-10 flex"
                        style={{
                          height: Math.max(1, eventInfo.height) * 64 + "px",
                          minHeight: "64px",
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event, e);
                        }}
                        title={getEventTooltip(event)}
                      >
                        <div
                          className={`w-1 rounded-l ${
                            getEventColors(event, dayIndex).main
                          }`}
                        ></div>
                        <div
                          className={`flex-1 ${
                            getEventColors(event, dayIndex).light
                          } ${
                            getEventColors(event, dayIndex).border
                          } border-l-0 border rounded-r p-2 overflow-hidden relative`}
                        >
                          {/* FIXED: Add midnight indicator with day info */}
                          {event.is_midnight_passed && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-600"></div>
                          )}

                          <div
                            className={`font-medium truncate text-sm leading-tight ${
                              getEventColors(event, dayIndex).text
                            }`}
                          >
                            {getEventDisplayText(event)}
                            {/* FIXED: Show which part of midnight event */}
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

                          <div
                            className={`opacity-75 truncate text-xs leading-tight mt-1 ${
                              getEventColors(event, dayIndex).text
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

                          {eventInfo.height > 1 && (
                            <div
                              className={`opacity-75 text-xs mt-1 ${
                                getEventColors(event, dayIndex).text
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
                        </div>
                      </div>
                    )}

                    {/* Show blocked overlay for outside event range */}
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
