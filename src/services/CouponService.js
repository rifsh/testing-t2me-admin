import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};

CouponService.addCoupon = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_URL,
    ApiConstant.ORGANIZER_COUPON_URL,
    data.isOrganizer
  );
  return fetch({
    url: `${offreUrl}?action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
CouponService.editCoupon = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  console.log(data, "DATA IN SERVICE");

  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_URL,
    ApiConstant.ORGANIZER_COUPON_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: `${offreUrl}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

CouponService.editCouponStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_STATUS_URL,
    ApiConstant.ORGANIZER_COUPON_STATUS_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: `${offreUrl}/${data.id}?action=${encodedAction}`,
    method: "put",
    params: Utils.filterParams(pageData),
    data: data,
  });
};

CouponService.getAllCoupon = function (pageData) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_URL,
    ApiConstant.ORGANIZER_COUPON_URL,
    pageData.isOrganizer
  );
  return fetch({
    url: offreUrl,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

CouponService.fetchCouponDetails = function (couponId) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_DETAILS_URL,
    ApiConstant.ORGANIZER_COUPON_DETAILS_URL
  );
  return fetch({
    url: `${offreUrl}?coupon_id=${couponId}`,
    method: "get",
  });
};
export default CouponService;
