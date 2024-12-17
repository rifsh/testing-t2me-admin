import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const LocationService = {};

LocationService.getAllCountries = function () {
  return fetch({
    url: "/api/v1/location/secured/country/",
    method: "get",
  });
};

LocationService.addPlace = function (data) {
  return fetch({
    url: `${ApiConstant.PLACE_URL}?country_id=${data.country_id}`,
    method: "post",
    data: data,
  });
};
LocationService.editPlace = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_PLACE_URL}/${data.placeId}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
LocationService.addVenue = function (data, placeId) {
  return fetch({
    url: `${ApiConstant.VENUE_URL}?place_id=${placeId}`,
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
LocationService.getVenues = function (place_id) {
  return fetch({
    url: place_id
      ? `${ApiConstant.VENUE_URL}?place_id=${place_id}`
      : `${ApiConstant.VENUE_URL}`,
    method: "get",
  });
};
LocationService.getPlaces = function (country_id) {
  return fetch({
    url: country_id
      ? `${ApiConstant.PLACE_URL}?country_id=${country_id}`
      : `${ApiConstant.PLACE_URL}`,
    method: "get",
  });
};
LocationService.getCoutryDetails = function () {
  return fetch({
    url: ApiConstant.COUNTRY_DETAILS_URL,
    method: "get",
  });
};
export default LocationService;
