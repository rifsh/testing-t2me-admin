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
    url: `${ApiConstant.SINGLE_CUSTOMER_LEAD_EVENT}?lead_event_id=${eventId}`,
    method: "get",
  });
};


LeadEventService.addLeadEvent = function (data, action) {
  console.log(data, "lead event dataaaaaa=======================");
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.LEAD_EVENT_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
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
    url: `${ApiConstant.LEAD_EVENT_DETAILS_URL}?event_id=${eventId}`,
    method: "get",
  });
};

LeadEventService.fetchLeadEventMessage = function (eventId) {
  return fetch({
    url: `${ApiConstant.LEAD_EVENT_MESSAGE_URL}?lead_id=${eventId}`,
    method: "get",
  });
};

LeadEventService.sendLeadEventMessage = function (data) {
  return fetch({
    url: `${ApiConstant.LEAD_EVENT_MESSAGE_URL}`,
    method: "POST",
    data: data
  });
};

LeadEventService.updateEvent = function (
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
    url: `${ApiConstant.EDIT_LEAD_EVENT_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
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
    url: `${ApiConstant.LEAD_EVENT_STATUS}?lead_event_id=${data.event_id}`,
    method: "put",
    data: data,
    headers: {
      "Content-Type": "application/json", 
    },
  });
};

export default LeadEventService;