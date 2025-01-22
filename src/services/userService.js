import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const UserService = {};
UserService.getAllRoles = function (pageData) {
  return fetch({
    url: `${ApiConstant.ROLES_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
UserService.getAllUsers = function (pageData) {
  return fetch({
    url: "/api/v1/auth/secured/users/",
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
UserService.getSingleUsers = function (pageData) {
  return fetch({
    url: `${ApiConstant.SINGLE_USER_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
UserService.editUser = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.USER_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
UserService.createUser = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });
  return fetch({
    url: `${ApiConstant.REGISTER_USER_URL}?action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export default UserService;
