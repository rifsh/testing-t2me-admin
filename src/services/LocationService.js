import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
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
    data: data,
    params: {
      country_id: data.country_id,
      action: encodedAction,
    },
  });
};

LocationService.editPlace = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: `${ApiConstant.EDIT_PLACE_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
    },
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};
LocationService.makeChangeVenue = function (data, action, pageData) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const url = ApiConstant.ORGANIZER_VENUE_MAKE_CHANGES_URL;
  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: `${url}`,
    method: "put",
    data: data,
    params: params,
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

  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: `${ApiConstant.EDIT_VENUE_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      ...Utils.filterParams(pageData),
      action: encodedAction,
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
  const url = Utils.getUrlByUserRole(
    ApiConstant.VENUE_URL,
    ApiConstant.ORGANIZER_VENUE_URL,
    isOrganizer()
  );

  return fetch({
    url: url,
    method: "POST",
    data: data,
    params: {
      place_id: data.place_id,
      action: encodedAction,
    },
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};

LocationService.placeWithCountry = function (place) {
  console.log("placelog", place);

  return fetch({
    url: ApiConstant.PLACE_WITH_COUNTRY_URL,
    method: "get",
    params: Utils.filterParams(place),
  });
};
LocationService.TenantCountry = function () {
  return fetch({
    url: ApiConstant.TENANT_COUNTRY_URL,
    method: "get",
  });
};
LocationService.getVenues = function (pageData) {
  const url = Utils.getUrlByUserRole(
    ApiConstant.VENUE_URL,
    ApiConstant.ORGANIZER_VENUE_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: url,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

LocationService.getSingleVenues = function (venue_id) {
  const url = Utils.getUrlByUserRole(
    ApiConstant.SINGLE_VENUE_URL,
    ApiConstant.ORGANIZER_VENUE_DETAIL_URL,
    isOrganizer()
  );
  const params = isOrganizer()
    ? { organizer_venue_id: venue_id }
    : { venue_id: venue_id };

  return fetch({
    url: url,
    method: "get",
    params: params,
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
