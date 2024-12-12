import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

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
EventsService.updateEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action)); 
  return fetch({
    url: `${ApiConstant.EDIT_EVENT_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data, 
  });
};

export default EventsService;
