import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TaxService = {};

TaxService.addTax = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TAX_URL}?action=${encodedAction}&country_id=${data.country_id}`,
    method: "post",
    data: data,
  });
};
TaxService.editTax = function (data, action, pageData = { page: 1, size: 10 }) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.TAX_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

TaxService.editTaxStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.TAX_STATUS_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
    params: Utils.filterParams(pageData),
  });
};

TaxService.fetchAvailableTaxCategory = function () {
  return fetch({
    url: ApiConstant.AVAILABLE_TAX_CATEGORY_URL,
    method: "get",
  });
};
TaxService.fetchAllTax = function (pageData) {
  return fetch({
    url: `${ApiConstant.TAX_URL}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

TaxService.validateTax = function (taxIds) {
  const queryString = taxIds.map((id) => `Tax_id=${id.id}`).join("&");
  return fetch({
    url: `${ApiConstant.TAX_VALIDATE_URL}?${queryString}`,
    method: "get",
  });
};

export default TaxService;
