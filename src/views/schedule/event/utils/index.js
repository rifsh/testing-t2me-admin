//utils
export const getDaysInMonth = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const days = [];

  // Previous month days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(
      year,
      month - 1,
      new Date(year, month, 0).getDate() - i
    );
    days.push({
      date: date.getDate(),
      fullDate: date,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date: i,
      fullDate: date,
      isCurrentMonth: true,
    });
  }

  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date: i,
      fullDate: date,
      isCurrentMonth: false,
    });
  }

  return days;
};

export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const isDateInRange = (date, startDate, endDate) => {
  if (!startDate || !endDate) return false;
  return date >= startDate && date <= endDate;
};

// FIXED: Get consistent colors for events
export const getEventColors = (event) => {
  if (event.isBlocked || event.type === "blocked" || event.isMultiDay) {
    return {
      main: "bg-orange-500",
      light: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-700",
    };
  }

  const colorMap = {
    meeting: {
      main: "bg-blue-500",
      light: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
    },
    task: {
      main: "bg-green-500",
      light: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
    },
    reminder: {
      main: "bg-yellow-500",
      light: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
    },
    personal: {
      main: "bg-purple-500",
      light: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-700",
    },
    urgent: {
      main: "bg-red-500",
      light: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
    },
  };

  return colorMap[event.type] || colorMap.meeting;
};
export const generateDayColors = () => {
  return [
    "bg-red-500 border-red-600",
    "bg-blue-500 border-blue-600",
    "bg-green-500 border-green-600",
    "bg-yellow-500 border-yellow-600",
    "bg-purple-500 border-purple-600",
    "bg-pink-500 border-pink-600",
    "bg-indigo-500 border-indigo-600",
  ];
};

export const getTypeColor = (type) => {
  const colorMap = {
    meeting: "bg-blue-500 border-blue-600",
    task: "bg-green-500 border-green-600",
    reminder: "bg-yellow-500 border-yellow-600",
    personal: "bg-purple-500 border-purple-600",
    urgent: "bg-red-500 border-red-600",
  };

  return colorMap[type] || colorMap.meeting;
};

// Other existing utility functions...
export const formatTime = (hour, minute = 0) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, "0");
  return `${displayHour}:${displayMinute} ${period}`;
};

export const timeToMinutes = (hour, minute) => {
  return hour * 60 + minute;
};

export const getDaysDiff = (startDate, endDate) => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      minute: 0,
      time12: formatTime(hour, 0),
      isHourMark: true,
    });
  }
  return slots;
};

