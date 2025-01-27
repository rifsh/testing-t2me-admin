import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventOrganizerService = {};

EventOrganizerService.updateOrganizerReChanges = function (data, action) {

  console.log("DATE IN SERVICE -------------",data);
  console.log("Action IN SERVICE -------------",action);
  
  const encodedAction = encodeURIComponent(handleAction(action)); 
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });
  
  return fetch({
    url: `${ApiConstant.EVENT_ORGANIZER_EVENT_UPDATE_RECHANGES}?update_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
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
    url: `${ApiConstant.EVENT_ORGANIZER_SINGLE_UPDATE}?eventup_id=${eventUpId}`,
    method: "get",
  });
};

EventOrganizerService.submitOrganizerUpdate = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });
  return fetch({
    url: `${ApiConstant.EVENT_ORGANIZER_SINGLE_UPDATE_PUT}?update_id=${data.update_id}&action=${encodedAction}`,
    method: "put",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

EventOrganizerService.updateOrganizerEvent = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  console.log("DATE IN SERVICE -------------",data);

  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });


  return fetch({
    url: `${ApiConstant.EVENT_ORGANIZER_EVENT_UPDATE}?event_id=${data.id}&action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};







export default EventOrganizerService;
