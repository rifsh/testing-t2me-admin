import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const EventsService = {};

EventsService.addEvent = function (data) {
  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "post",
    data: data,
  });
};

EventsService.getAllEvent = function (place) {
  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "get",
  });
};
EventsService.fetchEventDetails = function (eventId) {
  return fetch({
    url: `${ApiConstant.EVENT_DETAILS_URL}?event_id=${eventId}`,
    method: "get",
  });
};
export default EventsService;
