import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const LeadEventService = {};

LeadEventService.getleadEvent = function (pageData) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_LIST,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

LeadEventService.getSingleleadEvent = function (eventId) {
  return fetch({
    url: ApiConstant.SINGLE_CUSTOMER_LEAD_EVENT,
    method: "get",
    params: {
      lead_event_id: eventId,
    },
  });
};

LeadEventService.addLeadEvent = function (data, action) {
  const encodedAction = handleAction(action);
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.LEAD_EVENT_URL,
    method: "post",
    data: formData,
    params: {
      action: encodedAction,
    },
  });
};

LeadEventService.fetchAllLeadEvent = function (pageData) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

LeadEventService.fetchLeadEventDetails = function (eventId) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_DETAILS_URL,
    method: "get",
    params: {
      event_id: eventId,
    },
  });
};

LeadEventService.fetchLeadEventMessage = function (eventId) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_MESSAGE_URL,
    method: "get",
    params: {
      lead_id: eventId,
    },
  });
};

LeadEventService.sendLeadEventMessage = function (data) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_MESSAGE_URL,
    method: "post",
    data: data,
  });
};

LeadEventService.updateEvent = function (data, action, pageData = { page: 1, size: 10 }) {
  const encodedAction = handleAction(action);
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.EDIT_LEAD_EVENT_URL}/${data.id}`,
    method: "put",
    data: formData,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

LeadEventService.EnrollUser = function (data) {
  return fetch({
    url: `${ApiConstant.LEAD_ENROL_USER}/${data.event_id}`,
    method: "put",
    data: data,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

LeadEventService.leadstatus = function (data) {
  return fetch({
    url: ApiConstant.LEAD_EVENT_STATUS,
    method: "put",
    data: data,
    params: {
      lead_event_id: data.event_id,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default LeadEventService;
