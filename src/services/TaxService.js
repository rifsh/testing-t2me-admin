import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const TaxService = {};

TaxService.addTax = function (data, action) {
  return fetch({
    url: ApiConstant.TAX_URL,
    method: "post",
    data: data,
    params: {
      action: handleAction(action),
      country_id: data.country_id,
    },
  });
};
TaxService.editTax = function (data, action, pageData = { page: 1, size: 10 }) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.TAX_URL}/${data.id}`,
    method: "put",
    data: formData,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
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
  return fetch({
    url: `${ApiConstant.TAX_STATUS_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
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
  const params = taxIds.map((idObj) => idObj.id).map((id) => ['Tax_id', id]);
  return fetch({
    url: ApiConstant.TAX_VALIDATE_URL,
    method: "get",
    params: Object.fromEntries(params),
  });
};

export default TaxService;
