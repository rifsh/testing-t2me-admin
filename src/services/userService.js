import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const UserService = {};
UserService.getAllRoles = function () {
  return fetch({
    url: `${ApiConstant.ROLES_URL}`,
    method: "get",
  });
};
UserService.getAllUsers = function (pageData) {
  return fetch({
    url: "/api/v1/auth/secured/users/",
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
  const formData = new FormData();

  formData.append("username", data.username);
  formData.append("email", data.email);
  formData.append("password", data.password);
  if (data.event_ids) {
    formData.append("event_ids", data.event_ids);
  }
  if (data.position_id){
    formData.append("position_id", data.position_id);
  }

  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }
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
