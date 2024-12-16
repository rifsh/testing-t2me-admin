import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
const StaticsService = {};

StaticsService.fetchAnnualStats = function (place) {
  return fetch({
    url: ApiConstant.STATICS_LIST,
    method: "get",
  });
};


export default StaticsService;