const { EVENT_URL } = require("constants/ApiConstant");

const EventService = {};
EventService.fetchAllEvents = function () {
  return fetch({
    url: EVENT_URL,
    method: "get",
  });
};
export default EventService;