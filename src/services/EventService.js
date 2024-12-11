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
export default EventsService;
