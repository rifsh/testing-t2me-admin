import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const ScheduleService = {};

ScheduleService.addSchedule = function (data) {
  return fetch({
    url: ApiConstant.SCHEDULE_URL,
    method: "post",
    data: data,
  });
};

ScheduleService.getAllSchedule = function () {
  return fetch({
    url: ApiConstant.SCHEDULE_URL,
    method: "get",
  });
};
export default ScheduleService;
