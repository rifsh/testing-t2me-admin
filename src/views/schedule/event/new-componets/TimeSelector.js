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
  multiDateSelectionEnabled = false,
  onMultiDateTimeSlot = null,
  dayColors = [],
  getColorForDay,
  ticketOptionsMap = {},
  ticketSetOptionsMap = {},
  seatStructureOptionsMap = {},
}) => {
  const timeSlots = generateTimeSlots();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [overlapMessage, setOverlapMessage] = useState(null);

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
    if (event.isBlocked || event.type === "blocked" || event.isMultiDay) {
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

    if (event.seat_structure_id && seatStructureOptionsMap[event.seat_structure_id]) {
      return seatStructureOptionsMap[event.seat_structure_id];
    }

    if (event.ticketType) {
      return `Ticket: ${event.ticketType}`;
    }
    
    if (event.ticketSet) {
      return `Set: ${event.ticketSet}`;
    }

    if (event.seat_structure_id) {
      return `Seat: ${event.seat_structure_id}`;
    }

    if (event.isMultiDay) return "Multi-day";
    if (event.type === "blocked") return "Blocked";
    
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
      const name = seatStructureOptionsMap[event.seat_structure_id] || event.seat_structure_id;
      details.push(`Seats: ${name}`);
    }
    
    const timeRange = `${formatTime(
      event.startTime.hour,
      event.startTime.minute || 0
    )} to ${formatTime(
      event.endTime.hour,
      event.endTime.minute || 0
    )}`;
    details.push(timeRange);
    
    return details.join(' | ');
  };

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

      const wouldBeMultiDay = startTime.day !== endTime.day;

      if (wouldBeMultiDay && !multiDateSelectionEnabled) {
        setOverlapMessage({
          type: "warning",
          message:
            "Multi-day selection disabled. Enable multi-date selection to span multiple days.",
        });
        return;
      } else {
        if (overlapMessage && overlapMessage.type === "warning") {
          setOverlapMessage(null);
        }
      }

      const potentialEvent = {
        startTime: startTime.day <= endTime.day ? startTime : endTime,
        endTime: startTime.day <= endTime.day ? endTime : startTime,
        id: "temp-drag-preview",
      };

      const conflictingEvents = ScheduleUtil.findConflictingEvents(
        potentialEvent,
        events
      );

      if (conflictingEvents.length > 0) {
        setOverlapMessage({
          type: "warning",
          message: `Selection would overlap with ${conflictingEvents.length} existing event(s)`,
        });
      } else if (overlapMessage && overlapMessage.message.includes("overlap")) {
        setOverlapMessage(null);
      }
    }

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

      if (endTime.hour >= 24) {
        endTime.day += Math.floor(endTime.hour / 24);
        endTime.hour = endTime.hour % 24;
      }

      const startMinutes =
        startTime.day * 1440 + timeToMinutes(startTime.hour, startTime.minute);
      const endMinutes =
        endTime.day * 1440 + timeToMinutes(endTime.hour, endTime.minute);

      if (startMinutes >= endMinutes) {
        const temp = { ...startTime };
        startTime = { ...endTime };
        endTime = { ...temp };
      }

      const isMultiDay = startTime.day !== endTime.day;

      if (isMultiDay && !multiDateSelectionEnabled) {
        setOverlapMessage({
          type: "error",
          message:
            "Multi-day selections are disabled. Enable multi-date selection to create events spanning multiple days.",
        });

        if (onOverlapWarning) {
          onOverlapWarning(
            "Cannot create multi-day event: Multi-date selection is disabled",
            []
          );
        }

        setIsSelecting(false);
        setSelectionStart(null);
        setDragEnd(null);
        setTimeout(() => setOverlapMessage(null), 4000);
        return;
      }

      const newEvent = {
        startTime,
        endTime,
        id: `temp-${Date.now()}`,
      };

      if (isMultiDay && multiDateSelectionEnabled) {
        newEvent.isMultiDay = true;
        newEvent.type = "blocked";

        const conflictingEvents = ScheduleUtil.findConflictingEvents(
          newEvent,
          events
        );

        if (conflictingEvents.length > 0) {
          const conflictMessage = `Cannot create multi-day event: overlaps with ${conflictingEvents.length} existing event(s) across multiple days`;
          setOverlapMessage({
            type: "error",
            message: conflictMessage,
          });

          if (onOverlapWarning) {
            onOverlapWarning(conflictMessage, conflictingEvents);
          }

          setTimeout(() => setOverlapMessage(null), 4000);
        } else {
          if (onMultiDateTimeSlot) {
            onMultiDateTimeSlot(newEvent);
          } else {
            onTimeSlotSelect(newEvent);
          }
          message.success("Multi-day time slot created successfully!");
        }
      } else {
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

  const getSelectionColor = (dayIndex) => {
    const colors = getDaySpecificColors(dayIndex);
    return colors.light.replace('bg-', 'bg-').replace('-50', '-200');
  };

  const isSlotSelected = (dayIndex, slotIndex) => {
    if (!selectionStart || !dragEnd || !isSelecting) {
      return false;
    }

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

  const isSlotInConflict = (dayIndex, slotIndex) => {
    if (!selectionStart || !dragEnd || !isSelecting) return false;

    if (isSlotSelected(dayIndex, slotIndex)) {
      let startTime = { ...selectionStart };
      let endTime = { ...dragEnd, hour: dragEnd.hour + 1 };

      const potentialEvent = {
        startTime: startTime.day <= endTime.day ? startTime : endTime,
        endTime: startTime.day <= endTime.day ? endTime : startTime,
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

      if (dayIndex < eventStartDay || dayIndex > eventEndDay) return false;

      if (eventStartDay === eventEndDay) {
        return (
          dayIndex === eventStartDay &&
          slotMinutes >= eventStartMinutes &&
          slotMinutes < eventEndMinutes
        );
      } else {
        if (dayIndex === eventStartDay) {
          return slotMinutes >= eventStartMinutes;
        } else if (dayIndex === eventEndDay) {
          return slotMinutes < eventEndMinutes;
        } else {
          return dayIndex > eventStartDay && dayIndex < eventEndDay;
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

    if (
      event.isMultiDay &&
      dayIndex > eventStartDay &&
      dayIndex <= eventEndDay
    ) {
      if (dayIndex < eventEndDay) {
        return { show: true, height: 24 };
      } else if (dayIndex === eventEndDay && slotIndex === 0) {
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

      <div className="absolute top-4 right-4 z-40 bg-blue-50 border border-blue-200 rounded-lg p-2">
        <div className="text-xs text-blue-700 font-medium">
          {multiDateSelectionEnabled
            ? "📅 Multi-day Selection Enabled"
            : "📅 Single Day Selection Only"}
        </div>
      </div>

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

              const selectionColorClass = isSelected 
                ? isSlotInConflict(dayIndex, slotIndex)
                  ? "bg-red-200 border-2 border-red-400 cursor-not-allowed"
                  : getSelectionColor(dayIndex) + " cursor-pointer border-2 " + getDaySpecificColors(dayIndex).border
                : "";

              return (
                <div
                  key={`slot-${dayIndex}-${slotIndex}`}
                  className={`h-16 border-b border-gray-50 relative transition-colors select-none ${
                    isOccupied
                      ? "cursor-not-allowed"
                      : isSelected
                      ? selectionColorClass
                      : "hover:bg-gray-50 cursor-pointer"
                  }`}
                  style={{ minHeight: "64px" }}
                  onMouseDown={() => handleMouseDown(dayIndex, slotIndex)}
                  onMouseEnter={() => handleMouseEnter(dayIndex, slotIndex)}
                >
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
                      title={getEventTooltip(event)}
                    >
                      <div
                        className={`w-1 rounded-l ${
                          getEventColors(event, dayIndex).main
                        }`}
                      />
                      <div
                        className={`flex-1 ${getEventColors(event, dayIndex).light} ${
                          getEventColors(event, dayIndex).border
                        } border-l-0 border rounded-r p-2 overflow-hidden`}
                      >
                        <div
                          className={`font-medium truncate text-sm leading-tight ${
                            getEventColors(event, dayIndex).text
                          }`}
                        >
                          {getEventDisplayText(event)}
                        </div>
                        
                        <div
                          className={`opacity-75 truncate text-xs leading-tight mt-1 ${
                            getEventColors(event, dayIndex).text
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
                              getEventColors(event, dayIndex).text
                            }`}
                          >
                            {event.ticketType && event.ticketSet && ticketSetOptionsMap[event.ticketSet] ? (
                              <div className="truncate">
                                {ticketSetOptionsMap[event.ticketSet]}
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
                </div>
              );
            })}
          </div>
        ))}
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
