import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const EventOrganizerService = {};

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






export default EventOrganizerService;
