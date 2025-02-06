import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const AdCategoryService = {};

AdCategoryService.fetchAdCategory = function (pageData) {
  return fetch({
    url: ApiConstant.ADVERTISEMENT_CATEGORY_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

AdCategoryService.updateAdCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_CATEGORY_UPDATE_URL}?ad_category_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdCategoryService.updateAdStatus = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_CATEGORY_STATUS_UPDATE_URL}?ad_category_id=${data.id}&action=${encodedAction}`,
    method: "put",
    data: data,
  });
};

AdCategoryService.addAdCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_CATEGORY_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdCategoryService.validateAdCategory = function (adCategoryId) {
  return fetch({
    url: `${ApiConstant.ADCATEGORY_VALIDATE_URL}?ad_category_id=${adCategoryId}`,
    method: "get",
  });
};

export default AdCategoryService;
