import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const LocationService = {};

LocationService.getAllCountries = function () {
  return fetch({
    url: "/api/v1/location/secured/country/",
    method: "get",
  });
};

LocationService.addPlace = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.PLACE_URL}?country_id=${data.country_id}&action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

LocationService.editPlace = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_PLACE_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
LocationService.editVenue = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_VENUE_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};

LocationService.addVenue = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.VENUE_URL}?place_id=${data.place_id}&action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

LocationService.placeWithCountry = function (place) {
  return fetch({
    url: `${ApiConstant.PLACE_WITH_COUNTRY_URL}?place=${place}`,
    method: "get",
  });
};
LocationService.getVenues = function (pageData) {
  return fetch({
    url:ApiConstant.VENUE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
LocationService.getSingleVenues = function (venue_id) {
  return fetch({
    url: `${ApiConstant.SINGLE_VENUE_URL}?venue_id=${venue_id}`,
    method: "get",
  });
};
LocationService.getPlaces = function (pageData) {
  return fetch({
    url: ApiConstant.PLACE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
LocationService.getCoutryDetails = function () {
  return fetch({
    url: ApiConstant.COUNTRY_DETAILS_URL,
    method: "get",
  });
};
export default LocationService;
