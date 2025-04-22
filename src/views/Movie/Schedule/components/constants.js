// Add to constants.js
export const SCHEDULE_ERROR_MESSAGES = {
  TIME_OVERLAP: "This movie overlaps with an existing schedule on this screen",
  CROSS_MIDNIGHT:
    "This movie crosses midnight and will appear on the next day's schedule",
  INVALID_TIME: "Invalid time range selected",
  SCREEN_UNAVAILABLE: "The selected screen is unavailable during this time",
  TIMEZONE_PAST:
    "Cannot schedule a movie in the past based on the venue's timezone",
  TIMEZONE_FORMAT: "Current time in venue's timezone is {TIME}",
};
