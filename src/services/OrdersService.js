import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const OrderService = {};

OrderService.fethEventOrders = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_ORDERS_LIST}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
OrderService.fethEventOrderDetails = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_ORDERS_DETAILS}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

export default OrderService;
