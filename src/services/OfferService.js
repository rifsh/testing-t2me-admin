import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const OfferService = {};



OfferService.addOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("discount_percentage", data.discount_percentage);
  if (data.start_date) {
    formData.append("start_date", data.start_date);
  }
  if (data.end_date) {
    formData.append("end_date", data.end_date);
  }
  formData.append("max_uses", data.max_uses);
  formData.append("key_words", data.key_words);
  formData.append("date_required", data.date_required ? "true" : "false"); 
  if (data.thumbnail_image && data.thumbnail_image[0]) {
    formData.append("thumbnail_image", data.thumbnail_image[0].originFileObj);
  }

  return fetch({
    url: `${ApiConstant.OFFER_URL}?action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
