import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CategoryService = {};

CategoryService.addCategory = function (data, action) {
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: ApiConstant.CATEGORY_URL,
    method: "POST",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
    params: { action: handleAction(action) },
  });
};

CategoryService.updateCategory = function (data, action) {
  return fetch({
    url: `${ApiConstant.CATEGORY_URL}/${data.id}`,
    method: "put",
    data: data,
    params: { action: handleAction(action) },
  });
};

CategoryService.fetchCategory = function (pageData) {
  return fetch({
    url: ApiConstant.CATEGORY_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

CategoryService.getSingleCateory = function (category_id) {
  return fetch({
    url: ApiConstant.SINGLE_CATEGORY_URL,
    method: "get",
    params: { category_id },
  });
};

CategoryService.getSingleSubCateory = function (subcategory_id) {
  return fetch({
    url: ApiConstant.SUB_SINGLE_CATEGORY_URL,
    method: "get",
    params: { subcategory_id },
  });
};

CategoryService.fetchSubCategory = function (pageData) {
  return fetch({
    url: ApiConstant.SUB_CATEGORY_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

CategoryService.addSubCategory = function (data, action) {
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  return fetch({
    url: ApiConstant.SUB_CATEGORY_URL,
    method: "POST",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
    params: {
      category_id: data.category_id,
      action: handleAction(action),
    },
  });
};

CategoryService.editCategory = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });
  return fetch({
    url: `${ApiConstant.CATEGORY_URL}/${data.id}`,
    method: "put",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
  });
};

CategoryService.editSubCategory = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}/${data.id}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
  });
};

CategoryService.editCatStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  return fetch({
    url: `${ApiConstant.CATEGORY_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
  });
};

CategoryService.editSubCatStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
  });
};

CategoryService.validateCategory = function (categoryId) {
  return fetch({
    url: ApiConstant.CATEGORY_VALIDATE_URL,
    method: "get",
    params: { category_id: categoryId },
  });
};

CategoryService.validateSubCategory = function (subCategoryId) {
  return fetch({
    url: ApiConstant.SUB_CATEGORY_VALIDATE_URL,
    method: "get",
    params: { subcategory_id: subCategoryId },
  });
};

export default CategoryService;
