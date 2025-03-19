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

export default ScreenService;
