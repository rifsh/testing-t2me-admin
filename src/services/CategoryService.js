import fetch from "auth/FetchInterceptor";
import {  CATEGORY_URL, SUB_CATEGORY_URL } from "constants/ApiConstant";

const CategoryService = {};

CategoryService.addCategory = function (data) {
  return fetch({
    url: CATEGORY_URL,
    method: "post",
    data: data,
  });
};
CategoryService.fetchCategory = function () {
  return fetch({
    url: CATEGORY_URL,
    method: "get",
  });
};
CategoryService.fetchSubCategory = function (categoryId) {
  return fetch({
    url: `${SUB_CATEGORY_URL}${categoryId}`,
    method: "get",
  });
};

CategoryService.addSubCategory = function (data, categoryId) {
  return fetch({
    url: `${SUB_CATEGORY_URL}${categoryId}`,
    method: "post",
    data: data,
  });
};

export default CategoryService;
