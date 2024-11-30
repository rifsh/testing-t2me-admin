import fetch from "auth/FetchInterceptor";

const CategoryService = {};

CategoryService.addCategory = function (data) {
  return fetch({
    url: "/api/v1/events/secured/category",
    method: "post",
    data: data,
  });
};
CategoryService.fetchCategory = function () {
  return fetch({
    url: "/api/v1/events/secured/category",
    method: "get",
  });
};
CategoryService.fetchSubCategory = function (categoryId) {
  return fetch({
    url: `/api/v1/events/secured/subcategory?category_id=${categoryId}`,
    method: "get",
  });
};

CategoryService.addSubCategory = function (data, categoryId) {
  return fetch({
    url: `/api/v1/events/secured/subcategory?category_id=${categoryId}`,
    method: "post",
    data: data,
  });
};

export default CategoryService;
