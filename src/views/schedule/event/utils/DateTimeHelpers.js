import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Helper functions for date-time operations (timezone-aware)
 */
export const DateTimeHelpers = {
  /**
   * Get current time in specific timezone
   */
  getCurrentTime: (timezone = "Asia/Dubai") => {
    return dayjs().tz(timezone);
  },

  /**
   * Get calendar days for a month
   */
  getCalendarDays: (year, month) => {
    const firstDay = dayjs(`${year}-${month + 1}-01`);
    const lastDay = firstDay.endOf("month");
    const daysInMonth = lastDay.date();
    const startingDayOfWeek = firstDay.day();

    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = firstDay.subtract(startingDayOfWeek - i, "day");
      days.push({
        date: prevDate.date(),
        month: prevDate.month(),
        year: prevDate.year(),
        isCurrentMonth: false,
        fullDate: prevDate.toDate(),
      });
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = dayjs(`${year}-${month + 1}-${day}`);
      days.push({
        date: day,
        month: month,
        year: year,
        isCurrentMonth: true,
        fullDate: currentDate.toDate(),
      });
    }

    const totalCells = Math.ceil(days.length / 7) * 7;
    const remainingCells = totalCells - days.length;

    for (let day = 1; day <= remainingCells; day++) {
      const nextDate = lastDay.add(day, "day");
      days.push({
        date: day,
        month: nextDate.month(),
        year: nextDate.year(),
        isCurrentMonth: false,
        fullDate: nextDate.toDate(),
      });
    }

    return days;
  },

  /**
   * Generate time slots
   */
  generateTimeSlots: (intervalMinutes = 15) => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const time = dayjs().hour(hour).minute(minute).second(0);
        slots.push({
          hour,
          minute,
          time12: time.format("hh:mm A"),
          time24: time.format("HH:mm"),
          value: `${String(hour).padStart(2, "0")}:${String(minute).padStart(
            2,
            "0"
          )}`,
        });
      }
    }
    return slots;
  },

  /**
   * Get quick date options (timezone-aware)
   */
  getQuickDateOptions: (timezone = "Asia/Dubai") => {
    const now = dayjs().tz(timezone);
    return [
      
      {
        label: "Tomorrow",
        value: "tomorrow",
        date: now.add(1, "day").toDate(),
      },
      {
        label: "Next Week",
        value: "next_week",
        date: now.add(7, "day").toDate(),
      },
    ];
  },

  /**
   * Get current time rounded to nearest interval (timezone-aware)
   */
  getCurrentTimeRounded: (intervalMinutes = 15, timezone = "Asia/Dubai") => {
    const now = dayjs().tz(timezone);
    const roundedMinutes =
      Math.ceil(now.minute() / intervalMinutes) * intervalMinutes;

    if (roundedMinutes >= 60) {
      return now.add(1, "hour").minute(0).second(0);
    }

    return now.minute(roundedMinutes).second(0);
  },

  /**
   * Format time from object
   */
  formatTime: (hours, minutes, format = "12") => {
    const time = dayjs().hour(hours).minute(minutes);
    return format === "12" ? time.format("hh:mm A") : time.format("HH:mm");
  },
};

export default DateTimeHelpers;
