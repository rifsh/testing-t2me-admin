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

// LocationService.addPlace = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));

//   // Create FormData instance
//   const formData = new FormData();

//   // Append data fields to FormData
//   formData.append("country_id", data.country_id);
//   formData.append("name", data.name);

//   return fetch({
//     url: `${ApiConstant.PLACE_URL}?country_id=${data.country_id}&action=${encodedAction}`,
//     method: "POST",
//     data: formData,  // Pass the FormData as the request body
//   });
// };

LocationService.addPlace = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  console.log("DATA IN SERVICE PLACE", data);

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  // if (data.banner_images && Array.isArray(data.banner_images)) {
  //   data.banner_images.forEach((image) => {
  //     formData.append("banner_images", image.originFileObj);
  //   });
  // }

  return fetch({
    url: ApiConstant.PLACE_URL,
    method: "POST",
    data: formData,
    params: {
      country_id: data.country_id,
      action: encodedAction,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

LocationService.editPlace = function (
  data,
  action,
  pageData = { page: 1, size: 1 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.EDIT_PLACE_URL}/${data.id}`,
    method: "put",
    data: formData,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

LocationService.editPlaceStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_PLACE_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
  });
};

LocationService.editVenueStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_VENUE_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
  });
};

LocationService.editVenue = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.EDIT_VENUE_URL}/${data.id}`,
    method: "put",
    data: formData,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// LocationService.addVenue = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));
//   return fetch({
//     url: `${ApiConstant.VENUE_URL}?place_id=${data.place_id}&action=${encodedAction}`,
//     method: "post",
//     data: data,
//   });
// };
LocationService.addVenue = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  // const formData = new FormData();

  // // Ensure address is appended to the formData
  // formData.append("address", data.address); // Add this line

  // formData.append("place_id", data.place_id);
  // formData.append("name", data.name);
  // formData.append("capacity", data.capacity);
  // formData.append("indoor", data.indoor);
  // formData.append("description", data.description);
  // formData.append("latitude", data.latitude);
  // formData.append("longitude", data.longitude);
  // formData.append("venue_add_on_services", data.venue_add_on_services);

  // if (data.thumbnail_image && data.thumbnail_image[0]) {
  //   formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  // }

  // if (data.banner_images && Array.isArray(data.banner_images)) {
  //   data.banner_images.forEach((image) => {
  //     formData.append("banner_images", image.originFileObj);
  //   });
  // }

  return fetch({
    url: ApiConstant.VENUE_URL,
    method: "POST",
    data: formData,
    params: {
      place_id: data.place_id,
      action: encodedAction,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

LocationService.placeWithCountry = function (place) {
  return fetch({
    url: ApiConstant.PLACE_WITH_COUNTRY_URL,
    method: "get",
    params: { place }
  });
};
LocationService.getVenues = function (pageData) {
  return fetch({
    url: ApiConstant.VENUE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

LocationService.getSingleVenues = function (venue_id) {
  return fetch({
    url: ApiConstant.SINGLE_VENUE_URL,
    method: "get",
    params: { venue_id },
  });
};

LocationService.getSinglePlace = function (place_id) {
  return fetch({
    url: ApiConstant.SINGLE_PLACE_URL,
    method: "get",
    params: { place_id },
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

// VALIDATION API SERVICE

LocationService.validatePlace = function (placeId) {
  return fetch({
    url: ApiConstant.PLACE_VALIDATE_URL,
    method: "get",
    params: { place_id: placeId },
  });
};

LocationService.validateVenue = function (venueId) {
  return fetch({
    url: ApiConstant.VENUE_VALIDATE_URL,
    method: "get",
    params: { venue_id: venueId },
  });
};

LocationService.validateCountry = function (countryId) {
  return fetch({
    url: ApiConstant.COUNTRY_VALIDATE_URL,
    method: "get",
    params: { country_id: countryId },
  });
};

export default LocationService;
