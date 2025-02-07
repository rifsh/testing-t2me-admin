import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const ScheduleService = {};


ScheduleService.addSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.SCHEDULE_URL}?action=${encodedAction}`,
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
ScheduleService.getAllSchedule = function (pageData) {
  return fetch({
    url: ApiConstant.SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
ScheduleService.getSingleSchedule = function (pageData) {
  return fetch({
    url: ApiConstant.SINGLE_SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
export default ScheduleService;
