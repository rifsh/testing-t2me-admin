import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const PaymentService = {};

PaymentService.getAllPaymentServices = function (pageData) {
  return fetch({
    url: ApiConstant.PAYMENT_SERVICE,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

PaymentService.getAllPayment = function (pageData) {
  return fetch({
    url: ApiConstant.PAYMENT_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

PaymentService.getPaymentsMethod = function () {
  return fetch({
    url: ApiConstant.PAYMENT_METHOD,
    method: "get",
  });
};

PaymentService.addPayment = function (paymentData, action) {
  console.log(paymentData, "paymentData");
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(paymentData, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  return fetch({
    url: `${ApiConstant.PAYMENT_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
  });
};

export default PaymentService;
