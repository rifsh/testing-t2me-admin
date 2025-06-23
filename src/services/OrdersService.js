import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";

const OrderService = {};

OrderService.getEventOrders = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_ORDERS_LIST}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
OrderService.getEventOrderDetailsDate = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_ORDERS_DETAILS_DATE}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
OrderService.getEventOrderDetailsTime = function (pageData) {
  return fetch({
    url: `${ApiConstant.EVENT_ORDERS_DETAILS_TIME}`,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

export default OrderService;
