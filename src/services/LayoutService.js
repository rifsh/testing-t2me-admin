import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const LayoutService = {};



LayoutService.addFooter = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  }); 
  return fetch({
    url: `${ApiConstant.OFFER_URL}?action=${encodedAction}`,
    method: "post",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

LayoutService.editOffer = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));
  return fetch({
    url: `${ApiConstant.OFFER_URL}/${data.id}?action=${encodedAction}`,
    method: "put",
    data: data,
  });
};
LayoutService.getAllFooter = function (pageData) {
  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};
export default LayoutService;
