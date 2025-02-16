export const TIME_SLOT_MESSAGES = {
  REQUIRED: "Show end time is required",
  BEFORE_CURRENT_DATE: "Show end date cannot be before the current slot date",
  BEFORE_FIRST_DATE: "Show end date cannot be before the first event date",
  AFTER_LAST_DATE: "Show end date cannot be after the last event date",
  MIDNIGHT_PASSED_REQUIRED:
    "Midnight passed must be enabled to set show end time",
  START_TIME_CONFLICT: (startTime, date) =>
    `Show end time must be after the start time (${startTime}) on ${date}`,
  COVERED_DATES: (dates) =>
    `The following dates are already covered by other midnight passed slots: ${dates.join(
      ", "
    )}`,
};

export const TIME_FORMATS = {
  DATE_TIME: "YYYY-MM-DD HH:mm",
  DATE: "YYYY-MM-DD",
  TIME: "HH:mm",
  END_OF_DAY: "23:59",
  START_OF_DAY: "00:00",
};

export const EVENT_TYPES = {
  CHANGE: "change",
  SELECT: "select",
};
