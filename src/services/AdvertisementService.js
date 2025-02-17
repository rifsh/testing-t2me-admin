import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const AdvertisementService = {};

AdvertisementService.getSingleSchedule = function (scheduleId) {
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_SINGLE_SCHEDULE_URL}?ad_schedule_id=${scheduleId}`,
    method: "get",
  });
};

AdvertisementService.editSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_SCHEDULE_UPDATE_URL}?ad_schedule_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdvertisementService.editScheduleStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_SCHEDULE_STATUS_URL}?ad_schedule_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

AdvertisementService.fetchAdBanners = function (pageData) {
  return fetch({
    url: ApiConstant.ADVERTISEMENT_BANNER_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
AdvertisementService.fetchAdBanner = function (pageData) {
  return fetch({
    url: ApiConstant.ADVERTISEMENT_CATEGORY_BANNER_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

AdvertisementService.fetchAdSchedules = function (pageData) {
  return fetch({
    url: ApiConstant.ADVERTISEMENT_SCHEDULE_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

AdvertisementService.addAdSchedule = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  console.log("----------------", data);

  const formData = Utils.createFormData(data, {
    fileKeys: ["media_path"],
    skipEmpty: true,
  });

  console.log("----------------", formData);
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_SCHEDULE_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdvertisementService.addAdBanner = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["media_path"],
    skipEmpty: true,
  });
  if (data.media_path && Array.isArray(data.media_path)) {
    data.media_path.forEach((image) => {
      formData.append("media_path", image.originFileObj);
    });
  }

  console.log("----------------", formData);

  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_BANNER_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdvertisementService.updateAdBanner = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  console.log("DATA in SERVICE--------", data);

  const formData = Utils.createFormData(data, {
    fileKeys: ["media_path"],
    skipEmpty: true,
  });
  if (data.media_path && Array.isArray(data.media_path)) {
    data.media_path.forEach((image) => {
      formData.append("media_path", image.originFileObj);
    });
  }

  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_BANNER_UPDATE_URL}?advertisement_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdvertisementService.updateBannerStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_BANNER_STATUS_UPDATE_URL}?advertisement_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

export default AdvertisementService;
