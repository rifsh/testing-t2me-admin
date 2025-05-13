import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const MovieSeatService = {};

MovieSeatService.addSeatStructure = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const seatUrl = Utils.getUrlByUserRole(
    ApiConstant.MOVIE_SEAT_URL,
    ApiConstant.MOVIE_ORGANIZER_SEAT_URL,
    isOrganizer()
  );
  return fetch({
    url: `${seatUrl}?action=${encodedAction}`,
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
  const seatUrlBase = Utils.getUrlByUserRole(
    ApiConstant.MOVIE_SEAT_EDIT_URL,                 // For admin
    ApiConstant.MOVIE_ORGANIZER_SEAT_EDIT_URL,       // For organizer (base URL without seat_id)
    isOrganizer()
  );

  const seatUrl = isOrganizer()
    ? `${seatUrlBase}/${data.id}` // Append seat_id in path if organizer
    : `${seatUrlBase}?seat_id=${data.id}`; // Else use query param

  return fetch({
    url: `${seatUrl}?action=${encodedAction}&seat_id=${data.id}`,
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

MovieSeatService.getAllTrackrequestSeatStructures = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_ORGANIZER_SEAT_STATUS_LIST_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

MovieSeatService.getTrackrequestSeatStructuresDetails = function (params) {
  return fetch({
    url: ApiConstant.MOVIE_ORGANIZER_SEAT_STATUS_DETAILS_URL,
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
