import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const ReportService = {};

ReportService.fetchReports = function (pageData, contentType = null) {
  const params = {
    ...Utils.filterParams(pageData),
    ...(contentType && { content_type: contentType }),
  };

  return fetch({
    url: ApiConstant.ADMIN_REPORT,
    method: "get",
    params: params,
  });
};

export default ReportService;
