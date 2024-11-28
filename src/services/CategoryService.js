import fetch from "auth/FetchInterceptor";

const CategoryService = {};

CategoryService.addCategory = function (data) {
  return fetch({
    url: "/api/v1/events/secured/category",
    method: "POST",
    data,
  });
};

CategoryService.fetchCategory = function () {
  return fetch({
    url: "/api/v1/events/secured/subcategory",
    method: "GET",
  });
};

export default CategoryService;
