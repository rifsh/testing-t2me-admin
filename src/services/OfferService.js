import fetch from "auth/FetchInterceptor";
import { getCurrentUser, getUserRole } from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const OfferService = {};

OfferService.addOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ["thumbnail_image"],
    skipEmpty: true,
  });

  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_URL,
    ApiConstant.ORGANIZER_OFFER_URL
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

OfferService.editOffer = function (
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
  return fetch({
    url: `${ApiConstant.OFFER_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: formData,
    params: Utils.filterParams(pageData),
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

OfferService.editOfferStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_STATUS_URL,
    ApiConstant.ORGANIZER_OFFER_STATUS_URL
  );
  return fetch({
    url: `${offreUrl}/${data.id}?action=${encodedAction}`,
    method: "put",
    params: Utils.filterParams(pageData),
    data: data,
  });
};

OfferService.getAllOffer = function (pageData) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_URL,
    ApiConstant.ORGANIZER_OFFER_URL
  );

  return fetch({
    url: offreUrl,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

OfferService.fetchOfferDetails = function (offerId) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_DETAIL_URL,
    ApiConstant.ORGANIZER_OFFER_DETAIL_URL
  );

  return fetch({
    url: `${offreUrl}?offer_id=${offerId}`,
    method: "get",
  });
};

OfferService.validateOfferCoupon = function (offers, coupons) {
  const offerIds = offers.map((offer) => `offer_id=${offer.id}`).join("&");
  const couponIds = coupons.map((coupon) => `coupon_id=${coupon.id}`).join("&");
  return fetch({
    url: `${ApiConstant.OFFER_COUPON_VALIDATE_URL}?${offerIds}&${couponIds}`,
    method: "get",
  });
};

export default OfferService;
