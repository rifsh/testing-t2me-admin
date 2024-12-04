import fetch from "auth/FetchInterceptor";
import {
  COUPON_URL,

} from "constants/ApiConstant";

const CouponService = {};

CouponService.addCoupon = function (data) {
  return fetch({
    url: COUPON_URL,
    method: "post",
    data: data,
  });
};

CouponService.getAllCoupon = function (place) {
  return fetch({
    url: COUPON_URL,
    method: "get",
  });
};
export default CouponService;
