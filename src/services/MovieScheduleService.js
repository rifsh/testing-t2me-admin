import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const MovieScheduleService = {};

MovieScheduleService.addMovieSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const scheduleUrlBase = Utils.getUrlByUserRole(
    ApiConstant.MOVIE_SCHEDULE_URL,
    ApiConstant.MOVIE_ORGANIZER_SCHEDULE_URL,
    isOrganizer()
  );
  return fetch({
    url: `${scheduleUrlBase}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

MovieScheduleService.editSeatStructure = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_EDIT_URL}?action=${encodedAction}&seat_id=${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};
MovieScheduleService.editSeatStructureStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_STATUS_URL}?action=${encodedAction}&seat_id=${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

MovieScheduleService.getScheduleDetails = function (pageData) {
  return fetch({
    url: `${ApiConstant.MOVIE_SCHEDULE_DETAILS_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

MovieScheduleService.getAllMovieSchedule = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

MovieScheduleService.getAllOrganizerMovieSchedule = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_ORGANIZER_SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

MovieScheduleService.getOrganizerMovieScheduleDetails = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_ORGANIZER_SCHEDULE_DETAIL_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

MovieScheduleService.submitOrganizerMovieUpdate = function (
  data,
  action,
  params
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.ORGANIZER_MOVIE_SCHEDULE_APPROVAL_URL}?action=${encodedAction}`,
    method: "put",
    data: data,
    params: Utils.filterParams(params),
  });
};

export default MovieScheduleService;
