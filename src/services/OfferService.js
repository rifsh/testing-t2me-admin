import fetch from "auth/FetchInterceptor";
import {
  getCurrentUser,
  getUserRole,
  isOrganizer,
} from "configs/UserAccessConfig";
import { ApiConstant } from "constants/ApiConstant";
import { UserRoleConstants } from "constants/UserRoleConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";
import { utils } from "xlsx";

const OfferService = {};

OfferService.addOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  // const formData = Utils.createFormData(data, {
  //   fileKeys: ["thumbnail_image"],
  //   skipEmpty: true,
  // });

  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_URL,
    ApiConstant.ORGANIZER_OFFER_URL,
    isOrganizer()
  );
  return fetch({
    url: `${offreUrl}?action=${encodedAction}`,
    method: "post",
    data: data,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};

OfferService.editOffer = function (data, action, pageData) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const offerUrlBase = Utils.getUrlByUserRole(
    ApiConstant.OFFER_URL,
    ApiConstant.ORGANIZER_OFFER_URL,
    isOrganizer()
  );
  const offerUrl = isOrganizer()
    ? `${offerUrlBase}?action=${encodedAction}`
    : `${offerUrlBase}/${data.id}?action=${encodedAction}`;
  const params = {
    action: encodedAction,
    ...(pageData ? Utils.filterParams(pageData) : {}),
  };

  return fetch({
    url: `${offerUrl}`,
    method: "put",
    data: data,
    params: params,
    // headers: {
    //   "Content-Type": "multipart/form-data",
    // },
  });
};

OfferService.makeChangeOffer = function (data, action, pageData) {
  console.log(data, "DATA IN SERVICE");

  const encodedAction = encodeURIComponent(handleAction(action));

  const offerUrl = ApiConstant.ORGANIZER_OFFER_MAKE_CHANGES_URL;
  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: `${offerUrl}`,
    method: "put",
    data: data,
    params: params,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// OfferService.editOfferStatus = function (
//   data,
//   action,
//   pageData = { page: 1, size: 10 }
// ) {
//   const encodedAction = encodeURIComponent(handleAction(action));

//   const offreUrl = Utils.getUrlByUserRole(
//     ApiConstant.OFFER_STATUS_URL,
//     ApiConstant.ORGANIZER_OFFER_STATUS_URL,
//     data.isOrganizer
//   );
//   return fetch({
//     url: `${offreUrl}/${data.id}?action=${encodedAction}`,
//     method: "put",
//     params: Utils.filterParams(pageData),
//     data: data,
//   });
// };

//  new
OfferService.editOfferStatus = function (
  data,
  action,
  pageData = { page: 1, size: 10 }
) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const offerUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_STATUS_URL,
    ApiConstant.ORGANIZER_OFFER_STATUS_URL,
    data.isOrganizer
  );

  const params = {
    action: encodedAction,
    ...Utils.filterParams(pageData),
  };

  return fetch({
    url: `${offerUrl}/${data.id}`,
    method: "put",
    params: params,
    data: data,
  });
};

OfferService.getAllOffer = function (pageData) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_URL,
    ApiConstant.ORGANIZER_OFFER_URL,
    pageData.isOrganizer
  );

  return fetch({
    url: offreUrl,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

OfferService.fetchOfferDetails = function (params) {
  const offreUrl = Utils.getUrlByUserRole(
    ApiConstant.OFFER_DETAIL_URL,
    ApiConstant.ORGANIZER_OFFER_DETAIL_URL,
    isOrganizer()
  );

  return fetch({
    url: `${offreUrl}`,
    method: "get",
    params: Utils.filterParams(params),
  });
};

OfferService.validateOfferCoupon = function (offers, coupons) {
  const offerIds = offers.map((offer) => offer.id);
  const couponIds = coupons.map((coupon) => coupon.id);

  const params = {
    offer_id: offerIds,
    coupon_id: couponIds,
  };

  return fetch({
    url: ApiConstant.OFFER_COUPON_VALIDATE_URL,
    method: "get",
    params: params,
  });
};
OfferService.getAvailableOfferDays = function (params) {
  return fetch({
    url: ApiConstant.OFFER_AVAILABLE_DAYS_URL,
    method: "get",
    params: Utils.filterParams(params),
  });
};

export default OfferService;