// FIXED: Enhanced ScheduleUtil with proper Apply to All functionality
export const ScheduleUtil = {
  checkConflict: (newEvent, existingEvents, excludeId = null) => {
    return existingEvents.some((event) => {
      if (!event.startTime || !event.endTime || event.id === excludeId)
        return false;

      // Handle multi-day events properly
      const newStartDay = newEvent.startTime.day;
      const newEndDay = newEvent.endTime.day;
      const existingStartDay = event.startTime.day;
      const existingEndDay = event.endTime.day;

      // Check if days overlap
      const dayOverlap = !(
        newEndDay < existingStartDay || newStartDay > existingEndDay
      );
      if (!dayOverlap) return false;

      // If days overlap, check time overlap
      const newStart = timeToMinutes(
        newEvent.startTime.hour,
        newEvent.startTime.minute || 0
      );
      const newEnd = timeToMinutes(
        newEvent.endTime.hour,
        newEvent.endTime.minute || 0
      );
      const existingStart = timeToMinutes(
        event.startTime.hour,
        event.startTime.minute || 0
      );
      const existingEnd = timeToMinutes(
        event.endTime.hour,
        event.endTime.minute || 0
      );

      return newStart < existingEnd && newEnd > existingStart;
    });
  },

  // FIXED: Enhanced conflict detection that properly excludes deleted events
  findConflictingEvents: (newEvent, existingEvents, excludeId = null) => {
    console.log("=== CONFLICT DETECTION DEBUG ===");
    console.log("Checking conflicts for:", {
      newEventId: newEvent.id,
      existingEventsCount: existingEvents.length,
      excludeId: excludeId,
    });

    // CRITICAL FIX: Ensure we're working with current events only
    const currentEvents = existingEvents.filter((event) => {
      const isValid = event && event.id && event.startTime && event.endTime;
      const isNotExcluded = event.id !== excludeId;
      const isNotSameEvent = event.id !== newEvent.id;

      if (!isValid) {
        console.log("Filtering out invalid event:", event?.id);
      }
      if (!isNotExcluded) {
        console.log("Filtering out excluded event:", event?.id);
      }
      if (!isNotSameEvent) {
        console.log("Filtering out same event:", event?.id);
      }

      return isValid && isNotExcluded && isNotSameEvent;
    });

    console.log("Valid events for conflict check:", currentEvents.length);

    const conflictingEvents = currentEvents.filter((event) => {
      // ENHANCED: Better multi-day conflict detection
      const newStartDay = newEvent.startTime.day;
      const newEndDay = newEvent.endTime.day;
      const existingStartDay = event.startTime.day;
      const existingEndDay = event.endTime.day;

      // Check if days overlap
      const dayOverlap = !(
        newEndDay < existingStartDay || newStartDay > existingEndDay
      );
      if (!dayOverlap) {
        console.log(`No day overlap between new event and ${event.id}`);
        return false;
      }

      console.log(`Day overlap detected between new event and ${event.id}`);

      // ENHANCED: Handle same-day vs multi-day time conflicts
      if (
        newStartDay === newEndDay &&
        existingStartDay === existingEndDay &&
        newStartDay === existingStartDay
      ) {
        // Both single-day events on same day
        const newStart = timeToMinutes(
          newEvent.startTime.hour,
          newEvent.startTime.minute || 0
        );
        const newEnd = timeToMinutes(
          newEvent.endTime.hour,
          newEvent.endTime.minute || 0
        );
        const existingStart = timeToMinutes(
          event.startTime.hour,
          event.startTime.minute || 0
        );
        const existingEnd = timeToMinutes(
          event.endTime.hour,
          event.endTime.minute || 0
        );

        const hasTimeOverlap = newStart < existingEnd && newEnd > existingStart;
        console.log(
          `Single-day time overlap check for ${event.id}:`,
          hasTimeOverlap
        );
        return hasTimeOverlap;
      } else {
        // Multi-day conflict detection
        for (
          let day = Math.max(newStartDay, existingStartDay);
          day <= Math.min(newEndDay, existingEndDay);
          day++
        ) {
          // For each overlapping day, check time conflicts
          const newStartOnDay =
            day === newStartDay
              ? timeToMinutes(
                  newEvent.startTime.hour,
                  newEvent.startTime.minute || 0
                )
              : 0;
          const newEndOnDay =
            day === newEndDay
              ? timeToMinutes(
                  newEvent.endTime.hour,
                  newEvent.endTime.minute || 0
                )
              : 1440;

          const existingStartOnDay =
            day === existingStartDay
              ? timeToMinutes(event.startTime.hour, event.startTime.minute || 0)
              : 0;
          const existingEndOnDay =
            day === existingEndDay
              ? timeToMinutes(event.endTime.hour, event.endTime.minute || 0)
              : 1440;

          if (
            newStartOnDay < existingEndOnDay &&
            newEndOnDay > existingStartOnDay
          ) {
            console.log(
              `Multi-day time overlap found for ${event.id} on day ${day}`
            );
            return true; // Conflict found
          }
        }
        return false;
      }
    });

    console.log("Final conflicts found:", conflictingEvents.length);
    console.log("=== END CONFLICT DETECTION DEBUG ===");

    return conflictingEvents;
  },

  validateTimeSlot: (startTime, endTime) => {
    const start = timeToMinutes(startTime.hour, startTime.minute || 0);
    const end = timeToMinutes(endTime.hour, endTime.minute || 0);

    // Handle cross-day events
    let adjustedEnd = end;
    if (endTime.day > startTime.day) {
      adjustedEnd = end + (endTime.day - startTime.day) * 24 * 60;
    }

    if (start >= adjustedEnd) {
      return { valid: false, error: "End time must be after start time" };
    }

    if (adjustedEnd - start < 60) {
      return { valid: false, error: "Event must be at least 1 hour long" };
    }

    return { valid: true };
  },

  formatDuration: (startTime, endTime) => {
    let start = timeToMinutes(startTime.hour, startTime.minute || 0);
    let end = timeToMinutes(endTime.hour, endTime.minute || 0);

    // Handle multi-day events
    if (endTime.day > startTime.day) {
      end += (endTime.day - startTime.day) * 24 * 60;
    }

    const duration = end - start;

    if (duration < 60) {
      return `${duration}m`;
    }

    const days = Math.floor(duration / (24 * 60));
    const remainingMinutes = duration % (24 * 60);
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = remainingMinutes % 60;

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m`;

    return result.trim() || "0m";
  },

  groupEventsByType: (events) => {
    return events.reduce((groups, event) => {
      const type = event.type || "meeting";
      if (!groups[type]) groups[type] = [];
      groups[type].push(event);
      return groups;
    }, {});
  },

  // FIXED Enhanced Apply to All with proper validation
  applyToAllDays: (templateEvent, allDays, existingEvents, options = {}) => {
    const {
      forceOverwrite = false,
      skipConflicts = true,
      multiDateEnabled = false, // NEW: respect multi-date setting
    } = options;

    const newEvents = [];
    const conflicts = [];
    const overwritten = [];
    const skipped = [];

    console.log("APPLY TO ALL DEBUG");
    console.log("Template Event:", templateEvent);
    console.log("Total Days:", allDays.length);
    console.log("Existing Events:", existingEvents.length);
    console.log("Multi-date Enabled:", multiDateEnabled);
    console.log("Options:", options);

    // Check if template is multi-day
    const isMultiDay =
      templateEvent.startTime.day !== templateEvent.endTime.day;
    const daySpan = templateEvent.endTime.day - templateEvent.startTime.day;

    console.log("Multi-day event:", isMultiDay, "Day span:", daySpan);

    // CRITICAL FIX: Prevent multi-day application when multi-date is disabled
    if (isMultiDay && !multiDateEnabled) {
      console.log("BLOCKED: Multi-day event but multi-date disabled");
      return {
        newEvents: [],
        conflicts: [],
        overwritten: [],
        skipped: allDays.map((day, index) => ({
          dayIndex: index,
          reason: "Multi-day events disabled",
          day: day,
        })),
        summary: {
          total: allDays.length,
          successful: 0,
          conflicts: 0,
          overwritten: 0,
          skipped: allDays.length,
        },
      };
    }

    allDays.forEach((day, absoluteDayIndex) => {
      // For multi-day events, check if we have enough remaining days
      if (isMultiDay && absoluteDayIndex + daySpan >= allDays.length) {
        skipped.push({
          dayIndex: absoluteDayIndex,
          reason: "Not enough remaining days for multi-day event",
          day: day,
        });
        return;
      }

      // Create new event for this day
      const newEvent = {
        ...templateEvent,
        id: `applied-${Date.now()}-${absoluteDayIndex}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        color: getTypeColor(templateEvent.type || "meeting"),
        startTime: {
          day: absoluteDayIndex,
          hour: templateEvent.startTime.hour,
          minute: templateEvent.startTime.minute || 0,
        },
        endTime: {
          day: isMultiDay ? absoluteDayIndex + daySpan : absoluteDayIndex,
          hour: templateEvent.endTime.hour,
          minute: templateEvent.endTime.minute || 0,
        },
      };

      console.log("Creating event for day", absoluteDayIndex, newEvent);

      // Check for conflicts
      const conflictingEvents = ScheduleUtil.findConflictingEvents(
        newEvent,
        existingEvents
      );

      if (conflictingEvents.length > 0) {
        console.log(
          "Conflicts found on day",
          absoluteDayIndex,
          conflictingEvents.length
        );

        if (forceOverwrite) {
          // Remove conflicting events
          overwritten.push(...conflictingEvents.map((e) => e.id));
          newEvents.push(newEvent);
          console.log("Force overwrite: added event for day", absoluteDayIndex);
        } else if (skipConflicts) {
          conflicts.push({
            dayIndex: absoluteDayIndex,
            conflictingEvents: conflictingEvents.length,
            day: day,
          });
          console.log("Skipping day", absoluteDayIndex, "due to conflicts");
        } else {
          conflicts.push({
            dayIndex: absoluteDayIndex,
            conflictingEvents: conflictingEvents.length,
            day: day,
          });
        }
      } else {
        newEvents.push(newEvent);
        console.log("Successfully added event for day", absoluteDayIndex);
      }
    });

    console.log("APPLY TO ALL RESULTS");
    console.log("New Events:", newEvents.length);
    console.log("Conflicts:", conflicts.length);
    console.log("Overwritten:", overwritten.length);
    console.log("Skipped:", skipped.length);

    return {
      newEvents,
      conflicts,
      overwritten,
      skipped,
      summary: {
        total: allDays.length,
        successful: newEvents.length,
        conflicts: conflicts.length,
        overwritten: overwritten.length,
        skipped: skipped.length,
      },
    };
  },

  // Convert to API format
  convertToApiFormat: (events, allDaysInRange) => {
    const schedule = [];

    allDaysInRange.forEach((day, index) => {
      const dayEvents = events.filter(
        (event) =>
          event.startTime &&
          (event.startTime.day === index ||
            (event.endTime &&
              event.startTime.day <= index &&
              event.endTime.day >= index))
      );

      schedule.push({
        date: day.toISOString().split("T")[0],
        dayIndex: index,
        events: dayEvents.map((event) => ({
          id: event.id,
          type: event.type,
          startTime: `${event.startTime.hour.toString().padStart(2, "0")}:${(
            event.startTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          endTime: `${event.endTime.hour.toString().padStart(2, "0")}:${(
            event.endTime.minute || 0
          )
            .toString()
            .padStart(2, "0")}`,
          isMultiDay: event.isMultiDay || false,
          duration: ScheduleUtil.formatDuration(event.startTime, event.endTime),
        })),
      });
    });

    return {
      dateRange: {
        start: allDaysInRange[0]?.toISOString().split("T")[0],
        end: allDaysInRange[allDaysInRange.length - 1]
          ?.toISOString()
          .split("T")[0],
        totalDays: allDaysInRange.length,
      },
      schedule,
      summary: {
        totalEvents: events.length,
        eventsByType: ScheduleUtil.groupEventsByType(events),
      },
    };
  },
};
