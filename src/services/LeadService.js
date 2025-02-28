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

export default LeadEventService;