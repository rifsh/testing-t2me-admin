import fetch from "auth/FetchInterceptor";
import {  ApiConstant,  } from "constants/ApiConstant";

const     CategoryService = {};

CategoryService.addCategory = function (data) {
  return fetch({
    url: ApiConstant.CATEGORY_URL,
    method: "post",
    data: data,
  });
};
CategoryService.fetchCategory = function () {
  return fetch({
    url:ApiConstant.CATEGORY_URL,
    method: "get",
  });
};
CategoryService.fetchSubCategory = function (categoryId) {
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}?category_id=${categoryId}`,
    method: "get",
  });
};

CategoryService.addSubCategory = function (data, categoryId) {
  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}?category_id=${categoryId}`,
    method: "post",
    data: data,
  });
};

export default CategoryService;
