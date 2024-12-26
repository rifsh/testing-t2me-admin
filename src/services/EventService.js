import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const EventsService = {};

EventsService.addEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EVENT_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

EventsService.getAllEvent = function (pageData) {
  const params = {};
  if (pageData.page !== null) params.page = pageData.page;
  if (pageData.size !== null) params.size = pageData.size;

  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "get",
    params: params,
  });
};

EventsService.checkValidation = function () {
  return fetch({
    url: ApiConstant.EVENT_VALIDATION_URL,
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
