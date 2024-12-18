import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import { handleAction } from "utils/api/warning-submit-util";

const OfferService = {};

OfferService.addOffer = function (data) {
  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "post",
    data: data,
  });
};
OfferService.editOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.EDIT_OFFER_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
OfferService.getAllOffer = function (place) {
  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "get",
  });
};
export default OfferService;
