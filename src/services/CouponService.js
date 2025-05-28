import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};

CouponService.addCoupon = function (data, action) {
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
    url: offreUrl,
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      action: handleAction(action),
    },
  });
};

CouponService.editCoupon = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
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
    url: `${offreUrl}/${data.id}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
  });
};

CouponService.editCouponStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_STATUS_URL,
    ApiConstant.ORGANIZER_COUPON_STATUS_URL,
    pageData.isOrganizer
  );

  return fetch({
    url: `${offreUrl}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: handleAction(action),
      ...Utils.filterParams(pageData),
    },
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
    url: offreUrl,
    method: "get",
    params: { coupon_id: couponId },
  });
};

export default CouponService;
