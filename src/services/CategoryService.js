import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CategoryService = {};

CategoryService.addCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description); 
  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }


  return fetch({
    url: `${ApiConstant.CATEGORY_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
CategoryService.getSingleCateory = function (category_id) {
  return fetch({
    url: `${ApiConstant.SINGLE_CATEGORY_URL}?category_id=${category_id}`,
    method: "get",
  });
};
CategoryService.getSingleSubCateory = function (subcategory_id) {
  return fetch({
    url: `${ApiConstant.SUB_SINGLE_CATEGORY_URL}?subcategory=${subcategory_id}`,
    method: "get",
  });
};
CategoryService.fetchSubCategory = function (pageData) {

  return fetch({
    url: ApiConstant.SUB_CATEGORY_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

// CategoryService.addSubCategory = function (data, action) {
//   const encodedAction = encodeURIComponent(handleAction(action));
//   return fetch({
//     url: `${ApiConstant.SUB_CATEGORY_URL}?category_id=${data.category_id}&action=${encodedAction}`,
//     method: "post",
//     data: data,
//   });
// };
CategoryService.addSubCategory = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("description", data.description); 
  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }


  return fetch({
    url: `${ApiConstant.SUB_CATEGORY_URL}?category_id=${data.category_id}&action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
