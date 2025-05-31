import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const permissionService = {};

permissionService.getPermissionData = function (pageData) {
    return fetch({
        url: ApiConstant.GET_PERSMISSIONS,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
permissionService.getPermissionDisplayNames = function (pageData) {
    return fetch({
        url: ApiConstant.GET_PERSMISSIONS_DISPLAY_NAMES,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
permissionService.addPermissionAccess = function (data) {
    return fetch({
        url: `${ApiConstant.ADD_PERSMISSIONS_ACCESS}`,
        method: "post",
        data: data,
    });
};

export default permissionService;
