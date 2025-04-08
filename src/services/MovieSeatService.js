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
    url: `${ApiConstant.MOVIE_SEAT_URL}/${data.id}?action=${encodedAction}`,
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

export default MovieSeatService;
