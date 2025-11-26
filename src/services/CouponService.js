import fetch from "auth/FetchInterceptor";
import { isOrganizer } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const CouponService = {};

CouponService.addCoupon = function (data, action) {
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });
  console.log("couponFormdatasssss", data);

  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_URL,
    ApiConstant.ORGANIZER_COUPON_URL,
    isOrganizer()
  );

  return fetch({
    url: offreUrl,
    method: "post",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
    params: {
      action: handleAction(action),
    },
  });
};
CouponService.generateCouponCode = function (data) {
  return fetch({
    url: ApiConstant.COUPON_CODE_GENERATE_URL,
    method: "post",
    data: data,
  });
};

CouponService.editCoupon = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_URL,
    ApiConstant.ORGANIZER_COUPON_UPDATE_URL,
    isOrganizer()
  );

  return fetch({
    url: `${offreUrl}/${data.id}`,
    method: "put",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
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
CouponService.getAllTrackCoupon = function (pageData) {
  const couponUrl = ApiConstant.ORGANIZER_COUPON_URL;
  return fetch({
    url: couponUrl,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

CouponService.fetchCouponDetails = function (couponId) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.COUPON_DETAILS_URL,
    ApiConstant.ORGANIZER_COUPON_DETAILS_URL,
    isOrganizer()
  );

  return fetch({
    url: offreUrl,
    method: "get",
    params: { coupon_id: couponId },
  });
};

export default CouponService;
