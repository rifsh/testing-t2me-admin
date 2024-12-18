import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const ScheduleService = {};

ScheduleService.addSchedule = function (data) {
  return fetch({
    url: ApiConstant.SCHEDULE_URL,
    method: "post",
    data: data,
  });
};
ScheduleService.editSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.SCHEDULE_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
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
