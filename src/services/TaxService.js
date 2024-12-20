import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const TaxService = {};


TaxService.addTax = function (data,action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TAX_URL}?action=${encodedAction}&country_id=${data.country_id}`,
    method: "post",
    data: data,
  });
};
TaxService.editTax = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TAX_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
TaxService.fetchAvailableTaxCategory = function () {
  return fetch({
    url: ApiConstant.AVAILABLE_TAX_CATEGORY_URL,
    method: "get",
  });
};
TaxService.fetchAllTax = function (country_id) {
  return fetch({
    url: `${ApiConstant.TAX_URL}?country_id=${country_id}`,
    method: "get",
  });
};
export default TaxService;
