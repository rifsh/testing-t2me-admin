import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const ScheduleService = {};

ScheduleService.addSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const url = Utils.getUrlByUserRole(
    ApiConstant.SCHEDULE_URL,
    ApiConstant.ORGANIZER_SCHEUDLE_URL,
    isOrganizer()
  );
  return fetch({
    url: url,
    method: "post",
    data: data,
    params: Utils.filterParams({ action: encodedAction }),
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
  const url = Utils.getUrlByUserRole(
    ApiConstant.SCHEDULE_URL,
    ApiConstant.ORGANIZER_SCHEUDLE_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: ApiConstant.SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
ScheduleService.getSingleSchedule = function (pageData) {
  const url = Utils.getUrlByUserRole(
    ApiConstant.SINGLE_SCHEDULE_URL,
    ApiConstant.ORGANIZER_SCHEDULE_DETAIL_URL,
    isOrganizer()
  );
  return fetch({
    url: url,
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

ScheduleService.makeChangeSchedule = function (data, action, pageData) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const url = ApiConstant.ORGANIZER_SCHEDULE_MAKE_CHANGES_URL;
  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };
  return fetch({
    url: url,
    method: "put",
    data: data,
    params: params,
  });
};
export default ScheduleService;
