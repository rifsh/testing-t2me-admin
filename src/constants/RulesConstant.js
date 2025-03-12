export const RulesMessageConstants = {
  VENUE:"Please enter the venue name",
  PLACE:"Please select a place",
  CAPACITY:"Please enter capacity",
  INDOOR:"Please specify indoor/outdoor",
  DESCRIPTION:"Please enter descriptions"
};

export const RulesConstants = {
  event: [
    {
      required: true,
      message: "Please select an event",
    },
  ],
  start_time: [
    {
      required: true,
      message: "Please select a start time",
    },
  ],
  end_time: [
    {
      required: true,
      message: "Please select an end time",
    },
  ],
  status: [
    {
      required: true,
      message: "Please select status",
    },
  ],
  venue: [
    {
      required: true,
      message: "Please select a venue",
    },
  ],
  description: [
    {
      required: true,
      message: "Please enter descriptions",
    },
  ],
};