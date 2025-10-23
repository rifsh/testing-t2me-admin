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
    url: `${ApiConstant.EDIT_SCHEDULE_URL}${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
ScheduleService.editScheduleStatus = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.SCHEDULE_STATUS_EDIT_URL}/${data.schedule_id}?action=${encodedAction}`,
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
ScheduleService.checkScheduleEdit = function (params) {
  return fetch({
    url: ApiConstant.CHECK_SCHEDULE_EDIT_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};
export default ScheduleService;
