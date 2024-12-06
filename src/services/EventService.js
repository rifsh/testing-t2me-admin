const { ApiConstant } = require("constants/ApiConstant");

const EventService = {};
EventService.fetchAllEvents = function () {
  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "get",
  });
};
EventService.adEvent = function (data) {
  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "post",
    data: "data",
  });
};
export default EventService;