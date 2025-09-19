import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const QrVerificationService = {};

QrVerificationService.getUserData = function (pageData) {
    return fetch({
        url: ApiConstant.USER_LIST,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
// QrVerificationService.getPermissionDisplayNames = function (pageData) {
//     return fetch({
//         url: ApiConstant.GET_PERSMISSIONS_DISPLAY_NAMES,
//         method: "get",
//         params: Utils.filterParams(pageData),
//     });
// };
// QrVerificationService.addPermissionAccess = function (data) {
//     return fetch({
//         url: `${ApiConstant.ADD_PERSMISSIONS_ACCESS}`,
//         method: "put",
//         data: data,
//     });
// };

export default QrVerificationService;
