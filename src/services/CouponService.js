import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};


CouponService.addCoupon = function (data,action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });
  return fetch({
    url: `${ApiConstant.COUPON_URL}?action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
CouponService.getAllCoupon = function (pageData) {
  return fetch({
    url: ApiConstant.COUPON_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
export default CouponService;
