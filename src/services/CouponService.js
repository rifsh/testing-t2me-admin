import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const CouponService = {};

CouponService.addCoupon = function (data) {
  return fetch({
    url: ApiConstant.COUPON_URL,
    method: "post",
    data: data,
  });
};

CouponService.getAllCoupon = function (place) {
  return fetch({
    url: ApiConstant.COUPON_URL,
    method: "get",
  });
};
export default CouponService;
