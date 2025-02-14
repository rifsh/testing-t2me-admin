import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventsService = {};

EventsService.addEvent = function (data, action) {
  console.log(data, "event dataaaaaa=======================");
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.EVENT_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
  });
};

EventsService.getAllEvent = function (pageData) {
  // const params = {};
  // if (pageData.page !== null) params.page = pageData.page;
  // if (pageData.size !== null) params.size = pageData.size;
  // if (pageData.search !== null) params.search = pageData.search;

  return fetch({
    url: ApiConstant.EVENT_URL,
    method: "get",
    params: Utils.filterParams(pageData),
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
EventsService.fetchEventsOnPlace = function (placeId) {
  return fetch({
    url: `${ApiConstant.PLACE_EVENTS_URL}?place_id=${placeId}`,
    method: "get",
  });
};

EventsService.fetchOrganizerEvents = function (eventId) {
  return fetch({
    url: `${ApiConstant.ORGANIZER_EVENTS_URL}?user_id=${eventId}`,
    method: "get",
  });
};
EventsService.fetchEventSupportAvailable = function (userId) {
  return fetch({
    url: `${ApiConstant.EVENT_SUPPORT_AVAILABLE}?event_id=${userId}`,
    method: "get",
  });
};
EventsService.updateEvent = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.EDIT_EVENT_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
EventsService.editEventStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_EVENT_STATUS_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

EventsService.validateMultiEvent = function (eventIds) {
  const queryString = eventIds.map((id) => `event_ids=${id}`).join("&");
  return fetch({
    url: `${ApiConstant.MULT_EVENT_VALIDATE_URL}?${queryString}`,
    method: "get",
  });
};

export default EventsService;
