import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const OfferService = {};

OfferService.addOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.OFFER_URL}?action=${encodedAction}`,
    method: "post",
    data: data,
  });
};
OfferService.editOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.OFFER_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
OfferService.getAllOffer = function (pageData) {
  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
export default OfferService;
