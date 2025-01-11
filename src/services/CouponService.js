import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};


CouponService.addCoupon = function (data,action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("discount_percentage", data.discount_percentage);
  formData.append("min_purchase_amount", data.min_purchase_amount);
  
  if (data.start_date) {
    formData.append("start_date", data.start_date);
  }
  if (data.end_date) {
    formData.append("end_date", data.end_date);
  }
  formData.append("max_uses", data.max_uses);
  formData.append("coupon_code", data.coupon_code);

  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }
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
