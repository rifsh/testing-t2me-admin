import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
const StaticsService = {};

StaticsService.fetchAnnualStatsforEvents = function (place) {
  return fetch({
    url: ApiConstant.STATICS_EVENT_LIST,
    method: "get",
  });
};

StaticsService.fetchAnnualStatsforUsers = function (pageData) {
  const params = {};
  if (pageData.page !== null) params.page = pageData.page;
  if (pageData.size !== null) params.size = pageData.size;

  return fetch({
    url: ApiConstant.STATICS_USER_LIST,
    method: "get",
    params: params,
  });
};

StaticsService.fetchAnnualStatsforSchedules = function () {
  return fetch({
    url: ApiConstant.STATICS_SCHEDULES_LIST,
    method: "get",
  });
};

export default StaticsService;
