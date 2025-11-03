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

AdCategoryService.updateAdCategory = function (
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
    url: ApiConstant.ADVERTISEMENT_CATEGORY_UPDATE_URL,
    method: "put",
    data: data,
    params: Utils.filterParams({ 
      ...pageData, 
      ad_category_id: data.id,
      action: encodedAction 
    }),
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};

AdCategoryService.updateAdStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  return fetch({
    url: ApiConstant.ADVERTISEMENT_CATEGORY_STATUS_UPDATE_URL,
    method: "put",
    data: data,
    params: Utils.filterParams({ 
      ...pageData, 
      ad_category_id: data.id,
      action: encodedAction 
    }),
  });
};

AdCategoryService.addAdCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: ApiConstant.ADVERTISEMENT_CATEGORY_URL,
    method: "POST",
    data: formData,
    params: Utils.filterParams({ action: encodedAction }),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

AdCategoryService.validateAdCategory = function (adCategoryId) {
  return fetch({
    url: ApiConstant.ADCATEGORY_VALIDATE_URL,
    method: "get",
    params: Utils.filterParams({ ad_category_id: adCategoryId }),
  });
};

export default AdCategoryService;
