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
    url: `${seatUrl}`,
    method: "post",
    data: data,
    params: {
      action: encodedAction,
    },
  });
};

// old
// MovieSeatService.editSeatStructure = function (
//   data,
//   action,
//   pageData = { page: 1, size: 10 }
// ) {
//   const encodedAction = encodeURIComponent(handleAction(action));
//   const seatUrlBase = Utils.getUrlByUserRole(
//     ApiConstant.MOVIE_SEAT_EDIT_URL,                 // For admin
//     ApiConstant.MOVIE_ORGANIZER_SEAT_EDIT_URL,       // For organizer
//     isOrganizer()
//   );
//   const seatUrl = isOrganizer()
//     ? `${seatUrlBase}/${data.id}?action=${encodedAction}` // Organizer uses path param + query
//     : `${seatUrlBase}?action=${encodedAction}&seat_id=${data.id}`; // Admin uses only query params

//   return fetch({
//     url: seatUrl,
//     method: "put",
//     data: data,
//     params: Utils.filterParams(pageData),
//   });
// };

// new 
MovieSeatService.editSeatStructure = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const seatUrlBase = Utils.getUrlByUserRole(
    ApiConstant.MOVIE_SEAT_EDIT_URL,           // Admin URL
    ApiConstant.MOVIE_ORGANIZER_SEAT_EDIT_URL, // Organizer URL
    isOrganizer()
  );

  const url = isOrganizer()
    ? `${seatUrlBase}/${data.id}`  // Organizer uses path param
    : seatUrlBase;                 // Admin uses query param

  const params = {
    action: handleAction(action),
    ...(isOrganizer() ? {} : { seat_id: data.id }), // Admin includes seat_id
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: url,
    method: "put",
    data: data,
    params: params,
  });
};
MovieSeatService.makeEditSeatStructure = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: `${ApiConstant.MOVIE_SEAT_MAKE_EDIT_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: encodedAction,
      ...Utils.filterParams(pageData)
    },
  });
};

MovieSeatService.editSeatStructureStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  return fetch({
    url: ApiConstant.MOVIE_SEAT_STATUS_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      seat_id: data.id,
      ...Utils.filterParams(pageData),
    },
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
  return fetch({
    url: ApiConstant.EVENT_SEAT_EDIT_URL,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      seat_id: data.id,
      ...Utils.filterParams(pageData),
    },
  });
};

MovieSeatService.editEventSeatStructureStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  // Combine all params into one object
  const params = {
    action: encodedAction,
    seat_id: data.id,
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: ApiConstant.EVENT_SEAT_STATUS_URL,
    method: "put",
    data: data,
    params: params,
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
