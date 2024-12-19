import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};


CouponService.addCoupon = function (data,action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.COUPON_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};
CouponService.editCoupon = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.COUPON_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
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
