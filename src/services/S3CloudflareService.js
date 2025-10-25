import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const S3CloudflareService = {};

S3CloudflareService.deleteImage = function (params) {
  return fetch({
    url: ApiConstant.S3_IMAGE_DELETE,
    method: "get",
    params: Utils.filterParams(params),
  });
};
export default S3CloudflareService;
