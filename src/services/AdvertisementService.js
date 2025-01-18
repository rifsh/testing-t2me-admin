import fetch from "auth/FetchInterceptor";
import { ApiConstant } from "constants/ApiConstant";
import Utils from "utils";
import { handleAction } from "utils/api/warning-submit-util";

const AdvertisementService = {};

AdvertisementService.fetchAdBanners = function (pageData) {
  return fetch({
    url: ApiConstant.ADVERTISEMENT_BANNER_URL,
    method: "get",
    params: Utils.filterParams(pageData),
  });
};

AdvertisementService.addAdBanner = function (data, action) {
  const encodedAction = encodeURIComponent(handleAction(action));

  const formData = Utils.createFormData(data, {
    fileKeys: ['media_path'],
    skipEmpty: true
  });
  if (data.media_path && Array.isArray(data.media_path)) {
    data.media_path.forEach((image) => {
      formData.append("media_path", image.originFileObj);
    });
  }

  console.log("----------------",formData);
  

  return fetch({
    url: `${ApiConstant.ADVERTISEMENT_BANNER_URL}?action=${encodedAction}`,
    method: "POST",
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};



export default AdvertisementService;
