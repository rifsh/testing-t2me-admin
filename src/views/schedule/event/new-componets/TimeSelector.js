import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  generateTimeSlots,
  ScheduleUtil,
  formatTime,
  timeToMinutes,
} from "../utils";
import { message, Modal } from "antd";
import { Dropdown, Menu } from "antd";
import { MoreVertical, Copy, Trash2, Edit } from "lucide-react";
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
  onEventDelete,
}) => {
  const timeSlots = generateTimeSlots();
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [overlapMessage, setOverlapMessage] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [menuVisible, setMenuVisible] = useState({});
  const isEventBlocked = (eventId) => {
    return blockedEventIds.has(eventId);
  };
  const debugSlotRange = (hour) => {
    if (hour >= 0 && hour < 6) {
      console.log(`🌅 Early morning slot ${hour}:00`, {
        slotMinutes: timeToMinutes(hour, 0),
        description: hour === 0 ? "Midnight/Start of Day 2" : "Early morning",
      });
    }
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
  const handleApplyToAll = (event, dayIndex) => {
    if (isEventBlocked(event.id)) {
      message.error("Cannot apply: This time slot is locked");
      return;
    }

    Modal.confirm({
      title: "Apply to All Days",
      content: (
        <div className="py-2">
          <p>
            Do you want to apply this time slot{" "}
            <strong>
              {formatTime(event.startTime.hour, event.startTime.minute || 0)} -{" "}
              {formatTime(event.endTime.hour, event.endTime.minute || 0)}
            </strong>{" "}
            to all days in the schedule?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Days with conflicting time slots will be skipped automatically.
          </p>
        </div>
      ),
      okText: "Yes, Apply to All",
      cancelText: "Cancel",
      onOk: () => {
        if (onApplyToAll) {
          // ✅ FIX: Pass complete template event with ALL fields
          const templateEvent = {
            startTime: {
              hour: event.startTime.hour,
              minute: event.startTime.minute || 0,
              day: 0,
            },
            endTime: {
              hour: event.endTime.hour,
              minute: event.endTime.minute || 0,
              day: event.is_midnight_passed || event.ismidnightpassed ? 1 : 0,
            },
            // ✅ Copy ALL ticket/seat fields (both field name variations)
            ticketType:
              event.ticketType ||
              event.ticket_structure_id ||
              event.ticketstructureid,
            ticket_structure_id:
              event.ticket_structure_id ||
              event.ticketstructureid ||
              event.ticketType,
            ticketstructureid:
              event.ticket_structure_id ||
              event.ticketstructureid ||
              event.ticketType,
            ticket_set: event.ticket_set || event.ticketset,
            ticketset: event.ticket_set || event.ticketset,
            seat_structure_id: event.seat_structure_id || event.seatstructureid,
            seatstructureid: event.seat_structure_id || event.seatstructureid,
            is_midnight_passed:
              event.is_midnight_passed || event.ismidnightpassed || false,
            ismidnightpassed:
              event.is_midnight_passed || event.ismidnightpassed || false,
            show_end_date: event.show_end_date || event.showenddate,
            showenddate: event.show_end_date || event.showenddate,
            // ✅ Copy offer and coupon IDs
            offer_ids: event.offer_ids || event.offerids || [],
            offerids: event.offer_ids || event.offerids || [],
            coupon_ids: event.coupon_ids || event.couponids || [],
            couponids: event.coupon_ids || event.couponids || [],
          };

          console.log("✅ Applying template to all days:", templateEvent);
          onApplyToAll(templateEvent);
          // message.success(
          //   "Time slot configuration will be applied to all available days!"
          // );
        }
      },
    });
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
  // In TimeSelector component - Fix the midnight event display calculation
  const calculateDayOneDuration = (event) => {
    const startMinutes = timeToMinutes(
      event.startTime.hour,
      event.startTime.minute || 0
    );
    const midnightMinutes = 24 * 60; // End of day
    return midnightMinutes - startMinutes;
  };

  const calculateDayTwoDuration = (event) => {
    // For midnight events, day 2 duration is from 00:00 to end time
    const endMinutes = timeToMinutes(
      event.endTime.hour,
      event.endTime.minute || 0
    );

    console.log(`🌙 Calculating Day 2 duration:`, {
      eventId: event.id,
      endHour: event.endTime.hour,
      endMinute: event.endTime.minute || 0,
      endMinutes,
      duration: `${Math.floor(endMinutes / 60)}h ${endMinutes % 60}m`,
    });

    // Duration is simply the end time in minutes (from midnight)
    return endMinutes;
  };

  const getEventDisplayInfo = (event, dayIndex, slotIndex) => {
    const normalizedEvent = normalizeEventFields(event);

    const eventStartHour = normalizedEvent.startTime.hour;
    const eventStartMinute = normalizedEvent.startTime.minute || 0;
    const eventStartDay = normalizedEvent.startTime.day;
    const eventEndDay = normalizedEvent.endTime.day;

    // ✅ FIX: Use exact hour matching for start slot
    const eventStartSlot = eventStartHour;

    const blocked = isEventBlocked(normalizedEvent.id);
    const isMidnight = normalizedEvent.is_midnight_passed;

    console.log(`📊 getEventDisplayInfo: Event ${normalizedEvent.id}`, {
      dayIndex,
      slotIndex,
      eventStartDay,
      eventEndDay,
      eventStartSlot,
      eventStartHour,
      isMidnight,
      shouldShowHere:
        dayIndex === eventStartDay && slotIndex === eventStartSlot,
    });

    if (isMidnight) {
      // ✅ Day 1: Show ONLY at start slot
      if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
        const duration = calculateDayOneDuration(normalizedEvent);
        const heightSlots = Math.max(1, Math.ceil(duration / 60));

        console.log(
          `✅ Displaying midnight Day 1 - Height: ${heightSlots} slots`
        );

        return {
          show: true,
          height: heightSlots,
          type: "midnight-day1",
          duration: duration,
          blocked: blocked,
        };
      }

      // ✅ Day 2: Show ONLY at slot 0 (midnight)
      if (dayIndex === eventEndDay && slotIndex === 0) {
        const duration = calculateDayTwoDuration(normalizedEvent);
        if (duration > 0) {
          const heightSlots = Math.max(1, Math.ceil(duration / 60));

          console.log(
            `✅ Displaying midnight Day 2 - Height: ${heightSlots} slots, Duration: ${duration}min`
          );

          return {
            show: true,
            height: heightSlots,
            type: "midnight-day2",
            duration: duration,
            blocked: blocked,
          };
        }
      }
    } else {
      // ✅ Regular event: Show ONLY at start slot
      if (dayIndex === eventStartDay && slotIndex === eventStartSlot) {
        const eventEndMinutes = timeToMinutes(
          normalizedEvent.endTime.hour,
          normalizedEvent.endTime.minute || 0
        );
        const eventStartMinutes = timeToMinutes(
          eventStartHour,
          eventStartMinute
        );
        const durationMinutes = eventEndMinutes - eventStartMinutes;

        const heightSlots = Math.max(1, Math.ceil(durationMinutes / 60));

        console.log(
          `✅ Displaying regular event - Height: ${heightSlots} slots`
        );

        return {
          show: true,
          height: heightSlots,
          type: "regular",
          blocked: blocked,
        };
      }
    }

    // ✅ Don't show in other slots (they're occupied but not rendered)
    return { show: false };
  };

  const normalizeEventFields = (event) => {
    // Normalize midnight field
    const isMidnight =
      event.is_midnight_passed === true ||
      event.ismidnightpassed === true ||
      event.ismidnight === true;

    return {
      ...event,
      is_midnight_passed: isMidnight,
      ismidnightpassed: isMidnight,
      ismidnight: isMidnight,
      // Normalize ticket fields
      ticket_structure_id:
        event.ticket_structure_id ||
        event.ticketstructureid ||
        event.ticketType,
      ticketstructureid:
        event.ticket_structure_id ||
        event.ticketstructureid ||
        event.ticketType,
      ticketType:
        event.ticket_structure_id ||
        event.ticketstructureid ||
        event.ticketType,
      // Normalize seat fields
      seat_structure_id: event.seat_structure_id || event.seatstructureid,
      seatstructureid: event.seat_structure_id || event.seatstructureid,
      // Normalize ticket set
      ticket_set: event.ticket_set || event.ticketset,
      ticketset: event.ticket_set || event.ticketset,
    };
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

  const getEventInSlot = (dayIndex, hour, minute) => {
    // Filter and normalize valid events
    const validEvents = events
      .filter((event) => {
        const isValid =
          event &&
          event.id &&
          event.startTime &&
          event.endTime &&
          typeof event.startTime.day === "number" &&
          typeof event.startTime.hour === "number" &&
          typeof event.endTime.day === "number" &&
          typeof event.endTime.hour === "number";

        if (!isValid) {
          console.warn("❌ Invalid event structure:", event);
        }

        return isValid;
      })
      .map(normalizeEventFields);

    const slotMinutes = timeToMinutes(hour, minute);

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

      const isMidnight = event.is_midnight_passed;

      // ✅ FIX: Improved midnight event detection
      if (isMidnight) {
        // Day 1: From start time until end of day (23:59)
        if (dayIndex === eventStartDay) {
          // Must be at or after start time
          const isAfterStart = slotMinutes >= eventStartMinutes;
          // Must be before midnight (1440 minutes)
          const isBeforeMidnight = slotMinutes < 1440;

          if (isAfterStart && isBeforeMidnight) {
            console.log(
              `✅ Midnight Day 1 match: Event ${event.id} at ${hour}:${minute}`,
              {
                slotMinutes,
                eventStartMinutes,
                range: `${eventStartMinutes}-1439`,
              }
            );
            return true;
          }
        }

        // Day 2: From midnight (00:00) until end time
        if (dayIndex === eventEndDay) {
          // ✅ CRITICAL FIX: Handle early morning times correctly
          // For early morning (0-5 AM), this is the continuation from previous day
          const isAfterMidnight = slotMinutes >= 0;
          const isBeforeEnd = slotMinutes < eventEndMinutes;

          if (isAfterMidnight && isBeforeEnd) {
            console.log(
              `✅ Midnight Day 2 match: Event ${event.id} at ${hour}:${minute}`,
              {
                slotMinutes,
                eventEndMinutes,
                range: `0-${eventEndMinutes}`,
              }
            );
            return true;
          }
        }

        return false;
      } else {
        // ✅ FIX: Regular same-day events (NOT crossing midnight)
        if (dayIndex !== eventStartDay) return false;

        // Event must be on same day AND end before midnight
        const isInRange =
          slotMinutes >= eventStartMinutes && slotMinutes < eventEndMinutes;

        // ✅ CRITICAL: Ensure end time is also on same day (not crossing midnight)
        const endsOnSameDay = eventEndDay === eventStartDay;

        if (isInRange && endsOnSameDay) {
          console.log(
            `✅ Regular event match: Event ${event.id} at ${hour}:${minute}`,
            {
              slotMinutes,
              eventStartMinutes,
              eventEndMinutes,
              range: `${eventStartMinutes}-${eventEndMinutes}`,
            }
          );
          return true;
        }

        return false;
      }
    });

    return visibleEvent;
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
  const getEventMenu = (event, dayIndex) => {
    const isBlocked = isEventBlocked(event.id);

    return (
      <Menu
        onClick={({ key, domEvent }) => {
          domEvent.stopPropagation();
          setMenuVisible({ ...menuVisible, [event.id]: false });

          switch (key) {
            case "edit":
              if (!isBlocked) {
                onEventClick(event, domEvent);
              } else {
                message.warning(
                  "This time slot is locked and cannot be edited"
                );
              }
              break;
            case "apply":
              if (!isBlocked) {
                handleApplyToAll(event, dayIndex);
              } else {
                message.error("Cannot apply: This time slot is locked");
              }
              break;
            case "delete":
              if (!isBlocked) {
                Modal.confirm({
                  title: "Delete Time Slot",
                  content: "Are you sure you want to delete this time slot?",
                  okText: "Delete",
                  cancelText: "Cancel",
                  okButtonProps: { danger: true },
                  onOk: () => {
                    // FIXED: Use the onEventDelete prop that's passed to the component
                    if (onEventDelete) {
                      onEventDelete(event.id);
                      message.success("Time slot deleted successfully!");
                    } else {
                      message.error("Delete function not available");
                    }
                  },
                });
              } else {
                message.error(
                  "Cannot delete: This time slot has active bookings"
                );
              }
              break;
          }
        }}
      >
        <Menu.Item key="edit" icon={<Edit size={14} />} disabled={isBlocked}>
          Edit Details
        </Menu.Item>
        <Menu.Item key="apply" icon={<Copy size={14} />} disabled={isBlocked}>
          Apply to All Days
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          key="delete"
          icon={<Trash2 size={14} />}
          danger
          disabled={isBlocked}
        >
          Delete Time Slot
        </Menu.Item>
      </Menu>
    );
  };

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

                // ✅ Add debug for early morning slots
                if (dayIndex === 0 && slot.hour < 6) {
                  debugSlotRange(slot.hour);
                }

                const isSelected = isSlotSelected(dayIndex, slotIndex);
                const isBlocked = isSlotBlocked(dayIndex, slotIndex);
                const isOccupied = !!event || isBlocked;
                const eventInfo = event
                  ? getEventDisplayInfo(event, dayIndex, slotIndex)
                  : { show: false };
                const isOutsideRange = isSlotOutsideEventRange(dayIndex);

                // ✅ Log when event should show but isn't
                if (event && !eventInfo.show && slot.hour < 6) {
                  console.error(
                    `❌ Event ${event.id} should display but show=false`,
                    {
                      dayIndex,
                      slotIndex,
                      slotHour: slot.hour,
                      eventStartDay: event.startTime.day,
                      eventStartHour: event.startTime.hour,
                      eventEndDay: event.endTime.day,
                      eventEndHour: event.endTime.hour,
                      isMidnight: event.is_midnight_passed,
                    }
                  );
                }
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
                            ? "opacity-75 cursor-not-allowed"
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
                        {/* Color bar */}
                        <div
                          className={`rounded-l transition-all ${
                            eventInfo.blocked
                              ? "bg-gray-400"
                              : getEventColors(event, dayIndex).main
                          } ${isEventSelected(event) ? "w-2" : "w-1"}`}
                        ></div>

                        {/* Event content */}
                        <div
                          className={`flex-1 ${
                            eventInfo.blocked
                              ? "bg-gray-50 border-gray-300"
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
                          {/* Menu Button - TOP RIGHT */}
                          <Dropdown
                            overlay={getEventMenu(event, dayIndex)}
                            trigger={["click"]}
                            placement="bottomRight"
                            open={menuVisible[event.id]}
                            onOpenChange={(visible) => {
                              setMenuVisible({
                                ...menuVisible,
                                [event.id]: visible,
                              });
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMenuVisible({
                                  ...menuVisible,
                                  [event.id]: true,
                                });
                              }}
                              className={`absolute top-1 right-1 p-1 rounded hover:bg-white/80 transition-all z-30 ${
                                eventInfo.blocked
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="More options"
                            >
                              <MoreVertical
                                size={16}
                                className={
                                  eventInfo.blocked
                                    ? "text-gray-500"
                                    : getEventColors(event, dayIndex).text
                                }
                              />
                            </button>
                          </Dropdown>

                          {/* Lock Badge */}
                          {eventInfo.blocked && (
                            <div className="absolute top-1 right-8 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold flex items-center space-x-1 shadow-md z-20">
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
                            className={`font-medium truncate text-sm leading-tight pr-6 ${
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
