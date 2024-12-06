import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";

const OfferService = {};

OfferService.addOffer = function (data) {
  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "post",
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
