import fetch from "auth/FetchInterceptor";
import {
  OFFER_URL,
} from "constants/ApiConstant";

const OfferService = {};

OfferService.addOffer = function (data) {
  return fetch({
    url: OFFER_URL,
    method: "post",
    data: data,
  });
};

OfferService.getAllOffer = function (place) {
  return fetch({
    url: OFFER_URL,
    method: "get",
  });
};
export default OfferService;
