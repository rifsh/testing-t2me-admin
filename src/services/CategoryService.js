import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CategoryService = {};

CategoryService.addCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.CATEGORY_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

CategoryService.updateCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.CATEGORY_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};

CategoryService.fetchCategory = function (pageData) {
 

  return fetch({
    url: ApiConstant.CATEGORY_URL,
    method: "get",
    params: Utils.filterParams(pageData),
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
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}?category_id=${data.category_id}&action=${encodedAction}`,
    method: "post",
    data: data,
  });
};
CategoryService.editSubCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};

export default CategoryService;
