import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventsService = {};

EventsService.addEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const url = Utils.getUrlByUserRole(
    ApiConstant.EVENT_URL,
    ApiConstant.ORGANIZER_EVENT_URL,
    isOrganizer()
  );
  return fetch({
    url: url,
    method: "POST",
    data: data,
    params: Utils.filterParams({ action: encodedAction }),
  });
};
EventsService.addEventType = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.EVENT_TYPE_URL}`,
    method: "POST",
    data: data,
    params: Utils.filterParams({ action: encodedAction }),
  });
};
EventsService.makeChangeEvent = function (data, action, pageData) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const url = ApiConstant.ORGANIZER_EVENT_MAKE_CHANGES_URL;
  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };
  return fetch({
    url: url,
    method: "put",
    data: data,
    params: params,
  });
};
EventsService.getAllEvent = function (pageData) {
  const url = Utils.getUrlByUserRole(
    ApiConstant.EVENT_URL,
    ApiConstant.ORGANIZER_EVENT_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: url,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
EventsService.fetchEventType = function (pageData) {
  // const params = {};
  // if (pageData.page !== null) params.page = pageData.page;
  // if (pageData.size !== null) params.size = pageData.size;
  // if (pageData.search !== null) params.search = pageData.search;

  return fetch({
    url: ApiConstant.EVENT_TYPE_URL,
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
  const url = Utils.getUrlByUserRole(
    ApiConstant.EVENT_DETAILS_URL,
    ApiConstant.ORGANIZER_EVENT_DETAIL_URL,
    isOrganizer()
  );

  const params = isOrganizer()
    ? { organizer_event_id: eventId }
    : { event_id: eventId };
  return fetch({
    url: url,
    method: "get",
    params: Utils.filterParams(params),
  });
};
EventsService.checkEventEditAvailblily = function (params) {
  return fetch({
    url: ApiConstant.CHECK_EVENT_EDIT_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

EventsService.fetchEventTypeDetails = function (typeId) {
  return fetch({
    url: ApiConstant.EVENT_TYPE_DETAILS_URL,
    method: "get",
    params: Utils.filterParams({ event_type_id: typeId }),
  });
};
EventsService.fetchEventTypeOption = function () {
  return fetch({
    url: ApiConstant.EVENT_TYPE_OPTION_URL,
    method: "get",
  });
};
EventsService.fetchEventsOnPlace = function (placeId) {
  return fetch({
    url: ApiConstant.PLACE_EVENTS_URL,
    method: "get",
    params: Utils.filterParams({ place_id: placeId }),
  });
};

EventsService.fetchOrganizerEvents = function (userId) {
  return fetch({
    url: ApiConstant.ORGANIZER_EVENTS_URL,
    method: "get",
    params: Utils.filterParams({ user_id: userId }),
  });
};

EventsService.fetchEventSupportAvailable = function (eventId) {
  return fetch({
    url: ApiConstant.EVENT_SUPPORT_AVAILABLE,
    method: "get",
    params: Utils.filterParams({ event_id: eventId }),
  });
};

EventsService.updateEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: `${ApiConstant.EDIT_EVENT_URL}/${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams({ action: encodedAction }),
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};
// tested
EventsService.updateEventType = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: ApiConstant.EVENT_TYPE_DETAILS_URL,
    method: "put",
    data: data,
    params: Utils.filterParams({
      ...pageData,
      event_type_id: data.id,
      action: encodedAction,
    }),
  });
};

// tested
EventsService.editEventStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.EDIT_EVENT_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams({ ...pageData, action: encodedAction }),
  });
};

// tested
EventsService.editEventTypeStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: ApiConstant.EVENT_TYPE_STATUS_URL,
    method: "put",
    data: data,
    params: Utils.filterParams({
      ...pageData,
      event_type_id: data.id,
      action: encodedAction,
    }),
  });
};

// tested
EventsService.validateMultiEvent = function (eventIds) {
  return fetch({
    url: ApiConstant.MULT_EVENT_VALIDATE_URL,
    method: "get",
    params: Utils.filterParams({ event_ids: eventIds }),
  });
};

export default EventsService;
