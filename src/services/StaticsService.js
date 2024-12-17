import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
const StaticsService = {};

StaticsService.fetchAnnualStatsforEvents = function (place) {
  return fetch({
    url: ApiConstant.STATICS_EVENT_LIST,
    method: "get",
  });
};

StaticsService.fetchAnnualStatsforUsers = function (place) {
  return fetch({
    url: ApiConstant.STATICS_USER_LIST,
    method: "get",
  });
};


export default StaticsService;