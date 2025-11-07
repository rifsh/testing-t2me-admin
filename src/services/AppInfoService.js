import { ApiConstant } from "constants/ApiConstant";
import fetch from "auth/FetchInterceptor";
import Utils from "utils";
import { CDN_ASSETS_PATH } from "configs/AppConfig";

const AppInfoService = {};

AppInfoService.getInfo = async function () {
  try {
    console.log("FETCHING GET INFOS");

    const response = await window.fetch(
      `${CDN_ASSETS_PATH}${ApiConstant.BUCKET_INFO_KEY}`,
      {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    throw new Error(error.message || "Failed to fetch FAQs");
  }
};

AppInfoService.updateInfo = function (data) {
  const formData = Utils.createFormData(data, {
    fileKeys: ["maintenance_image", "isComingSoonImage", "banner"],
    skipEmpty: true,
  });
  return fetch({
    url: `${ApiConstant.INFO_UPLOAD_URL}`,
    method: "put",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export default AppInfoService;
