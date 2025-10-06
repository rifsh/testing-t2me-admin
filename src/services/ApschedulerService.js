import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const apschedulerService = {};

apschedulerService.getAllapschedulerLogs = function (pageData = {}) {
    const defaultParams = {
        page: pageData.page || 1,
        size: pageData.size || 10,
        ...pageData,
    };
    return fetch({
        url: ApiConstant.APSCHEDULER_LOGGER_URL,
        method: "get",
        params: Utils.filterParams(defaultParams),
    });
};

export default apschedulerService;
