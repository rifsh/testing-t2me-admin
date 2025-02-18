import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";

const FooterService = {};

FooterService.getFooterData = function () {
  console.log("FETCHING Footer");

  return fetch({
    url: `${ApiConstant.FOOTER_GET_URL}`,
    method: "get",
  });
};

FooterService.createFooter = function (data) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["app_logo", "payment_logos"],
    skipEmpty: true,
  });

  console.log(formData, "THIS IS FORMDATA FOOTERT");

  return fetch({
    url: `${ApiConstant.FOOTER_UPLOAD_URL}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default FooterService;
