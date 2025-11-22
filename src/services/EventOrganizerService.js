import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventOrganizerService = {};

EventOrganizerService.updateOrganizerReChanges = function (data, action) {
  console.log("DATE IN SERVICE -------------", data);
  console.log("Action IN SERVICE -------------", action);
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.EVENT_ORGANIZER_EVENT_UPDATE_RECHANGES,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      update_id: data.id,
      action: handleAction(action),
    },
  });
};

EventOrganizerService.fetchOrganizerUpdates = function (pageData) {
  return fetch({
    url: ApiConstant.EVENT_ORGANIZER_UPDATES,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

EventOrganizerService.fetchSingleOrganizerUpdate = function (eventUpId) {
  return fetch({
    url: ApiConstant.EVENT_ORGANIZER_SINGLE_UPDATE,
    method: "get",
    params: { eventup_id: eventUpId },
  });
};

EventOrganizerService.submitOrganizerUpdate = function (data, action) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.EVENT_ORGANIZER_SINGLE_UPDATE_PUT,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      update_id: data.update_id,
      action: handleAction(action),
    },
  });
};

EventOrganizerService.updateOrganizerEvent = function (data, action) {
  console.log("DATE IN SERVICE -------------", data);

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.EVENT_ORGANIZER_EVENT_UPDATE,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      event_id: data.id,
      action: handleAction(action),
    },
  });
};

EventOrganizerService.submitOrganizerOfferUpdate = function (
  data,
  action,
  params
) {
  return fetch({
    url: ApiConstant.ORGANIZER_OFFER_APPROVAL_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(params),
    },
  });
};
EventOrganizerService.submitOrganizerTicketUpdate = function (
  data,
  action,
  params
) {
  return fetch({
    url: ApiConstant.ORGANIZER_TICKET_APPROVAL_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(params),
    },
  });
};

EventOrganizerService.fetchOrganizerSingleOfferUpdate = function (params) {
  return fetch({
    url: ApiConstant.ORGANIZER_OFFER_DETAIL_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
EventOrganizerService.fetchOrganizerSingleTicket = function (params) {
  return fetch({
    url: ApiConstant.ORGANIZER_TICKET_DETAIL_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
EventOrganizerService.fetchOrganizerSingleVenue = function (params) {
  return fetch({
    url: ApiConstant.ORGANIZER_VENUE_DETAIL_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
EventOrganizerService.submitOrganizerCouponUpdate = function (
  data,
  action,
  params
) {
  return fetch({
    url: ApiConstant.ORGANIZER_COUPON_APPROVAL_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(params),
    },
  });
};
EventOrganizerService.submitOrganizerVenueUpdate = function (
  data,
  action,
  params
) {
  return fetch({
    url: ApiConstant.ORGANIZER_VENUE_APPROVAL_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(params),
    },
  });
};

EventOrganizerService.fetchOrganizerSingleCouponUpdate = function (params) {
  return fetch({
    url: ApiConstant.ORGANIZER_COUPON_DETAILS_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
export default EventOrganizerService;
