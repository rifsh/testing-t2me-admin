// import fetch from "auth/FetchInterceptor";
// import { ApiConstant } from "constants/ApiConstant";
// import Utils from "utils";
// import { handleAction } from "utils/api/warning-submit-util";

// const LocationService = {};

// LocationService.getAllCountries = function () {
//   return fetch({
//     url: "/api/v1/location/secured/country/",
//     method: "get",
//   });
// };

// LocationService.addPlace = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));

//   const formData = Utils.createFormData(data, {
//     fileKeys: ['thumbnail_image'],
//     skipEmpty: true
//   });
//   if (data.banner_images && Array.isArray(data.banner_images)) {
//     data.banner_images.forEach((image) => {
//       formData.append("banner_images", image.originFileObj);
//     });
//   }


//   return fetch({
//     url: `${ApiConstant.PLACE_URL}?country_id=${data.country_id}&action=${encodedAction}`,
//     method: "POST",
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };

// LocationService.editPlace = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));
//   return fetch({
//     url: `${ApiConstant.EDIT_PLACE_URL}/${data.id}?action=${encodedAction}`,
//     method: "put",
//     data: data,
//   });
// };
// LocationService.editVenue = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));
//   return fetch({
//     url: `${ApiConstant.EDIT_VENUE_URL}/${data.id}?action=${encodedAction}`,
//     method: "put",
//     data: data,
//   });
// };

// LocationService.addVenue = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));

//   const formData = new FormData();
//   return fetch({
//     url: `${ApiConstant.VENUE_URL}?place_id=${data.place_id}&action=${encodedAction}`,
//     method: "POST",
//     data: formData,
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
// };


// LocationService.placeWithCountry = function (place) {
//   return fetch({
//     url: `${ApiConstant.PLACE_WITH_COUNTRY_URL}?place=${place}`,
//     method: "get",
//   });
// };
// LocationService.getVenues = function (pageData) {
//   return fetch({
//     url:ApiConstant.VENUE_URL,
//     method: "get",
//     params: Utils.filterParams(pageData),
//   });
// };
// LocationService.getSingleVenues = function (venue_id) {
//   return fetch({
//     url: `${ApiConstant.SINGLE_VENUE_URL}?venue_id=${venue_id}`,
//     method: "get",
//   });
// };
// LocationService.getSinglePlace = function (place_id) {
//   return fetch({
//     url: `${ApiConstant.SINGLE_PLACE_URL}?place_id=${place_id}`,
//     method: "get",
//   });
// };
// LocationService.getPlaces = function (pageData) {
//   return fetch({
//     url: ApiConstant.PLACE_URL,
//     method: "get",
//     params: Utils.filterParams(pageData),
//   });
// };
// LocationService.getCoutryDetails = function () {
//   return fetch({
//     url: ApiConstant.COUNTRY_DETAILS_URL,
//     method: "get",
//   });
// };
// export default LocationService;
