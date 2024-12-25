import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
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

CategoryService.fetchCategory = function (pageData) { const params = {};
if (pageData.page !== null) params.page = pageData.page;
if (pageData.size !== null) params.size = pageData.size;

  return fetch({
    url: ApiConstant.CATEGORY_URL,
    method: "get",params: params,
  });
};

CategoryService.fetchSubCategory = function (categoryId, pageData) {
  const params = {};
  if (pageData.page !== null) params.page = pageData.page;
  if (pageData.size !== null) params.size = pageData.size;

  return fetch({
    url: categoryId
      ? `${ApiConstant.SUB_CATEGORY_URL}?category_id=${categoryId}`
      : `${ApiConstant.SUB_CATEGORY_URL}`,
    method: "get",
    params: params,
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
