import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const LayoutService = {};



LayoutService.addFooter = function (data, action) {
  const encodedAction = handleAction(action);
  const formData = Utils.createFormData(data, {
    fileKeys: ['thumbnail_image'],
    skipEmpty: true
  });

  return fetch({
    url: ApiConstant.OFFER_URL,
    method: "post",
    data: formData,
    params: {
      action: encodedAction,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

LayoutService.editOffer = function (data, action) {
  const encodedAction = handleAction(action);

  return fetch({
    url: `${ApiConstant.OFFER_URL}/${data.id}`,
    method: "put",
    data: data,
    params: {
      action: encodedAction,
    },
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
