import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const PaymentService = {};

PaymentService.getAllPayment = function (pageData) {
    return fetch({
        url: `${ApiConstant.PAYMENT_URL}/list`,
        method: "get",
        params: Utils.filterParams(pageData)
    })
}

export default PaymentService;