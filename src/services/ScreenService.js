import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const ScreenService = {};


ScreenService.addScreen = function (data, action) {
    const encodedAction = encodeURIComponent(handleAction(action));
    return fetch({
        url: `${ApiConstant.ADD_SCREEN_URL}?action=${encodedAction}`,
        method: "post",
        data: data,
    });
};
ScreenService.editScreen = function (
    updatedScreen,
    action,
) {
    const encodedAction = encodeURIComponent(handleAction(action));

    return fetch({
        url: `${ApiConstant.EDIT_SCREEN_URL}?screen_id=${updatedScreen.id}&action=${encodedAction}`,
        method: "put",
        data: updatedScreen
    });
};
ScreenService.editScreenStatus = function (
    updatedScreen,
    action,
) {
    const encodedAction = encodeURIComponent(handleAction(action));

    return fetch({
        url: `${ApiConstant.EDIT_SCREEN_STATUS_URL}?screen_id=${updatedScreen.id}&action=${encodedAction}`,
        method: "put",
        data: updatedScreen
    });
};
ScreenService.getScreens = function (pageData) {
    return fetch({
        url: ApiConstant.GET_ALL_SCREEN_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
ScreenService.getScreenById = function (screen_id) {
    return fetch({
        url: ApiConstant.GET_SCREEN_ById_URL,
        method: "get",
        params: Utils.filterParams(screen_id),
    });
};
ScreenService.fetchScreenTech = function (pageData) {
    return fetch({
        url: ApiConstant.FETCH_SCREEN_TECH_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
ScreenService.fetchScreenAudio = function (pageData) {
    return fetch({
        url: ApiConstant.FETCH_SCREEN_AUDIO_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
ScreenService.fetchScreenFeatures = function (pageData) {
    return fetch({
        url: ApiConstant.FETCH_SCREEN_FEATURE_URL,
        method: "get",
        params: Utils.filterParams(pageData),
    });
};
export default ScreenService;
