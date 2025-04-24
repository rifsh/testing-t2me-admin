import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const MovieSeatService = {};

MovieSeatService.addSeatStructure = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

MovieSeatService.editSeatStructure = function (
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
MovieSeatService.editSeatStructureStatus = function (
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

MovieSeatService.getSeatStructureDetails = function (pageData) {
  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_DETAILS_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

MovieSeatService.getAllSeatStructures = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_SEAT_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};


MovieSeatService.addEventSeatStructure = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.EVENT_SEAT_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

MovieSeatService.editEventSeatStructure = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EVENT_SEAT_EDIT_URL}?action=${encodedAction}&seat_id=${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};
MovieSeatService.editEventSeatStructureStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EVENT_SEAT_STATUS_URL}?action=${encodedAction}&seat_id=${data.id}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

MovieSeatService.getEventSeatStructureDetails = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_SEAT_DETAILS_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

MovieSeatService.getEventAllSeatStructures = function (params) {
  return fetch({
    url: ApiConstant.EVENT_SEAT_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

export default MovieSeatService;
