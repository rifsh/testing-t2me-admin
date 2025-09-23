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

export const getDaysDiff = (startDate, endDate) => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

export const formatTime = (hour, minute = 0) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
};

export const timeToMinutes = (hour, minute) => hour * 60 + minute;

// Updated to generate 60-minute intervals (hourly slots)
export const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push({
      hour,
      minute: 0,
      display: formatTime(hour, 0),
      value: `${hour.toString().padStart(2, "0")}:00`,
    });
  }
  return slots;
};

export const getTypeColor = (type) => {
  const colors = {
    meeting: "bg-blue-200 border-blue-300",
    task: "bg-green-200 border-green-300",
    reminder: "bg-yellow-200 border-yellow-300",
    personal: "bg-purple-200 border-purple-300",
    urgent: "bg-red-200 border-red-300",
  };
  return colors[type] || colors.meeting;
};
// Enhanced ScheduleUtil with proper Apply to All functionality
export const ScheduleUtil = {
  checkConflict: (newEvent, existingEvents, excludeId = null) => {
    return existingEvents.some((event) => {
      if (!event.startTime || !event.endTime || event.id === excludeId)
        return false;

      const newStart =
        newEvent.startTime.day * 1440 +
        timeToMinutes(newEvent.startTime.hour, newEvent.startTime.minute || 0);
      const newEnd =
        newEvent.endTime.day * 1440 +
        timeToMinutes(newEvent.endTime.hour, newEvent.endTime.minute || 0);
      const existingStart =
        event.startTime.day * 1440 +
        timeToMinutes(event.startTime.hour, event.startTime.minute || 0);
      const existingEnd =
        event.endTime.day * 1440 +
        timeToMinutes(event.endTime.hour, event.endTime.minute || 0);

      return newStart < existingEnd && newEnd > existingStart;
    });
  },

  findConflictingEvents: (newEvent, existingEvents, excludeId = null) => {
    return existingEvents.filter((event) => {
      if (!event.startTime || !event.endTime || event.id === excludeId)
        return false;

      const newStart =
        newEvent.startTime.day * 1440 +
        timeToMinutes(newEvent.startTime.hour, newEvent.startTime.minute || 0);
      const newEnd =
        newEvent.endTime.day * 1440 +
        timeToMinutes(newEvent.endTime.hour, newEvent.endTime.minute || 0);
      const existingStart =
        event.startTime.day * 1440 +
        timeToMinutes(event.startTime.hour, event.startTime.minute || 0);
      const existingEnd =
        event.endTime.day * 1440 +
        timeToMinutes(event.endTime.hour, event.endTime.minute || 0);

      return newStart < existingEnd && newEnd > existingStart;
    });
  },

  validateTimeSlot: (startTime, endTime) => {
    const start =
      startTime.day * 1440 +
      timeToMinutes(startTime.hour, startTime.minute || 0);
    const end =
      endTime.day * 1440 + timeToMinutes(endTime.hour, endTime.minute || 0);

    if (start >= end) {
      return { valid: false, error: "End time must be after start time" };
    }

    if (end - start < 60) {
      return { valid: false, error: "Event must be at least 1 hour long" };
    }

    return { valid: true };
  },

  formatDuration: (startTime, endTime) => {
    const start = timeToMinutes(startTime.hour, startTime.minute || 0);
    const end = timeToMinutes(endTime.hour, endTime.minute || 0);
    const duration = end - start;

    if (duration < 60) {
      return `${duration}m`;
    }

    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  },

  groupEventsByType: (events) => {
    return events.reduce((groups, event) => {
      const type = event.type || "meeting";
      if (!groups[type]) groups[type] = [];
      groups[type].push(event);
      return groups;
    }, {});
  },

  // FIXED: Apply to All now properly applies to ALL days
  generateApplyToAllEvents: (templateEvent, allDays, existingEvents) => {
    const newEvents = [];
    const conflicts = [];

    console.log(`UTILS: Generating events for ${allDays.length} days`);

    allDays.forEach((day, dayIndex) => {
      const newEvent = {
        ...templateEvent,
        id: `temp-${Date.now()}-${dayIndex}`,
        startTime: {
          ...templateEvent.startTime,
          day: dayIndex,
        },
        endTime: {
          ...templateEvent.endTime,
          day: dayIndex,
        },
      };

      console.log(`Checking day ${dayIndex}:`, newEvent);

      if (ScheduleUtil.checkConflict(newEvent, existingEvents)) {
        conflicts.push({
          dayIndex,
          day: day,
          conflictingEvents: ScheduleUtil.findConflictingEvents(newEvent, existingEvents)
        });
        console.log(`Conflict found on day ${dayIndex}`);
      } else {
        newEvents.push(newEvent);
        console.log(`Event added for day ${dayIndex}`);
      }
    });

    console.log(`UTILS: Generated ${newEvents.length} events, ${conflicts.length} conflicts`);
    return { newEvents, conflicts };
  },

  // FIXED: New method with forced application option
  generateApplyToAllEventsWithForce: (templateEvent, allDays, existingEvents, forceApply = false) => {
    const newEvents = [];
    const conflicts = [];
    const overwritten = [];

    console.log(`UTILS: Force Generating events for ${allDays.length} days (Force: ${forceApply})`);

    allDays.forEach((day, dayIndex) => {
      const newEvent = {
        ...templateEvent,
        id: `force-apply-${Date.now()}-${dayIndex}`,
        startTime: {
          ...templateEvent.startTime,
          day: dayIndex,
        },
        endTime: {
          ...templateEvent.endTime,
          day: dayIndex,
        },
      };

      const conflictingEvents = ScheduleUtil.findConflictingEvents(newEvent, existingEvents);
      
      if (conflictingEvents.length > 0) {
        if (forceApply) {
          overwritten.push(...conflictingEvents.map(e => e.id));
          newEvents.push(newEvent);
          console.log(`Force applied event on day ${dayIndex}, overwriting ${conflictingEvents.length} events`);
        } else {
          conflicts.push({
            dayIndex,
            day: day,
            conflictingEvents: conflictingEvents.length
          });
          console.log(`Conflict found on day ${dayIndex}`);
        }
      } else {
        newEvents.push(newEvent);
        console.log(`Event added for day ${dayIndex}`);
      }
    });

    console.log(`UTILS: Generated ${newEvents.length} events, ${conflicts.length} conflicts, ${overwritten.length} overwritten`);
    return { newEvents, conflicts, overwritten };
  }
};
