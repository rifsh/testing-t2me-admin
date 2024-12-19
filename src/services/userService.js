import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const UserService = {};
UserService.getAllRoles = function () {
  return fetch({
    url: `${ApiConstant.ROLES_URL}`,
    method: "get",
  });
};
UserService.getAllUsers = function () {
  return fetch({
    url: "/api/v1/auth/secured/users/",
    method: "get",
  })
    .then((response) => {
      console.log("fetchedUsers:", response.data);
      return response.data;
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      throw error;
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
UserService.createUser = function (data,action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.REGISTER_USER_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};

export default UserService;
