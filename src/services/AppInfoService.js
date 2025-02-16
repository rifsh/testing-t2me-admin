import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";

const AppInfoService = {};

AppInfoService.getInfo = function () {
  console.log("FETCHING INFOS");

  return fetch({
    url: `${ApiConstant.INFO_GET_URL}`,
    method: "get",
  });
};

AppInfoService.updateInfo = function (data) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["maintenance_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.INFO_UPLOAD_URL}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default AppInfoService;
