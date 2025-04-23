import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const MovieScheduleService = {};

MovieScheduleService.addMovieSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.MOVIE_SCHEDULE_URL}?action=${encodedAction}`,
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

MovieScheduleService.getSeatStructureDetails = function (pageData) {
  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_DETAILS_URL}`,
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

export default MovieScheduleService;
